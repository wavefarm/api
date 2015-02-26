var es = require('../es');
var genb = require('../lib/genb');

es.search({_type: 'show'}, {
  filter: {term: {public: true}},
  size: 9999
}, function (err, data) {
  if (err) throw err;
  data.hits.hits.forEach(function (hit) {
    //console.log(hit);
    createBroadcasts(hit._source);
  });
});

function createBroadcasts (show) {
  var broadcast, broadcasts = genb(show), commands = [];

  for (var i = 0; i < broadcasts.length; i++) {
    broadcast = broadcasts[i];
    commands.push({index: {_index: process.env.ESINDEX || 'free103', _type: 'broadcast', _id: broadcast.id}});
    commands.push(broadcast);

    break;
  }

  if (commands.length) {
    es.bulk({}, commands, function (err, data) {
      if (err) throw err;
      console.log(data.items[0].index);
    });
  } else console.log('No broadcasts for ' + show.id);
}
