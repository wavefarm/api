var schemas = require('../schemas')
var es = require('es')
var url = require('url')

var getSettings = function() {
  var settings = { 
    mappings: {},
    settings: {
      index: {
        number_of_shards: 1,
        number_of_replicas: 0
      },
      analysis: {
        analyzer: {
          sort: {
            type: "custom",
            tokenizer: "keyword",
            filter: "lowercase"
          }
        }
      }
    }
  };
  for (schema in schemas) {
    if (schema.indexOf('.') == -1) {
      var fields = schemas[schema].fields;
      settings.mappings[schema] = {
        properties: {}
      };
      for (var i=0, l=fields.length, field; i<l; i++) {
        field = fields[i];
        if (field.sort) {
          var sortField = {
            type: 'multi_field',
            fields: {
              sort: {type: 'string', analyzer: 'sort'}
            }
          };
          sortField.fields[field.name] = {type: 'string'};
          settings.mappings[schema].properties[field.name] = sortField;
        }
      }
    }
  }
  return settings;
};

module.exports = function(req, res) {
  var data = '', query = url.parse(req.url, true).query;
  req.on('data', function(chunk) {data += chunk;});
  req.on('end', function() {
    if (query.replace) {
      // TODO switch to new es api if it gets extended
      // check aliases for which index to create
      es.request({
        path: '/_aliases',
        res: res
      }, function(err, json) {
        var indices = JSON.parse(json);
        var index, oldIndex;
        if (!indices['free103a']) {
          index = 'free103a';
          // check in case there are no indexes
          if (indices['free103b']) {
            oldIndex = 'free103b';
          }
        } else {
          index = 'free103b';
          oldIndex = 'free103a';
        }
        // create new index
        var settings = getSettings();
        //console.log(settings);
        es.request({
          path: '/'+index,
          method: 'PUT',
          data: JSON.stringify(settings),
          res: res,
        }, function() {
          // add alias and remove old if necessary
          var actions = [{add: {index: index, alias: 'free103'}}];
          if (oldIndex) {
            actions.unshift({remove: {index: oldIndex, alias: 'free103'}});
          }
          es.request({
            path: '/_aliases',
            method: 'POST',
            data: JSON.stringify({actions: actions}),
            res: res
          }, function() {
            // load bulk
            es.request({
              path: '/_bulk',
              method: 'POST',
              data: data,
              res: res,
              respond: true
            });
            // delete old index if necessary
            if (oldIndex) {
              es.request({
                path: '/'+oldIndex,
                method: 'DELETE',
                res: res
              });
            }
          });
        });
      });
      return;
    }
    es.request({
      path: '/_bulk',
      method: 'POST',
      data: data,
      res: res,
      respond: true
    });
  });
};

