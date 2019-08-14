/**
 * app_mention.js is the handler for when a user mentions @WellnessBot anywhere
 * @author Akanksha Kevalramani
 */

// Dependencies
const axios = require('axios');
const helper = require('../../../helper.js');
const wellness = require('./command/wellness.js');
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});
const messages = lib.slack.messages['@0.4.3'];
const query = lib.airtable.query['@0.1.11'];
const users = lib.slack.users['@0.3.19'];
const conversations = lib.slack.conversations['@0.0.9'];
const dialog = lib.slack.dialog['@0.0.4'];

/**
* An HTTP endpoint that acts as a webhook for Slack app_mention event
* @param {object} event Slack app_mention event body (raw)
* @returns {object} workflow The result of your workflow steps
*/
module.exports = async (event) => {

  // Prepare workflow object to store API responses
  let workflow = {};

  // Retrieve and store user id from event object
  workflow.user = await users.retrieve({
    user: `${event.event.user}`
  });

  // Retrieve and store channel id from event object
  workflow.channel = await conversations.info({
    id: `${event.event.channel}`
  });

  // Respond to the @mention by posting to the channel that the user mentioned the app in
  workflow.response = await messages.create({
    id: `${workflow.channel.id}`,
    text: 'Hi, there! Thanks for mentioning me here but I\'m only meant to be used through slash commands. I\'m a personalizable bot that can help you take care of your health throughout the workday :blush: \n\n There\'s three ways I can help you if you subscribe: \n:dizzy: I can send you inspiring quotes every day at whatever time you choose.\n:droplet: I can send you reminders to drink water at regular intervals.\n:woman-walking: I can also send you reminders to take a break as as often as you\'d like.\n\nType \`/wellness subscribe\` to get started!'
  });

  return workflow;
};
