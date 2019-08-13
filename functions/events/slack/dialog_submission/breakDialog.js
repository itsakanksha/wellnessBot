/**
 * breakDialog.js is the handler for the 'Change Schedule' dialog for Breaks
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
* An HTTP endpoint that acts as a webhook for Slack dialog_submission event
* If there are no errors in submission, the database is modified with user's 
* submitted response. The ephemeral message is updated with the latest values
* and the user's messages are rescheduled based on the newly selected times. 
* 
* @param {object} event Slack dialog_submission event body (raw)
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
  
  // Retrieve and store submission values from the dialog
  let days = `${event.submission.breakDays}`,
      startTime = `${event.submission.breakStartTime}`,
      endTime = `${event.submission.breakEndTime}`,
      interval = `${event.submission.breakInterval}`;
  
  // Catch any errors found in the dialog responses
  let errorsFound = helper.catchErrors(startTime, endTime, interval);
  
  // If errors found, let the user know their changes couldn't be applied 
  // Until StdLib can support responding with a field error message directly within the dialog 
  if (errorsFound) {
    console.log(errorsFound);
    await messages.ephemeral.create({
      channelId: `${event.channel.id}`, // (required)
      userId: `${event.user.id}`, // (required)
      text: "*Input Error*",
      attachments: [ helper.inputError ]
    });
  }
  // If errors not found, apply the changes to the database and reschedule the user's messages 
  else {
    // Update the database
    await query.update({
      table: `Wellness Subscribers`,
      where: {
        'User ID': `${event.user.id}`
      },
      fields: {
        'Break Times': helper.calculateTimes(startTime, endTime, interval),
        'Break Interval': parseInt(interval),
        'Break Days': parseInt(days),
        'Break End': parseInt(endTime)
      }
    });
    
    // Fetching the user's latest values from the database
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
  
    // Updating the message through HTTP request
    // Note: The message had to be recreated from scratch because Slack doesn't store the original message anywhere in the case of ephemeral messages
    let response = await axios.request({
      url: event.state,
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
          helper.breakAttachment(user.break, breakDays, breakInterval, breakStartTime, breakEndTime), //attachment that is changing
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