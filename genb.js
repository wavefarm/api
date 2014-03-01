var es = require('./es')
var RRule = require('rrule').RRule

var timeRe = /\d+:?\d* *(?:a|p).?m/ig

module.exports = function(show) {
  var rule, i, starts, start, broadcast
  if (!show.airtime) return

  // Generate broadcasts for show
  rule = parseAirtime(show.airtime)
  console.log(rule.toString())
  starts = rule.all()
  i = 0
  while (++i < starts.length) {
    start = starts[i]
    broadcast = {}
    // TODO Save start and end as UTC
    broadcast.start = start.toLocaleString()
    start.setHours(times[1].hours, times[1].minutes, 0, 0)

    // Set end to next day if we cross midnight
    if (times[1].hours < times[0].hours) start.setDate(start.getDate() + 1)

    broadcast.end = start.toLocaleString()
    broadcast.shows = [{id: show.id, main: show.main}]
    broadcast.description = show.description

    console.log(broadcast)
    break
  }
}

// Returns an rrule with an added end time property
// Can't create another rrule for end times because they may fall on the
// following day -- so Wednesdays from 11pm to 2am would actually end on
// Thursday mornings.
function parseAirtime (airtime) {
  var times
  times = getTimes(show.airtime)
  if (times.length < 2) return console.log('Bad times', show.oldId, show.airtime)

  startDate = show.startDate ? new Date(show.startDate) : new Date()
  // Set time on startDate to start time
  startDate.setHours(times[0].hours, times[0].minutes, 0, 0)
  options.dtstart = startDate
  // TODO show endDates should all be 2015-03-14, and default to that for
  // this program term
  options.until = new Date('2015-03-14') //new Date(show.endDate)

  options = {}

  // TODO parse out frequency, interval, etc. from airtime
  options.freq = RRule.MONTHLY

  //console.log(options)
  rule = new RRule(options)
  
}

function getTimes (airtime) {
  var ampm, hours, minutes, time, times, timeMatch, timeSplit
  times = []
  while (timeMatch = timeRe.exec(airtime)) {
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
    //timeMatch = timeRe.exec(airtime)
  }
  //times.push(timeRe.exec(airtime)[0]) // end time
  
  // Reset the regex index for the start of next string
  timeRe.lastIndex = 0

  return times
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
