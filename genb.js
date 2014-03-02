var es = require('./es');
var RRule = require('rrule').RRule;

module.exports = function (show) {
  var airtime, options, rule, i, date, dates, broadcast, startDate, endDate;

  airtime = parseAirtime(show.airtime);

  if (!airtime) return;
  //console.log(airtime);

  options = {};
  date = new Date();

  // startDate should be set but use the current if it isn't
  startDate = show.startDate ? new Date(show.startDate) : date;

  // Set time on startDate to start time
  startDate.setHours(airtime.start.hours, airtime.start.minutes, 0, 0);

  //console.log(startDate);
  options.dtstart = startDate;

  // endDate should be set but when it isn't end at a year out
  date.setFullYear(date.getFullYear() + 1);
  endDate = show.endDate ? new Date(show.endDate) : date;

  // Set time on endDate to the last second of the day
  endDate.setHours(23, 59, 59, 999);
  
  options.until = endDate;

  options.freq = RRule.MONTHLY;

  //console.log(options);
  rule = new RRule(options);

  //console.log(show.airtime)
  //console.log(rule.toString());
  dates = rule.all();
  i = 0;
  while (i < dates.length) {
    date = dates[i];
    broadcast = {
      title: show.title
    };

    broadcast.start = date.toISOString();
    date.setHours(airtime.end.hours, airtime.end.minutes, 0, 0);

    // Set end to next day if we cross midnight
    if (airtime.end.hours < airtime.end.hours) {
      date.setDate(date.getDate() + 1);
    }

    broadcast.end = date.toISOString();

    if (show.description) broadcast.description = show.description;
    if (show.hosts) broadcast.hosts = show.hosts;
    broadcast.shows = [{id: show.id, main: show.main}];

    //console.log(broadcast);
    break;

    i++;
  }
}

// Returns an object with all of the airtime bits parsed out
// Or undefined on parse error
function parseAirtime (airtime) {
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
  if (parsed.monthday) console.log(parsed) //return parsed;

  return parsed;
}

var monthdayRe = /(\d+)th of the month/ig;
function getMonthday (airtime) {
  var monthdayMatch = monthdayRe.exec(airtime);
  if (!monthdayMatch) return;
  return monthdayMatch[1];
}

var timeRe = /\d+:?\d* *(?:a|p).?m/ig;
function getTimes (airtime) {
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

if (require.main === module) {
  // Script run directly; generate broadcasts for all shows
  var queryBody = {
    filter: {term: {active: true}},
    size: 9999
  };
  //console.log(queryBody);
  es.search({_type: 'show'}, queryBody, function (err, data) {
    if (err) throw err;
    data.hits.hits.forEach(function (hit) {
      //console.log(hit);
      module.exports(hit._source);
    });
  });
}
