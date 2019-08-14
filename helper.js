/**
 * helper.js contains variables and functions that are reused throughout the project.
 * @author Akanksha Kevalramani
 */

/** Local Variable Declarations **/

let onColor = '#F3B84C',
    defaultColor = '#E2E2E2';

let changeScheduleButtonAttachment = {type: 'button', text: 'Change Schedule', value: 'change', name: 'schedule'};

let dayRanges = {0: 'Every day', 1: 'Monday through Friday', 2: 'Sunday through Thursday', 3: 'Monday through Saturday'};

let quotes = [
  "You can't control everything. Sometimes you just need to relax and have faith that things will work out. Let go a little and just let life happen. -Kody Kiplinger",
  "Scars tell the story of where you’ve been, They don’t dictate where you’re going.",
  "The bud is not less whole than the blossom. It’s just in a different stage of development. -Suzanne Eder",
  "When you arise in the morning, think of what a precious privilege it is to be alive - to breathe, to think, to enjoy, to love. -Marcus Aurelius",
  "Stop thinking of what could go wrong and start thinking of what could go right.",
  "Enjoy the little things, for one day you may look back and realize they were the big things. -Robert Brault",
  "Acknowledging the good that you already have in your life is the foundation for all abundance. -Eckhart Tolle",
  "Keep your eyes open and try to catch people in your company doing something right, then praise them for it. -Tom Hopkins",
  "Never give up on a dream just because of the time it will take to accomplish it. The time will pass anyway. -Earl Nightingale",
  "What we fear of doing most is usually what we most need to do. -Ralph Waldo Emerson",
  "The mind is its own place, and in itself can make a heaven of hell, a hell of heaven. —   John Milton, Paradise Lost",
  "The only way to achieve the impossible is to believe it is possible. —Charles Kingsleigh, Alice in Wonderland (2010)",
  "When we strive to become better than we are, everything around us becomes better too. —Paulo Coelho, The Alchemist",
  "Don’t judge each day by the harvest you reap but by the seeds that you plant. —Robert Louis Stevenson",
  "There is only one way to avoid criticism. Do nothing. Be nothing. Say nothing. —Aristotle",
  "If your actions inspire others to dream more, learn more, do more and become more, you are a leader. —John Quincy Adams",
  "Ignorance and fear are but matters of the mind—and the mind is adaptable. —Daniel Kish",
  "Those who don’t believe in magic will never find it. —Roald Dahl",
  "If you hire people just because they can do a job, they’ll work for your money. But if you hire people who believe what you believe, they’ll work for you with blood and sweat and tears. —Simon Sinek",
  "Very often, a change of self is needed more than a change of scene. —A.C. Benson",
  "I’ve learned about the poetry and the wisdom and the grace that can be found in the words of people all around us when we simply take the time to listen. —Dave Isay",
  "Follow your passion, stay true to yourself, never follow someone else’s path unless you’re in the woods and you’re lost and you see a path then by all means you should follow that. —Ellen Degeneres",
  "The secret of health for both mind and body is not to mourn for the past, not to worry about the future, or not to anticipate troubles, but to live in the present moment wisely and earnestly. —Buddha",
  "Big jobs usually go to the men who prove their ability to outgrow small ones. —Ralph Waldo Emerson",
  "If you hit the target every time, it’s too near or too big. —Tom Hirshfield",
  "You can’t change how people treat you or what they say about you. All you can do is change how you react to it. —Mahatma Gandhi",
  "Learn from the mistakes of others. You can’t live long enough to make them all yourselves. —Chanakya",
  "If you light a lamp for someone else, it will also brighten your path. —Buddha",
  "Tough times never last, but tough people do. —Dr. Robert Schuller",
  "Once you’ve accepted your flaws, no one can use them against you. ―George R.R. Martin, A Game of Thrones",
  "Why are you keeping this curiosity door locked? ―Dustin, Stranger Things",
  "How many times do I have to teach you: just because something works doesn’t mean it can’t be improved. — huri, Black Panther",
  "Our virtues and our failings are inseparable, like force and matter. When they separate, man is no more. —Nikola Tesla",
  "Look at life with the eyes of a child. —Henri Matisse",
  "Never be afraid to raise your voice for honesty and truth and compassion against injustice and lying and greed. If people all over the world…would do this, it would change the earth. ―William Faulkner",
  "Learn the rules like a pro, so you can break them like an artist. —Pablo Picasso",
  "Be so good they can’t ignore you. —Steve Martin",
  "Hire character. Train skill. —Peter Schutz",
  "The best leaders are those most interested in surrounding themselves with assistants and associates smarter than they are. They are frank in admitting this and are willing to pay for such talents. —Antos Parrish",
  "I’d rather regret the things I’ve done than regret the things I haven’t done. —Lucille Ball",
  "We can’t take any credit for our talents. It’s how we use them that counts. —Madeleine L’Engle, A Wrinkle in Time",
  "Failure it appears is not the regret that haunts most people; it is the choice not to risk failure at all. ―Dr. John Izzo",
  "Take care of your body. It’s the only place you have to live. -Jim Rohn",
  "Those who think they have no time for healthy eating will sooner or later have to find time for illness. -Edward Stanley",
  "Creativity is a fragrance of real health. When a person is really healthy and whole, creativity comes naturally to him, the urge to create arises. -Osho",
  "Between stimulus and response there is a space. In that space is our power to choose our response. In our response lies our growth and our freedom. -Victor Frankl",
  "Whatever the present moment contains, accept it as if you had chosen it. Always work with it, not against it. -Eckhart Tolle",
  "Guilt, regret, resentment, sadness & all forms of nonforgiveness are caused by too much past & not enough presence. –Eckhart Tolle",
  "Look at other people and ask yourself if you are really seeing them or just your thoughts about them. –Jon Kabat-Zinn",
  "You can’t stop the waves, but you can learn to surf. –Jon Kabat-Zinn",
  "There is something wonderfully bold and liberating about saying yes to our entire imperfect and messy life. –Tara Brach",
  "Every experience, no matter how bad it seems, holds within it a blessing of some kind. The goal is to find it. –Buddha",
  "Our life is shaped by our mind, for we become what we think. –Buddha",
  "If the problem can be solved why worry? If the problem cannot be solved worrying will do you no good. –Buddha",
  "Don’t let life harden your heart. –Pema Chödrön",
  "You cannot control the results, only your actions. –Allan Lokos"
];

let invalidCommandMessage = [
  "Sorry, I do not understand that command. :cry: Here's a list of commands I understand: \n",
  "Uh oh, that command did not work. :see_no_evil: Try the following commands instead: \n"
];


/** Export Variable Declarations **/

module.exports.settingsText = "WellnessBot Settings\n\n";

module.exports.usageTipsUnsubscribed =  { text: `*Usage Tips*\n\n:bell: \`/wellness subscribe\`: Subscribe to receive wellness reminders\n:sparkles: \`/wellness quote\`: Receive a random inspiring quote for a little pick me up!\n:crystal_ball: \`/wellness help\`: Learn about all that you can do with WellnessBot`};

module.exports.usageTipsSubscribed =  { text: `*Usage Tips*\n\n:gear: \`/wellness settings\`: Personalize your WellnessBot settings\n:sparkles: \`/wellness quote\`: Receive a random inspiring quote\n:no_bell: \`/wellness unsubscribe\`: Unsubscribe to stop receiving wellness reminders\n:crystal_ball:\ `/wellness help\`: Learn about all that you can do with WellnessBot`};

module.exports.inputError = { color: '#D33222', text: "Uh oh, we found an error in your submission and your changes didn't go through. Make sure your interval is not greater than the start and end time otherwise you won't receive any reminders."};

module.exports.dayRanges = dayRanges;

module.exports.timeRangesAttachment = [
    { "label": "7:00 AM", "value": "420" },
    { "label": "7:30 AM", "value": "450" },
    { "label": "8:00 AM", "value": "480" },
    { "label": "8:30 AM", "value": "510" },
    { "label": "9:00 AM", "value": "540" },
    { "label": "9:30 AM", "value": "570" },
    { "label": "10:00 AM", "value": "600" },
    { "label": "10:30 AM", "value": "630" },
    { "label": "11:00 AM", "value": "660" },
    { "label": "11:30 AM", "value": "690" },
    { "label": "12:00 PM", "value": "720" },
    { "label": "12:30 PM", "value": "750" },
    { "label": "1:00 PM", "value": "780" },
    { "label": "1:30 PM", "value": "810" },
    { "label": "2:00 PM", "value": "840" },
    { "label": "2:30 PM", "value": "870" },
    { "label": "3:00 PM", "value": "900" },
    { "label": "3:30 PM", "value": "930" },
    { "label": "4:00 PM", "value": "960" },
    { "label": "4:30 PM", "value": "990" },
    { "label": "5:00 PM", "value": "1020" },
    { "label": "5:30 PM", "value": "1050" },
    { "label": "6:00 PM", "value": "1080" },
    { "label": "6:30 PM", "value": "1110" },
    { "label": "7:00 PM", "value": "1140" },
    { "label": "7:30 PM", "value": "1170" },
    { "label": "8:00 PM", "value": "1200" },
    { "label": "8:30 PM", "value": "1230" },
    { "label": "9:00 PM", "value": "1260" },
    { "label": "9:30 PM", "value": "1290" },
    { "label": "10:00 PM", "value": "1320" },
    { "label": "10:30 PM", "value": "1350" },
    { "label": "11:00 PM", "value": "1380" },
    { "label": "11:30 PM", "value": "1410" },
    { "label": "12:00 AM", "value": "1440" },
    { "label": "12:30 AM", "value": "1470" },
    { "label": "1:00 AM", "value": "60" },
    { "label": "1:30 AM", "value": "90" },
    { "label": "2:00 AM", "value": "120" },
    { "label": "2:30 AM", "value": "150" },
    { "label": "3:00 AM", "value": "180" },
    { "label": "3:30 AM", "value": "210" },
    { "label": "4:00 AM", "value": "240" },
    { "label": "4:30 AM", "value": "270" },
    { "label": "5:00 AM", "value": "300" },
    { "label": "5:30 AM", "value": "330" },
    { "label": "6:00 AM", "value": "360" },
    { "label": "6:30 AM", "value": "390" }
];

module.exports.dayRangesAttachment = [
    { "label": "Every day", "value": "0" },
    { "label": "Monday through Friday", "value": "1" },
    { "label": "Sunday through Thursday", "value": "2" },
    { "label": "Monday through Saturday", "value": "3" }
];

module.exports.timeIntervalsAttachment = [
    { "label": "15 minutes", "value": "15" },
    { "label": "30 minutes", "value": "30" },
    { "label": "45 minutes", "value": "45" },
    { "label": "1 hour", "value": "60" },
    { "label": "1 hour 15 minutes", "value": "75" },
    { "label": "1 hour 30 minutes", "value": "90" },
    { "label": "1 hour 45 minutes", "value": "105" },
    { "label": "2 hours", "value": "120" },
    { "label": "2 hours 15 minutes", "value": "135" },
    { "label": "2 hours 30 minutes", "value": "150" },
    { "label": "2 hours 45 minutes", "value": "165" },
    { "label": "3 hours", "value": "165" }
];

/** All Helper Functions **/

/**
 * Returns the standard text to show for user settings messages
 * @param {string} name name of the user, to personalize the message
 * @returns {string}
 */
module.exports.settingsText = function(name) {
  return 'Hi, ' + name + '! You can modify your wellness reminder settings below.';
}

/**
 * Returns the text to show when user needs help
 * @param {string} name name of the user, to personalize the message
 * @returns {string}
 */
module.exports.helpText = function(name) {
  return 'Hi, ' + name + '! I\'m Wellness Bot. I\'m here to help you take care of your health throughout the workday :blush: \n\n There\'s three ways I can help you if you subscribe: \n:dizzy: I can send you inspiring quotes every day at whatever time you choose.\n:droplet: I can send you reminders to drink water at regular intervals.\n:woman-walking: I can also send you reminders to take a break as as often as you\'d like!';
}

/**
 * Returns a random invalid command message. This is used instead of a single standard message to add less predictably
 * and more human-like feel to the bot.
 * @returns {string}
 */
module.exports.randomInvalidCommandMessageGenerator = function() {
    return invalidCommandMessage[Math.floor(Math.random() * invalidCommandMessage.length)];
}

/**
 * Returns a random quote from a list of quotes.
 * @returns {string}
 */
module.exports.randomQuoteGenerator = function() {
    return quotes[Math.floor(Math.random() * quotes.length)];
}

/**
 * Returns a color for the message attachment based on whether the feature is turned on or off.
 * @returns {string}
 */
function attachmentColor(toggle) {
  if (toggle == 'on')
    return onColor;
  else
    return defaultColor;
}

/**
 * Returns the text to show for Daily Quote Settings
 * @param {string} toggle         this value tells whether or not the user has opted for daily quotes
 * @param {string} dailyQuoteDays the day range during which the quote should be sent
 * @param {string} dailyQuoteTime the time (in minutes) at which quote should be sent
 * @returns {string}
 */
function dailyQuoteText(toggle, dailyQuoteDays, dailyQuoteTime) {
  if (toggle == 'on')
    return dailyQuoteDays == 'Every day' ? ('*' + toggle.toUpperCase() + ': Daily Quote :dizzy:*\nYou have Daily Quote turned ' + toggle + '. We\'ll send you an inspiring quote ' + dailyQuoteDays.toLowerCase() + ' at ' + dailyQuoteTime + '.') : ('*' + toggle.toUpperCase() + ': Daily Quote :dizzy:*\nYou have Daily Quote turned ' + toggle + '. We\'ll send you an inspiring quote ' + dailyQuoteDays + ' at ' + dailyQuoteTime + '.');
  else
    return '*' + toggle.toUpperCase() + ': Daily Quote :dizzy:*\nTurn on Daily Quote to receive an inspiring quote every day at whatever time you choose.';
}

/**
 * Returns the text to show for Hydration Settings
 * @param {string} toggle             this value tells whether or not the user has opted for hydration reminders
 * @param {string} hydrationDays      the day range during which the reminders should be sent
 * @param {string} hydrationInterval  the interval (in minutes) between each reminder
 * @param {string} hydrationStartTime starting time (in minutes) at which reminders should be sent
 * @param {string} hydrationEndTime   time (in minutes) after which reminders should not be sent
 * @returns {string}
 */
function hydrationText(toggle, hydrationDays, hydrationInterval, hydrationStartTime, hydrationEndTime) {
  if (toggle == 'on')
    return hydrationDays == 'Every day' ? ('*' + toggle.toUpperCase() + ': Hydration Reminders* :droplet:\nYou have Hydration Reminders turned on. We\'ll send you a reminder to drink water ' + hydrationDays.toLowerCase() + ' every ' + hydrationInterval + ' from ' + hydrationStartTime + ' to ' + hydrationEndTime + '.') : ('*' + toggle.toUpperCase() + ': Hydration Reminders* :droplet:\nYou have Hydration Reminders turned on. We\'ll send you a reminder to drink water ' + hydrationDays + ' every ' + hydrationInterval + ' from ' + hydrationStartTime + ' to ' + hydrationEndTime + '.');
  else
    return '*' + toggle.toUpperCase() + ': Hydration Reminders* :droplet:\nTurn on Hydration Reminders to receive reminders to drink water as often as you’d like.';
}

/**
 * Returns the text to show for Break Settings
 * @param {string} toggle         this value tells whether or not the user has opted for break reminders
 * @param {string} breakDays      the day range during which the reminders should be sent
 * @param {string} breakInterval  the interval (in minutes) between each reminder
 * @param {string} breakStartTime starting time (in minutes) at which reminders should be sent
 * @param {string} breakEndTime   time (in minutes) after which reminders should not be sent
 * @returns {string}
 */
function breakText(toggle, breakDays, breakInterval, breakStartTime, breakEndTime) {
  if (toggle == 'on')
    return breakDays == 'Every day' ? ('*' + toggle.toUpperCase() + ': Break Reminders* :table_tennis_paddle_and_ball:\nYou have Break Reminders turned on. We\'ll send you a reminder to take a break ' + breakDays.toLowerCase() + ' every ' + breakInterval + ' from ' + breakStartTime + ' to ' + breakEndTime + '.') : ('*' + toggle.toUpperCase() + ': Break Reminders* :table_tennis_paddle_and_ball:\nYou have Break Reminders turned on. We\'ll send you a reminder to take a break ' + breakDays + ' every ' + breakInterval + ' from ' + breakStartTime + ' to ' + breakEndTime + '.');
  else
    return '*' + toggle.toUpperCase() + ': Break Reminders* :table_tennis_paddle_and_ball:\nTurn on Break Reminders to receive a message at regular intervals reminding you to take a break.';
}

/**
 * Returns the 'Change Schedule' button only if the feature is turned on
 * @param {string} toggle this value tells whether or not the user has opted for a feature
 * @returns {object}
 */
function changeScheduleButton(toggle) {
  if (toggle == 'on')
    return changeScheduleButtonAttachment;
  else
    return null;
}

/**
 * Returns the appropriate 'Toggle' button depending on current state of the toggle
 * @param {string} toggle this value tells whether or not the user has opted for a feature
 * @returns {object}
 */
function toggleButton(toggle) {
  if (toggle == 'on')
    return {text: 'Turn Off', value: 'off'};
  else
    return {text: 'Turn On', value: 'on'};
}

/**
 * Determines the button style depending on the state of the toggle
 * @param {string} toggle this value tells whether or not the user has opted for a feature
 * @returns {object}
 */
function buttonStyle(toggle) {
  if (toggle == 'on')
    return 'danger';
  else
    return 'primary';
}

/**
 * This function returns the Daily Quote attachment to display in user settings
 * @param {string} toggle         this value tells whether or not the user has opted for daily quotes
 * @param {string} dailyQuoteDays the day range during which the quote should be sent
 * @param {string} dailyQuoteTime the time (in minutes) at which quote should be sent
 * @returns {object}
 */
module.exports.dailyQuoteAttachment = function(toggle, dailyQuoteDays, dailyQuoteTime) {
  let value =
    {
      color: attachmentColor(toggle),
      callback_id: 'quoteActions',
      text: dailyQuoteText(toggle, dayRanges[dailyQuoteDays], dailyQuoteTime),
      actions: [
       changeScheduleButton(toggle),
       {
         type: 'button',
         text: toggleButton(toggle).text,
         value: toggleButton(toggle).value,
         name: 'toggle',
         style: buttonStyle(toggle)
       }
      ]
    };
  return value;
}

/**
 * This function returns the Hydration attachment to display in user settings
 * @param {string} toggle             this value tells whether or not the user has opted for hydration reminders
 * @param {string} hydrationDays      the day range during which the reminders should be sent
 * @param {string} hydrationInterval  the interval (in minutes) between each reminder
 * @param {string} hydrationStartTime starting time (in minutes) at which reminders should be sent
 * @param {string} hydrationEndTime   time (in minutes) after which reminders should not be sent
 * @returns {object}
 */
module.exports.hydrationAttachment = function(toggle, hydrationDays, hydrationInterval, hydrationStartTime, hydrationEndTime) {
  let value =
    {
      color: attachmentColor(toggle),
      callback_id: 'hydrationActions',
  			text: hydrationText(toggle, hydrationDays, hydrationInterval, hydrationStartTime, hydrationEndTime),
      actions: [
        changeScheduleButton(toggle),
        {
          type: 'button',
          text: toggleButton(toggle).text,
          value: toggleButton(toggle).value,
          name: 'toggle',
          style: buttonStyle(toggle)
        }
      ]
	 };
  return value;
}

/**
 * This function returns the Break attachment to display in user settings
 * @param {string} toggle             this value tells whether or not the user has opted for break reminders
 * @param {string} breakDays      the day range during which the reminders should be sent
 * @param {string} breakInterval  the interval (in minutes) between each reminder
 * @param {string} breakStartTime starting time (in minutes) at which reminders should be sent
 * @param {string} breakEndTime   time (in minutes) after which reminders should not be sent
 * @returns {object}
 */
module.exports.breakAttachment = function(toggle, breakDays, breakInterval, breakStartTime, breakEndTime) {
  let value =
    {
      color: attachmentColor(toggle),
      callback_id: 'breakActions',
      		text: breakText(toggle, breakDays, breakInterval, breakStartTime, breakEndTime),
      actions: [
        changeScheduleButton(toggle),
        {
          type: 'button',
          text: toggleButton(toggle).text,
          value: toggleButton(toggle).value,
          name: 'toggle',
          style: buttonStyle(toggle)
        }
      ]
    }
  return value;
}

/**
 * Pads single digits with a 0 (i.e. 9 becomes 09)
 * @param {string} d the number to pad
 * @returns {string}
 */
function pad(d) {
   return (d < 10) ? '0' + d.toString() : d.toString();
}

/**
 * Converts minutes (as it is stored in the database) to human-readable time (i.e. 960 becomes "4:00 AM")
 * @param {number} x the number to convert
 * @returns {string}
 */
module.exports.convertMinutesToString = function(x) {
  let hrs = x/60;
  let mins = x%60;
  if (hrs/10 <= 1.15) {
    return Math.floor(hrs) + ':' + pad(mins) + ' AM';
  }
  else if (hrs/10 == 1.2) {
    return Math.floor(hrs) + ':' + pad(mins) + ' PM';
  }
  else {
    return (Math.floor(hrs)-12) + ':' + pad(mins) + ' PM';
  }
}

/**
 * Converts the interval time (in minutes) to an appropriate string (i.e. 90 becomes "1 hour and 30 minutes")
 * @param {number} x the number to convert
 * @returns {string}
 */
module.exports.convertIntervalToString = function(x) {
  let hrs = x/60,
      mins = x%60;
  if (hrs/10 > 0) {
    if (Math.floor(hrs) == 0) {
        return pad(mins) + ' minutes';
    }
    else if (Math.floor(hrs) == 1) {
      if (mins == 0)
        return Math.floor(hrs) + ' hour';
      else
        return Math.floor(hrs) + ' hour and ' + pad(mins) + ' minutes';
    }
    else {
      if (mins == 0)
        return Math.floor(hrs) + ' hours';
      else
        return Math.floor(hrs) + ' hours and ' + pad(mins) + ' minutes';
    }
  }
  else
    return pad(mins) + ' minutes';
}


/**
 * Calculates a list of times at which the reminder needs to be sent based on the start time, end time and interval.
 * @param {string} startTime starting time (in minutes) at which reminders should be sent
 * @param {string} endTime   time (in minutes) after which reminders should not be sent
 * @param {string} interval  the interval (in minutes) between each reminder
 * @returns {string}
 */
module.exports.calculateTimes = function(startTime, endTime, interval) {
  let times = [], oldEndTime = 0, tempInterval = 0;

  startTime = parseInt(startTime);
  endTime = parseInt(endTime);
  interval = parseInt(interval);

  //accounting for if start time = 420 (7 AM) and end time = 90 (1:30 AM)
  if (endTime < startTime) {
    oldEndTime = endTime; //
    endTime = 1470;
  }

  //examples:
  //start time = 1470, end time = 60, interval = 15 mins, no error
  //start time = 1470, end time = 60, interval = 30 mins, no error
  //start time = 1470, end time = 60, interval = 45 mins, error
  //start time = 1440, end time = 90, interval = 15 mins, no error
  //start time = 1440, end time = 90, interval = 150 mins, error

  if (interval <= (endTime - startTime)) {
    //going from startTime till 1470 (12 AM)
    for (let i = startTime; i < endTime; i += interval) {
      times.push(i);
    }

    if (endTime == 1470) {
      let partialTimeCounted = 1470 - times[times.length-1];
      if (partialTimeCounted != 0 ) {
        tempInterval = interval - partialTimeCounted;
        if (tempInterval <= 60) {
          times.push(tempInterval);
        }
       }
    }
  }

  for (let i = tempInterval + interval; i < oldEndTime; i += interval) {
      times.push(i);
  }

  return times.toString();
}


/**
 * Returns an error if the given start time, end time and interval would result in no reminders being set
 * @param {string} startTime starting time (in minutes) at which reminders should be sent
 * @param {string} endTime   time (in minutes) after which reminders should not be sent
 * @param {string} interval  the interval (in minutes) between each reminder
 * @returns {boolean}
 */
module.exports.catchErrors = function (startTime, endTime, interval) {
  let errorsFound = false;

  if (endTime < startTime) {
    oldEndTime = endTime;
    endTime = 1470;
    if (interval > (1470 - startTime)) {
      if ((interval - (1470 - startTime)) > (endTime - 30)) {
        errorsFound = true;
      } 
    }
  }
  else {
    if (interval > (endTime - startTime)) {
      errorsFound = true;
    }
  }

  return errorsFound;
}
