/**
 * scheduleUserMessages.js deletes existing scheduled messages and
 * reschedules messages for a user based on their latest data
 * @author Akanksha Kevalramani
 */

// Dependencies
const async = require('async');
const axios = require('axios');
const helper = require('../helper.js');
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});
const messages = lib.slack.messages['@0.4.3'];
const query = lib.airtable.query['@0.1.11'];
const users = lib.slack.users['@0.3.19'];
const conversations = lib.slack.conversations['@0.1.1'];
const dialog = lib.slack.dialog['@0.0.4'];
const scheduledMessages = lib.slack.scheduledMessages['@0.0.3'];

// Variable declarations
let dateObj = new Date(),
    utcDay = dateObj.getUTCDay(), // 0 is Sunday, 1 is Monday, ... 6 is Saturday
    utcYear = dateObj.getUTCFullYear(),
    utcMonth = dateObj.getUTCMonth(),
    utcDate = dateObj.getUTCDate();

/**
 * This function returns Epoch time in seconds given the userTime stored in
 * minutes (e.g. 60 = 1 AM, 1320 = 10 PM) and the timezone offset of the
 * user. The UTC time is calculated which is then used to calculate the Epoch
 * time.
 *
 * @param {number} userTime       time in minutes
 * @param {number} offsetHours    number of hours offset from UTC
 * @param {number} offsetMinutes  number of minutes offset from UTC
 * @returns {number}
 */
function calculateEpoch(userTime, offsetHours, offsetMinutes) {
  let userHours, userMinutes, utcHours, utcMinutes;

  //userTime is stored in minutes (e.g. 60 = 1 AM, 1320 = 10 PM)
  //userHours and userMinutes is the hours and minutes in military time e.g. 1335 will give 22:15
  userHours = Math.floor(userTime / 60);
  userMinutes = userTime % 60;

  //adding the timezone offset in minutes (to support timezones like UTC +7:30)
  utcMinutes = userMinutes + offsetMinutes;
  if (offsetMinutes!= 0 && userMinutes >= 30) //for timezones like UTC +7:30, if the userMinutes >= 30, then utcMinutes will go beyond 60, so this is fixing that
    utcMinutes = (userMinutes + offsetMinutes) - 60;

  //if offset from UTC is positive, e.g. if UTC +7
  if (offsetHours > 0) {
    utcHours = userHours - offsetHours; //converting userhour to UTC Hour
    if (offsetMinutes!= 0 && userMinutes <= 30) //for timezones like UTC +7:30, if the userMinutes <= 30, then utcHour would be 1 hr behind
      utcHours -= 1;
    if (utcHours <= 0) //above calculation can cause utcHour to become negative up to -7, so this is converting the negative number to military hour
      utcHours = 24 + utcHours;
  }

  //if offset from UTC is negative, e.g. if UTC -7
  if (offsetHours < 0) {
    utcHours = userHours - offsetHours; //converting userhour to UTC Hour
    if (offsetMinutes!= 0 && userMinutes >= 30) //for timezones like UTC -7:30, if the userMinutes >= 30, then utcHour would be 1 hr ahead
      utcHours += 1;
    if (utcHours > 24) //above calculation can cause utcHour to go beyound 24, so this is converting the overflowed hour to military hour
      utcHours = utcHours % 24;
  }

  return Date.UTC(utcYear,utcMonth,utcDate,utcHours,utcMinutes,0,0)/1000; //returning epoch time in seconds
}

/**
* An HTTP endpoint that acts as a webhook for Scheduler daily event
* @returns {object} workflow The result of your workflow steps
*/
module.exports = async (userID) => {

  console.log('starting to reschedule messages');
  // Prepare workflow object to store API responses
  let workflow = {};

  // Retrieve the user's data from the database
  let userRecord = await query.select({
    table: `Wellness Subscribers`,
    where: {
      'User ID': userID
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


  console.log('Daily Quote Bool : ' + user.dailyQuote);
  console.log('Hydration Reminders Bool : ' + user.hydration);
  console.log('Break Reminders Bool : ' + user.break);

  // Getting the all user IM ids
  let listOfIMs = await conversations.list({
    types: "im"
  });

  // Fetching the IM id for this user
  let im_id;
  for (let i = 0; i < listOfIMs.channels.length; i++) {
    if (userID == listOfIMs.channels[i].user) {
      im_id = listOfIMs.channels[i].id;
    }
  }

  // Retrieving all scheduled messages for this user
  let userScheduledMessages = await scheduledMessages.list({
    channel: im_id // (required)
  });

  console.log('SCHEDULED MESSAGES BEFORE DELETING: ' + userScheduledMessages.scheduled_messages.length + '\n\n');
  //console.log(userScheduledMessages);

  // Deleting this user's scheduled messages
  await async.mapLimit(userScheduledMessages.scheduled_messages, 10, async (message) => {
    let result = await scheduledMessages.destroy({
      channel: im_id, // (required)
      scheduled_message_id: message.id // (required)
    });
  });


  // Retrieving all scheduled messages for this user
  let userScheduledMessages3 = await scheduledMessages.list({
    channel: im_id // (required)
  });

  console.log('SCHEDULED MESSAGES AFTER DELETING: ' + userScheduledMessages3.scheduled_messages.length + '\n\n');
  //console.log(userScheduledMessages);

  // Figuring out the offset hours and minutes from UTC based on the user timezone offset provided by Slack
  let offsetHours, offsetMinutes;
  if (user.tz < 0)
    offsetHours = Math.ceil(user.tz/3600);
  else
    offsetHours = Math.floor(user.tz/3600);

  if (user.tz % 3600 != 0)
    offsetMinutes = 30;
  else
    offsetMinutes = 0;

  // Scheduling Daily Quote Message if the user has turned it on
  if (user.dailyQuote == 'on') {
    //if today is within the day range user has selected
    if (helper.withinDayRange[user.breakDays].includes(utcDay)) {
      let epoch_date = calculateEpoch(parseInt(user.dailyQuoteTime), offsetHours, offsetMinutes);
      if (epoch_date > Date.now()/1000) { // to avoid time_in_past error
        await messages.schedule({
          id: im_id,
          postAt: epoch_date.toString(),
          text: helper.randomStringGenerator('quote')
        });
      }
    }
  }

  // Scheduling Hydration reminders if the user has turned it on
  if (user.hydration == 'on') {
    //if today is within the day range user has selected
    if (helper.withinDayRange[user.hydrationDays].includes(utcDay)) {
      let hydrationTimes = user.hydrationTimes.split(",");
      await async.mapLimit(hydrationTimes, 10, async (hydrationTime) => {
        let epoch_date = calculateEpoch(parseInt(hydrationTime), offsetHours, offsetMinutes);
        if (epoch_date > Date.now()/1000) { // to avoid time_in_past error
          await messages.schedule({
            id: im_id,
            postAt: epoch_date.toString(),
            text: helper.randomStringGenerator('hydration_reminder')
          });
        }
      });
    }
  }

  // Scheduling Break reminders if the user has turned it on
  if (user.break == 'on') {
    //if today is within the day range user has selected
    if (helper.withinDayRange[user.breakDays].includes(utcDay)) {
      let breakTimes = user.breakTimes.split(",");
      await async.mapLimit(breakTimes, 10, async (breakTime) => {
        let epoch_date = calculateEpoch(parseInt(breakTime), offsetHours, offsetMinutes);
        if (epoch_date > Date.now()/1000) { // to avoid time_in_past error
          await messages.schedule({
            id: im_id,
            postAt: epoch_date.toString(),
            text: helper.randomStringGenerator('break_reminder')
          });
        }
      });
    }
  }

  // Retrieving all scheduled messages for this user
  let userScheduledMessages2 = await scheduledMessages.list({
    channel: im_id // (required)
  });

  console.log('SCHEDULED MESSAGES AFTER RESCHEDULING: ' + userScheduledMessages2.scheduled_messages.length + '\n\n');
  //console.log(userScheduledMessages2);
  console.log('message rescheduling complete');

  return workflow;
};
