// Generate broadcast objects from a show

var genid = require('./genid');
var RRule = require('rrule').RRule;

module.exports = function (show,startDate,endDate) {
	
  var airtime, options, rule, i, date, dates, broadcast, broadcasts, commands;

  broadcasts = [];
  airtime = module.exports.parseAirtime(show.airtime);

  //console.log(show.airtime);
  //console.log(airtime);
  if (!airtime) return broadcasts;
  //console.log(airtime);

  options = {};

  // startDate should be set but use today's date if it isn't
  date = new Date();
  startDate = startDate ? new Date(startDate) : date;
  options.dtstart = ruleStart(startDate, airtime.start);

  // endDate should be set but end at a year out when it isn't
  date.setFullYear(date.getFullYear() + 1);
  options.until = endDate ? new Date(endDate+'T23:59:59-0400') : date;

  if (airtime.monthday) {
    options.freq = RRule.MONTHLY;
    options.bymonthday = airtime.monthday;
  } else if (airtime.weekly) {
    options.freq = RRule.WEEKLY;
    options.byweekday = airtime.weekly;
  } else if (airtime.weekdays) {
    options.freq = RRule.DAILY;
  } else return broadcasts;

  //console.log(options);
  rule = new RRule(options);

  //console.log(show.airtime)
  //console.log(rule.toString());
  dates = rule.all();
  //console.log(dates);
  i = 0;
  while (i < dates.length) {
  	
    console.log('f');
  	
    date = dates[i];
    broadcast = {
      active: true,
      main: show.title,
      name: show.title,
      type: 'broadcast',
      id: genid(),
      timestamp: (new Date()).toISOString()
    };
    console.log(broadcast.id);
    console.log('2.1');

    
    // convert date from local time to EST/EDT because
    // that is TZ in which airtime is defined
    
    
    //broadcast.start = broadcast.genStart = date.toISOString();
    broadcast.start = broadcast.genStart = toLocalISOString(date);

    date.setHours(airtime.end.hours, airtime.end.minutes, 0, 0);
    
    // Set end to next day if we cross midnight
    if (airtime.end.hours < airtime.start.hours) {
      date.setDate(date.getDate() + 1);
    }
    
    //broadcast.end = broadcast.genEnd = date.toISOString();
    broadcast.end = broadcast.genEnd =  toLocalISOString(date);

    if (show.description) broadcast.description = show.description;
    if (show.hosts) broadcast.hosts = show.hosts;
    broadcast.shows = [{id: show.id, main: show.main}];

    //console.log(broadcast);

    broadcasts.push(broadcast);
    i++;
  }

  return broadcasts;
}

function ruleStart (startDate, startTime) {
  // Set time on startDate to start time
  startDate.setHours(startTime.hours, startTime.minutes, 0, 0);
  return startDate;
}

// Returns an object with all of the airtime bits parsed out
// Or undefined on parse error
module.exports.parseAirtime = function parseAirtime (airtime) {
  var times, parsed;

  if (!airtime) return;

  times = getTimes(airtime);

  if (times.length < 2) {
    console.log('Bad times', airtime);
    return;
  }

  parsed = {start: times[0], end: times[1]};

  // TODO parse out frequency, interval, etc. from airtime

  parsed.monthday = getMonthday(airtime);
  if (parsed.monthday) return parsed;

  parsed.weekly = getWeekly(airtime);
  if (parsed.weekly) return parsed;

  parsed.weekdays = getWeekdays(airtime);
  if (parsed.weekdays) return parsed;

  return parsed;
}

function getMonthday (airtime) {
	var monthdayRe = /(\d+)th of the month/ig;
  var monthdayMatch = monthdayRe.exec(airtime);
  if (!monthdayMatch) return;
  return Number(monthdayMatch[1]);
}

var weeklyArr = ['mondays', 'tuesdays', 'wednesdays', 'thursdays', 'fridays', 'saturdays', 'sundays'];
function getWeekly (airtime) {
	var weeklyRe = RegExp(weeklyArr.join('|'), 'ig');
  var weeklyMatch = weeklyRe.exec(airtime);
  if (!weeklyMatch) return;
  //console.log(weeklyMatch);
  return weeklyArr.indexOf(weeklyMatch[0].toLowerCase());
}

function getWeekdays (airtime) {
	var weekdaysRe = /Weekdays/;
  if (weekdaysRe.test(airtime)) return true;
}

function getTimes (airtime) {
	var timeRe = /\d+:?\d* *(?:a|p).?m/ig;
  var ampm, hours, minutes, time, times, timeMatch, timeSplit;
  times = [];
  while (timeMatch = timeRe.exec(airtime)) {
    time = timeMatch[0];
    //console.log(time)
    time = time.replace('.', '');
    
    // Split off am/pm
    timeSplit = time.split(' ');
    if (timeSplit.length < 2) return console.log('no ampm');
    time = timeSplit[0];
    ampm = timeSplit[1];
    
    // Split into hours and minutes
    timeSplit = time.split(':');
    hours = timeSplit[0];
    minutes = (timeSplit.length == 2) ? timeSplit[1] : '0';

    if (ampm == 'am' && hours == '12') hours = '0';
    if (ampm == 'pm' && hours != '12') hours = String(Number(hours) + 12);
    //hours = ('0' + hours).substr(hours.length - 1);

    time = {hours: Number(hours), minutes: Number(minutes)};
    //console.log(time);
    times.push(time);
  }
  
  // Reset the regex index for the start of next string
  timeRe.lastIndex = 0;

  return times;
}

function toLocalISOString (date) {	
	var localDate = date.setMinutes(date.getMinutes()-date.getTimezoneOffset());
	localDateStr = date.toISOString();
	return localDateStr.replace('Z','');	
}

