/**
 * daily_scheduler.js schedules messages for all existing users once every day
 * at 24:00 (UTC -0:00)
 * @author Akanksha Kevalramani
 */

// Dependencies
const async = require('async');
const axios = require('axios');
const helper = require('../../../helper.js');
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});
const messages = lib.slack.messages['@0.4.3'];
const query = lib.airtable.query['@0.1.11'];
const users = lib.slack.users['@0.3.19'];
const conversations = lib.slack.conversations['@0.1.1'];
const dialog = lib.slack.dialog['@0.0.4'];

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
* This function schedules messages for all users.
* @returns {object} workflow The result of your workflow steps
*/
module.exports = async () => {

  // Prepare workflow object to store API responses
  let workflow = {};

  // Getting the all user IM ids
  let listOfIMs = await conversations.list({
    types: "im"
  });

  // Creating a dictionary that stores user id as key, and their IM id as value (for easy lookup)
  let user_im_ids = {};
  for (let i = 0; i < listOfIMs.channels.length; i++)
    user_im_ids[listOfIMs.channels[i].user] = listOfIMs.channels[i].id;

  // Retrieving all users from the database
  let userRecord = await lib.airtable.query['@0.1.11'].select({
      table: `Wellness Subscribers`
  });

  // Going through all users and scheduling messages for them where necessary
  await async.mapLimit(userRecord.rows, 10, async (singleUser) => {
    let user = { id: singleUser.fields['User ID'],
                 name: singleUser.fields['Name'],
                 tz: singleUser.fields['Timezone Offset'],
                 dailyQuote: singleUser.fields['Daily Quote Bool'],
                 hydration: singleUser.fields['Hydration Bool'],
                 break: singleUser.fields['Break Bool'],
                 hydrationTimes: singleUser.fields['Hydration Times'],
                 breakTimes: singleUser.fields['Break Times'],
                 dailyQuoteTime: singleUser.fields['Daily Quote Time'],
                 hydrationTimes: singleUser.fields['Hydration Times'],
                 breakDays: singleUser.fields['Break Days'],
                 dailyQuoteDays: singleUser.fields['Daily Quote Days'],
                 hydrationDays: singleUser.fields['Hydration Days'],
                 hydrationEnd: singleUser.fields['Hydration End'],
                 breakEnd: singleUser.fields['Break End'],
                 hydrationInterval: singleUser.fields['Hydration Interval'],
                 breakInterval: singleUser.fields['Break Interval'],
               };
      let im_id = user_im_ids[user.id];

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
        let epoch_date = calculateEpoch(parseInt(user.dailyQuoteTime), offsetHours, offsetMinutes);
        if (epoch_date > Date.now()/1000) { // to avoid time_in_past error
          await messages.schedule({
            id: im_id,
            postAt: epoch_date.toString(),
            text: helper.randomQuoteGenerator()
          });
        }
      }

      // Scheduling Hydration reminders if the user has turned it on
      if (user.hydration == 'on') {
        let hydrationTimes = user.hydrationTimes.split(",");
        await async.mapLimit(hydrationTimes, 10, async (hydrationTime) => {
          let epoch_date = calculateEpoch(parseInt(hydrationTime), offsetHours, offsetMinutes);
          if (epoch_date > Date.now()/1000) { // to avoid time_in_past error
            await messages.schedule({
              id: im_id,
              postAt: epoch_date.toString(),
              text: `:droplet: Time to drink water!`
            });
          }
        });
      }

      // Scheduling Break reminders if the user has turned it on
      if (user.break == 'on') {
        let breakTimes = user.breakTimes.split(",");
        await async.mapLimit(breakTimes, 10, async (breakTime) => {
          let epoch_date = calculateEpoch(parseInt(breakTime), offsetHours, offsetMinutes);
          if (epoch_date > Date.now()/1000) { // to avoid time_in_past error
            await messages.schedule({
              id: im_id,
              postAt: epoch_date.toString(),
              text: `:woman-walking: Time to take a break!`
            });
          }
        });
      }
  });

  return workflow;
};
