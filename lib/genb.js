// Generate broadcast objects from a show

var genid = require('./genid');
var RRule = require('rrule').RRule;

module.exports = function (show,startDateStr,endDateStr) {
	
  var airtime, options, rule, i, date, dates, broadcast, broadcasts, commands;

  if (!show) {
  	return []
  }
  if (!show.genbAirtime && !show.airtime) {
  	return []
  }
  if (!startDateStr) {
  	return []
  }
  if (!endDateStr) {
  	return []
  }
  
  
  // constants, sort of
  var wgxcLocation = {id:  'fejxgk', main: 'WGXC 90.7-FM: Hands-on Radio'};
  var wfLocation = {id:  '74t6q0', main: 'Standing Wave Radio'};
  
  
    
  broadcasts = [];
  
  
  // can have multiple rules
  var fullGenbAirtime = show.genbAirtime?show.genbAirtime:show.airtime;  
  var genbAirtimeParts = fullGenbAirtime.split(';')
  
  startDate = new Date(startDateStr+'T00:00:00-0000');
  endDate = new Date(endDateStr+'T23:59:59-0000');
  
  // convert to local tile - rrule() interprets days of the week in local time
  startDate.setMinutes(startDate.getMinutes()+startDate.getTimezoneOffset());
  endDate.setMinutes(endDate.getMinutes()+endDate.getTimezoneOffset());
  
  for (j=0; j<genbAirtimeParts.length;j++) {
  	
	  // fix up airtime as needed
	  var fixupAirtime = genbAirtimeParts[j];
	  if (fixupAirtime.toLowerCase().indexOf('every')==-1)
	  	fixupAirtime = 'Every '+fixupAirtime;
	  fixupAirtime = fixupAirtime.replace('noon','12 p.m.');
	  fixupAirtime = fixupAirtime.replace('midnight','12 a.m.');
	  
	  airtime = module.exports.parseAirtime(fixupAirtime);
	
	  if (!airtime) return broadcasts;
	
	  var rule, options;
	  try {
	    
	    options = RRule.parseText(fixupAirtime);	    
	    options.dtstart = startDate;
	    options.until = endDate;
	    rule = new RRule(options);
		} 
		catch (ex) {
	    console.log(ex);
		  return ex;
		}
	  
		var dates = rule.all();
		
	  i = 0;
	  while (i < dates.length) {
	  	  	  	    
	    date = dates[i];
	  	name = toLocalYyyymmdd(date);
	    broadcast = {
	      active: true,
	      main: name,
	      name: name,
	      type: 'broadcast',
	      id: genid(),
	      public: true,
	      timestamp: (new Date()).toISOString()
	    };

	    date.setHours(airtime.start.hours, airtime.start.minutes, 0, 0);
	    broadcast.start = broadcast.genStart = toLocalISOString(date);
	    
	    date.setHours(airtime.end.hours, airtime.end.minutes, 0, 0);

	    // Set end to next day if we cross midnight
	    if (airtime.end.hours < airtime.start.hours) {
	      date.setDate(date.getDate() + 1);
	    }
	    
	    broadcast.end = broadcast.genEnd =  toLocalISOString(date);
	
	    if (show.description) broadcast.description = show.description;
	    if (show.hosts) broadcast.hosts = show.hosts;    
	    if (show.sites) {    	    	
	      if (show.sites) broadcast.sites = show.sites;
	      broadcast.locations = [];
	      if (show.sites.indexOf('wgxc')!=-1)	broadcast.locations.push(wgxcLocation);
	      if (show.sites.indexOf('transmissionarts')!=-1)	broadcast.locations.push(wfLocation);
	      if (broadcast.locations.length==0)
	      	delete broadcast.locations;
	    }
	    broadcast.shows = [{id: show.id, main: show.main}];
	
	    broadcasts.push(broadcast);
	    i++;
	  }
  }

  return broadcasts;
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

  return parsed;
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
	
	var localDate = new Date(date.getTime());	
	localDate.setMinutes(localDate.getMinutes()-localDate.getTimezoneOffset());
	var localDateStr = localDate.toISOString();
	return localDateStr.replace('Z','');	
}
function toLocalYyyymmdd (date) {
	var localDate = new Date(date.getTime());	
	//localDate.setMinutes(localDate.getMinutes()-localDate.getTimezoneOffset());
	var localDateStr = '';
	localDateStr = localDateStr.concat(localDate.getFullYear());
	if (localDate.getMonth()+1<10) localDateStr = localDateStr.concat('0');
	localDateStr = localDateStr.concat(localDate.getMonth()+1);
	if (localDate.getDate()<10) localDateStr = localDateStr.concat('0');
	localDateStr = localDateStr.concat(localDate.getDate());
	return localDateStr;
}

