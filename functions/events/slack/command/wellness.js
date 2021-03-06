/**
 * wellness.js is the handler for all slash commands
 * @author Akanksha Kevalramani
 */

// Dependencies
const async = require('async');
const helper = require('../../../../helper.js');
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});
const messages = lib.slack.messages['@0.4.3'];
const query = lib.airtable.query['@0.1.11'];
const users = lib.slack.users['@0.3.19'];
const conversations = lib.slack.conversations['@0.1.1'];
const dialog = lib.slack.dialog['@0.0.4'];
const scheduledMessages = lib.slack.scheduledMessages['@0.0.3'];

// Variable declarations
let user, dailyQuoteTime, hydrationDays, hydrationInterval, hydrationStartTime, hydrationEndTime, breakDays, breakInterval, breakStartTime, breakEndTime;

/**
* An HTTP endpoint that acts as a webhook for Slack command event
* This function handles the following slash commands:
* - /wellness
* - /wellness settings
* - /wellness subscribe
* - /wellness unsubscribe
* - /wellness help
* - /wellness quote
* - and it also handles invalid commands
*
* @param {object} event Slack command event body (raw)
* @returns {object} workflow The result of your workflow steps
*/
module.exports = async (event, context) => {

  console.log('successfully deploying from console pls ');

  // Prepare workflow object to store API responses
  let workflow = {};

  // Retrieve and store user id from event object
  workflow.user = await users.retrieve({
    user: `${event.user_id}`
  });

  // Retrieve and store channel id from event object
  workflow.channel = await conversations.info({
    id: `${event.channel_id}`
  });

  var command = `${event.command}`; // Slash command entered by the user
  var params = `${event.text}`; // Extra parameters added by user
  console.log('params: ' + params);

  // Check if user exists in database
  var countQueryResult = await query.count({
    table: `Wellness Subscribers`,
    where: {
      'User ID': `${workflow.user.id}`
    },
    limit: {
      'count': 0,
      'offset': 0
    }
  });
  let userSubscribed = ((countQueryResult).count != 0);

  // Parsing and responding to commands
  try {
    if (command == '/wellness') {
      if (userSubscribed) {
        // Retrieve user record from database
        var userRecord = await query.select({
          table: `Wellness Subscribers`,
          where: {
            'User ID': `${workflow.user.id}`
          }
        });
        user = { id: userRecord.rows[0].fields['User ID'],
                 name: userRecord.rows[0].fields['Name'],
                 tz: userRecord.rows[0].fields['Timezone Offset'],
                 dailyQuote: userRecord.rows[0].fields['Daily Quote Bool'],
                 hydration: userRecord.rows[0].fields['Hydration Bool'],
                 break: userRecord.rows[0].fields['Break Bool'],
                 hydrationTimes: userRecord.rows[0].fields['Hydration Times'],
                 breakTimes: userRecord.rows[0].fields['Break Times'],
                 dailyQuoteTime: userRecord.rows[0].fields['Daily Quote Time'],
                 hydrationTimes: userRecord.rows[0].fields['Hydration Times'],
                 breakDays: userRecord.rows[0].fields['Break Days'],
                 dailyQuoteDays: userRecord.rows[0].fields['Daily Quote Days'],
                 hydrationDays: userRecord.rows[0].fields['Hydration Days'],
                 hydrationEnd: userRecord.rows[0].fields['Hydration End'],
                 breakEnd: userRecord.rows[0].fields['Break End'],
                 hydrationInterval: userRecord.rows[0].fields['Hydration Interval'],
                 breakInterval: userRecord.rows[0].fields['Break Interval']
               };

          // Converting Daily Quote database values to meaningful strings
          dailyQuoteTime = helper.convertMinutesToString(user.dailyQuoteTime);

          // Converting Hydration database values to meaningful strings
          hydrationDays = helper.dayRanges[user.hydrationDays],
          hydrationStartTime = helper.convertMinutesToString(parseInt(user.hydrationTimes.split(",")[0])),
          hydrationInterval = helper.convertIntervalToString(user.hydrationInterval),
          hydrationEndTime = helper.convertMinutesToString(user.hydrationEnd);

          // Converting Break database values to meaningful strings
          breakDays = helper.dayRanges[user.breakDays],
          breakStartTime = helper.convertMinutesToString(parseInt(user.breakTimes.split(",")[0])),
          breakInterval = helper.convertIntervalToString(user.breakInterval),
          breakEndTime = helper.convertMinutesToString(user.breakEnd);

          switch(params) {
            case 'settings':
              /* User is subscribed and typed "/wellness settings"
                 Show settings and give usage tips */
              await messages.ephemeral.create({
                channelId: `${workflow.channel.id}`,
                userId: `${workflow.user.id}`,
                text: helper.settingsText(`${workflow.user.real_name}`),
                attachments: [
                  helper.dailyQuoteAttachment(user.dailyQuote, user.dailyQuoteDays, dailyQuoteTime),
                  helper.hydrationAttachment(user.hydration, hydrationDays, hydrationInterval, hydrationStartTime, hydrationEndTime),
                  helper.breakAttachment(user.break, breakDays, breakInterval, breakStartTime, breakEndTime),
                  helper.usageTipsSubscribed
                ]
              });
              break;

            case 'help':
              /* User typed "/wellness help"
                 Explain to user what WellnessBot is and give usage tips */
              await messages.ephemeral.create({
                channelId: `${workflow.channel.id}`,
                userId: `${workflow.user.id}`,
                text: helper.helpText(`${workflow.user.real_name}`),
                attachments: [helper.usageTipsSubscribed]
              });
              break;

            case 'subscribe':
              /* User is subscribed and typed "/wellness subscribe"
                 Remind user that they're already subscribed */
              await messages.ephemeral.create({
                 channelId: `${workflow.channel.id}`,
                 userId: `${workflow.user.id}`,
                 text: `Hi, ${workflow.user.real_name}! You're already subscribed to receive wellness reminders. :blush: \n\n`,
                 attachments: [ helper.usageTipsSubscribed ]
               });
              break;

            case 'unsubscribe':
              /* User is subscribed and typed "/wellness unsubscribe"
                 Delete existing scheduled messages, remove user from database, and give confirmation message that they've unsubscribed */
              // Getting the all user IM ids
              let listOfIMs = await conversations.list({
                types: "im"
              });
              let user_im_id;

              // Looking for this user's IM id
              for (let i = 0; i < listOfIMs.channels.length; i++) {
                if (`${workflow.user.id}` == listOfIMs.channels[i].user) {
                  user_im_id = listOfIMs.channels[i].id;
                }
              }

              // Retrieving all scheduled messages for this user
              let userScheduledMessages = await scheduledMessages.list({
                channel: user_im_id // (required)
              });

              // Deleting this user's scheduled messages
              await async.mapLimit(userScheduledMessages.scheduled_messages, 10, async (message) => {
                let result = await scheduledMessages.destroy({
                  channel: user_im_id, // (required)
                  scheduled_message_id: message.id // (required)
                });
              });

              // Deleting this user from database
              let result = await query.delete({
                table: 'Wellness Subscribers',
                where: {
                  'User ID': `${workflow.user.id}`
                }
              });

              // Send success message to the user
              if (result.rows.length != 0) {
                await messages.ephemeral.create({
                  channelId: `${workflow.channel.id}`,
                  userId: `${workflow.user.id}`,
                  text: `We're sad to see you go ${workflow.user.real_name} :cry: You've been unsubcribed from wellness reminders.\n\n`,
                  attachments: [ helper.usageTipsUnsubscribed ]
                });
              }
              break;

            case 'quote':
              /* User typed "/wellness quote"
                 Send a random quote */
              await messages.ephemeral.create({
                channelId: `${workflow.channel.id}`,
                userId: `${workflow.user.id}`,
                text: helper.randomStringGenerator('quote'),
                attachments: null
              });
              break;

            case '':
              /* User is subscribed and typed "/wellness"
                 Show settings and give usage tips */
              await messages.ephemeral.create({
                channelId: `${workflow.channel.id}`,
                userId: `${workflow.user.id}`,
                text: helper.settingsText(`${workflow.user.real_name}`),
                attachments: [
                  helper.dailyQuoteAttachment(user.dailyQuote, user.dailyQuoteDays, dailyQuoteTime),
                  helper.hydrationAttachment(user.hydration, hydrationDays, hydrationInterval, hydrationStartTime, hydrationEndTime),
                  helper.breakAttachment(user.break, breakDays, breakInterval, breakStartTime, breakEndTime),
                  helper.usageTipsSubscribed
                ]
              });
              break;

            default:
              /* User typed "/wellness <something>"
                 Send an invalid command error message */
              await messages.ephemeral.create({
                channelId: `${workflow.channel.id}`,
                userId: `${workflow.user.id}`,
                text: helper.randomStringGenerator('invalid_command'),
                attachments: [helper.usageTipsSubscribed]
              });
          }
      }
      else if (!userSubscribed) {
        switch(params) {
          case 'settings':
            /* User is not subscribed and typed "/wellness settings"
               Notify user that they can only change settings after they've subscribed' */
            await messages.ephemeral.create({
              channelId: `${workflow.channel.id}`,
              userId: `${workflow.user.id}`,
              text: `Hi, ` + `${workflow.user.real_name}` + `! Before you can personalize your WellnessBot settings, you need to subscribe to wellness reminders. To do so, simply type \`/wellness subscribe\`.`,
              attachments: [helper.usageTipsUnsubscribed]
            });
            break;

          case 'help':
            /* User typed "/wellness help"
               Explain to user what WellnessBot is and give usage tips */
            await messages.ephemeral.create({
              channelId: `${workflow.channel.id}`,
              userId: `${workflow.user.id}`,
              text: helper.helpText(`${workflow.user.real_name}`),
              attachments: [helper.usageTipsUnsubscribed]
            });
            break;

          case 'subscribe':
            /* User is unsubscribed and typed "/wellness subscribe"
               Give confirmation that they've subscribed and show settings */
             // Add user to database with default values
             workflow.insertQueryResult = await query.insert({
               table: `Wellness Subscribers`,
               fields: {
                 'Timezone Offset': `${workflow.user.tz_offset}`,
                 'Name': `${workflow.user.real_name}`,
                 'User ID': `${workflow.user.id}`,
                 'Daily Quote Bool': 'off',
                 'Hydration Bool': 'off',
                 'Break Bool': 'off',
                 'Daily Quote Time': 540,
                 'Hydration Times': '540,600,660,720,810,870,930,990',
                 'Break Times': '540,600,660,720,810,870,930,990',
                 'Daily Quote Days': 1,
                 'Break Days': 1,
                 'Hydration Days': 1,
                 'Hydration End': 1020,
                 'Break End': 1020,
                 'Hydration Interval': 60,
                 'Break Interval': 60
               }
             });

             // Converting Daily Quote database values to meaningful strings
             dailyQuoteTime = helper.convertMinutesToString(workflow.insertQueryResult.fields['Daily Quote Time']);

             // Converting Hydration database values to meaningful strings
             hydrationDays = helper.dayRanges[workflow.insertQueryResult.fields['Hydration Days']],
             hydrationInterval = helper.convertIntervalToString(parseInt(workflow.insertQueryResult.fields['Hydration Interval'])),
             hydrationStartTime = helper.convertMinutesToString(parseInt(workflow.insertQueryResult.fields['Hydration Times'].split(",")[0])),
             hydrationEndTime = helper.convertMinutesToString(workflow.insertQueryResult.fields['Hydration End']);

             // Converting Break database values to meaningful strings
             breakDays = helper.dayRanges[workflow.insertQueryResult.fields['Break Days']],
             breakInterval = helper.convertIntervalToString(parseInt(workflow.insertQueryResult.fields['Break Interval'])),
             breakStartTime = helper.convertMinutesToString(parseInt(workflow.insertQueryResult.fields['Break Times'].split(",")[0])),
             breakEndTime = helper.convertMinutesToString(workflow.insertQueryResult.fields['Break End']);

             // Send success message to the user
             workflow.response = await messages.ephemeral.create({
               channelId: `${workflow.channel.id}`,
               userId: `${workflow.user.id}`,
               text: `Hi, ${workflow.user.real_name}! Thanks for letting me help you take care of your health throughout your workday :blush: \n You can personalize how often you want me to send you reminders by changing the default settings below! \n\n`,
               attachments: [
                  helper.dailyQuoteAttachment(workflow.insertQueryResult.fields['Daily Quote Bool'], workflow.insertQueryResult.fields['Daily Quote Days'], dailyQuoteTime),
                  helper.hydrationAttachment(workflow.insertQueryResult.fields['Hydration Bool'], hydrationDays, hydrationInterval, hydrationStartTime, hydrationEndTime),
                  helper.breakAttachment(workflow.insertQueryResult.fields['Break Bool'], breakDays, breakInterval, breakStartTime, breakEndTime),
                 helper.usageTipsSubscribed
               ]
             });
            break;

          case 'unsubscribe':
            /* User is unsubscribed and typed "/wellness unsubscribe"
               Remind user that they're already unsubscribed */
            await messages.ephemeral.create({
              channelId: `${workflow.channel.id}`,
              userId: `${workflow.user.id}`,
              text: `Hi, ${workflow.user.real_name}! You're already unsubcribed from wellness reminders.\n\n`,
              attachments: [ helper.usageTipsUnsubscribed ]
            });
            break;

          case 'quote':
            /* User typed "/wellness quote"
               Send a random quote */
            await messages.ephemeral.create({
              channelId: `${workflow.channel.id}`,
              userId: `${workflow.user.id}`,
              text: helper.randomStringGenerator('quote'),
              attachments: null
            });
            break;

          case '':
            /* User is not subscribed and typed "/wellness"
               Explain to user what WellnessBot is and give usage tips */
            await messages.ephemeral.create({
              channelId: `${workflow.channel.id}`,
              userId: `${workflow.user.id}`,
              text: helper.helpText(`${workflow.user.real_name}`),
              attachments: [helper.usageTipsUnsubscribed]
            });
            break;

          default:
            /* User typed "/wellness <something>"
               Send an invalid command error message */
            await messages.ephemeral.create({
              channelId: `${workflow.channel.id}`,
              userId: `${workflow.user.id}`,
              text: helper.randomStringGenerator('invalid_command'),
              attachments: [helper.usageTipsUnsubscribed]
            });
        }
      }
    }
  }
  catch (err) {
    //Failure message in case something went wrong
    await messages.ephemeral.create({
      channelId: `${workflow.channel.id}`,
      userId: `${workflow.user.id}`,
      text: `Uh oh, something went wrong. Please try again in a few minutes.`
    });
  }

  return workflow;

};
