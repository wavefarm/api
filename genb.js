var es = require('./es')
var RRule = require('rrule').RRule

var timeRe = /\d+:?\d* *(?:a|p).?m/ig

module.exports = function(show) {
  var options, times, startDate, rule, i, starts
  // Generate broadcasts for show
  if (!show.daytime) return
  options = {}

  times = getTimes(show.daytime)
  if (times.length < 2) return console.log('Bad times', show.oldId, show.daytime)

  startDate = show.startDate ? new Date(show.startDate) : new Date()
  // Set time on startDate to start time
  startDate.setHours(times[0].hours, times[0].minutes, 0, 0)
  options.dtstart = startDate
  // TODO set all show dates to 2015-03-01
  options.until = new Date('2015-03-01') //new Date(show.endDate)

  // TODO parse out frequency, interval, etc. from daytime
  options.freq = RRule.MONTHLY

  //console.log(options)
  rule = new RRule(options)
  //console.log(rule.all())
  starts = rule.all()
  i = 0
  while (++i < starts.length) {
    var start, broadcast
    start = starts[i]
    broadcast = {}
    // TODO output local ISO string without tz for start and end
    broadcast.start = start.toLocaleString()
    start.setHours(times[1].hours, times[1].minutes, 0, 0)
    if (times[1].hours < times[0].hours) start.setDate(start.getDate + 1)
    broadcast.end = start.toLocaleString()
    //console.log(broadcast)
  }
}

if (require.main === module) {
  // Script run directly; generate broadcasts for all shows
  var queryBody = {
    filter: {term: {active: true}},
    size: 9999
  }
  es.search({_type: 'show', }, queryBody, function (err, data) {
    data.hits.hits.forEach(function (hit) {
      module.exports(hit._source)
    })
  })
}

function getTimes (daytime) {
  var ampm, hours, minutes, time, times, timeMatch, timeSplit
  times = []
  while (timeMatch = timeRe.exec(daytime)) {
    time = timeMatch[0]
    //console.log(time)
    time = time.replace('.', '')
    
    // Split off am/pm
    timeSplit = time.split(' ')
    if (timeSplit.length < 2) return console.log('no ampm')
    time = timeSplit[0]
    ampm = timeSplit[1]
    
    // Split into hours and minutes
    timeSplit = time.split(':')
    hours = timeSplit[0]
    minutes = (timeSplit.length == 2) ? timeSplit[1] : '0'

    if (ampm == 'am' && hours == '12') hours = '0'
    if (ampm == 'pm' && hours != '12') hours = String(Number(hours) + 12)
    //hours = ('0' + hours).substr(hours.length - 1)

    time = {hours: Number(hours), minutes: Number(minutes)}
    //console.log(time)
    times.push(time)
    //timeMatch = timeRe.exec(daytime)
  }
  //times.push(timeRe.exec(daytime)[0]) // end time
  
  // Reset the regex index for the start of next string
  timeRe.lastIndex = 0

  return times
}
