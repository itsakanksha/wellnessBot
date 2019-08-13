/**
 * quoteActions.js is the handler for the interactive buttons related to Daily Quote
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

/**
* An HTTP endpoint that acts as a webhook for Slack interactive_message event
* If the user tries to toggle the quote reminders, the database is updated with 
* the new value and their messages are rescheduled. If the user wishes to change 
* the schedule of quote reminders, they're shown a dialog with their options.
* 
* @param {object} event Slack interactive_message event body (raw)
* @returns {object} workflow The result of your workflow steps
*/
module.exports = async (event, context) => {
  
  // Prepare workflow object to store API responses
  let workflow = {};
  
  // Retrieve and store user id from event object
  workflow.user = await users.retrieve({
    user: `${event.user.id}`
  });
  
  // Retrieve and store channel id from event object
  workflow.channel = await conversations.info({
    id: `${event.channel.id}`
  });
  
  // Retrieve and store the action that was taken 
  let actionTaken = `${event.actions[0]["name"]}`,
      actionValue = `${event.actions[0]["value"]}`;
      
  // Fetch user data from database
  let userRecord = await query.select({
    table: `Wellness Subscribers`,
    where: {
      'User ID': `${event.user.id}`
    }
  });

  let user = { id: userRecord.rows[0].fields['User ID'], 
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
       
  // If user is turning daily quote messages on/off
  if (actionTaken == 'toggle') {
    // Update the database with the new boolean
    var updatingUserRecord = await query.update({
      table: `Wellness Subscribers`,
      fields: {
        'Daily Quote Bool': actionValue
      },
    });
    
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
           helper.dailyQuoteAttachment(actionValue, user.dailyQuoteDays, dailyQuoteTime), //attachment that is changing
           helper.hydrationAttachment(user.hydration, hydrationDays, hydrationInterval, hydrationStartTime, hydrationEndTime),
           helper.breakAttachment(user.break, breakDays, breakInterval, breakStartTime, breakEndTime), 
        	 helper.usageTipsSubscribed
        ]
        })
    });
          
    // Rescheduling the messages
    let scheduleUserMessages = await lib[`${context.service.identifier}.scheduleUserMessages`]({
      userID: `${event.user.id}`
    });
      
  }
  // If user is trying to change the schedule of their break reminders
  if (actionTaken == 'schedule') {
    workflow.response = await dialog.open({
      dialog: {
        "callback_id": "quoteDialog",
        "title": "Daily Quote Settings",
        "submit_label": "Save",
        "state": `${event.response_url}`,
        "elements": [
            {
              "label": "What days should I send you a quote on?",
              "type": "select",
              "name": "dailyQuoteDays",
              "value": user.dailyQuoteDays,
              "options": helper.dayRangesAttachment,
              "value": "0"
            },
            {
              "label": "What time on those days? ",
              "type": "select",
              "name": "dailyQuoteTime",
              "value": user.dailyQuoteTime,
              "options": helper.timeRangesAttachment
            }
         ]
       },
       trigger_id: `${event.trigger_id}`
    });
  }

  return workflow;
};