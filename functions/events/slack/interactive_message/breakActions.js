/**
 * breakActions.js is the handler for the interactive buttons related to Break
 * @author Akanksha Kevalramani
 */

// Dependencies
const axios = require('axios');
const helper = require('../../../../helper.js');
const wellness = require('../command/wellness.js');
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});
const messages = lib.slack.messages['@0.4.3'];
const query = lib.airtable.query['@0.1.11'];
const users = lib.slack.users['@0.3.19'];
const conversations = lib.slack.conversations['@0.0.9'];
const dialog = lib.slack.dialog['@0.0.4'];

// Variable declarations
let breakDays, breakInterval, breakStartTime, breakEndTime;

/**
* An HTTP endpoint that acts as a webhook for Slack interactive_message event
* If the user tries to toggle the break reminders, the database is updated with
* the new value and their messages are rescheduled. If the user wishes to change
* the schedule of break reminders, they're shown a dialog with their options.
*
* @param {object} event Slack interactive_message event body (raw)
* @returns {object} workflow The result of your workflow steps
*/
module.exports = async (event, context) => {

  // Prepare workflow object to store API responses
  let workflow = {};

  // Retrieve and store the action that was taken
  let actionTaken = `${event.actions[0]["name"]}`,
      actionValue = `${event.actions[0]["value"]}`;

  // Retrieve the user's data from the database
  let userRecord = await query.select({
    table: `Wellness Subscribers`,
    where: {
      'User ID': `${event.user.id}`
    }
  });

  // Retrieving partial user information because I'm trying to open the dialog as soon as possible - event trigger_id expires in 3 seconds
  let user = {
               break: userRecord.rows[0].fields['Break Bool'],
               breakTimes: userRecord.rows[0].fields['Break Times'],
               breakDays: userRecord.rows[0].fields['Break Days'],
               breakEnd: userRecord.rows[0].fields['Break End'],
               breakInterval: userRecord.rows[0].fields['Break Interval']
             };

   // If user is trying to change the schedule of their break reminders
   if (actionTaken == 'schedule') {
     workflow.response = await dialog.open({
       dialog: {
         "callback_id": "breakDialog",
         "title": "Break Settings",
         "submit_label": "Save",
         "state": `${event.response_url}`,
         "elements": [
           {
             "label": "What days should I send you the reminders on?",
             "type": "select",
             "name": "breakDays",
             "value": user.breakDays,
             "options": helper.dayRangesAttachment
           },
           {
             "label": "What time should we send you the first reminder?",
             "type": "select",
             "name": "breakStartTime",
             "value": user.breakTimes.split(",")[0],
             "options": helper.timeRangesAttachment
           },
           {
             "label": "What time should we send you the last reminder?",
             "type": "select",
             "name": "breakEndTime",
             "value": user.breakEnd,
             "options": helper.timeRangesAttachment
           },
           {
             "label": "How often would you like to be reminded?",
             "type": "select",
             "name": "breakInterval",
             "value": user.breakInterval,
             "options": helper.timeIntervalsAttachment
           }
        ]
      },
      trigger_id: `${event.trigger_id}`
    });
  }
  // If user is turning break reminders on/off
  else if (actionTaken == 'toggle') {
    // Update the database with the new boolean
    var updatingUserRecord = await query.update({
      table: `Wellness Subscribers`,
      where: {
        'User ID': `${event.user.id}`
      },
      fields: {
        'Break Bool': actionValue
      }
    });

    // Retrieve and store user id from event object
    workflow.user = await users.retrieve({
      user: `${event.user.id}`
    });

    user.dailyQuote = userRecord.rows[0].fields['Daily Quote Bool'];
    user.dailyQuoteTime = userRecord.rows[0].fields['Daily Quote Time'];
    user.dailyQuoteDays = userRecord.rows[0].fields['Daily Quote Days'];
    user.hydration = userRecord.rows[0].fields['Hydration Bool'];
    user.hydrationTimes = userRecord.rows[0].fields['Hydration Times'];
    user.hydrationDays = userRecord.rows[0].fields['Hydration Days'];
    user.hydrationEnd = userRecord.rows[0].fields['Hydration End'];
    user.hydrationInterval = userRecord.rows[0].fields['Hydration Interval'];

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

    // Updating the message through HTTP request
    // Note: The message had to be recreated from scratch because Slack doesn't store the original message anywhere in the case of ephemeral messages
    let response = await axios.request({
      url: event.response_url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        replace_original: "true",
        text: helper.settingsText(`${workflow.user.real_name}`),
        attachments: [
           helper.dailyQuoteAttachment(user.dailyQuote, user.dailyQuoteDays, dailyQuoteTime),
           helper.hydrationAttachment(user.hydration, hydrationDays, hydrationInterval, hydrationStartTime, hydrationEndTime),
           helper.breakAttachment(actionValue, breakDays, breakInterval, breakStartTime, breakEndTime), // the attachment that is changing
        	 helper.usageTipsSubscribed
        ]
      })
    });

    // Rescheduling the messages
    let scheduleUserMessages = await lib[`${context.service.identifier}.scheduleUserMessages`]({
      userID: `${event.user.id}`
    });
  }

  return workflow;
};
