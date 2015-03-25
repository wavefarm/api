require('esindexdump')(function (doc) {
  var s = doc._source;

  // Set "start" and "end" datetimes
  // TODO convert to UTC

  // Only modify if it has startDate to begin with
  if (!s.startDate) return doc;

  // Only if start and end haven't already been created
  if (s.start && s.end) return doc;

  s.allDay = true;
  s.start = s.startDate;
  s.end = s.startDate;
  if (s.startTime) {
    s.allDay = false;
    s.start += 'T' + s.startTime;
  } else {
    s.start += 'T00:00:00';
  }
  if (s.endDate) {
    s.end = s.endDate;
  }
  if (s.endTime) {
    s.end += 'T' + s.endTime;
  } else {
    s.end += 'T23:59:59';
  }
  return doc;
});
