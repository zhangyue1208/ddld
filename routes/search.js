var express = require('express');
var router = express.Router();
var elasticsearch = require('elasticsearch');
var searchClient = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});
var Platforms = require('../models/platform');
var News = require('../models/news');
var Employments = require('../models/employment');
var Products = require('../models/product');

/**
 * 创建并初始化Elasticsearch的Index, 包括几个重要的model, 例如platform, employment, news, product
 */
router.get('/index/create', function(req, res, next) {
  searchClient
    .indices
    .create({index: 'platform'})
    .then(function(response) {
      console.log('[*] Create index: platform response: ', response);
      searchClient.indices.create({index: 'product'});
    })
    .then(function(response) {
      console.log('[*] Create index: product response: ', response);
      searchClient.indices.create({index: 'news'});
    })
    .then(function(response) {
      console.log('[*] Create index: news response: ', response);
      searchClient.indices.create({index: 'employment'});
    })
    .then(function(response) {
      console.log('[*] Create index: employment response: ', response);
      res.status(200).send("All databases' index has been created");
    })
    .catch(function(err) {
      res.status(400).send(err);
    });
});

router.get('/index/:model/create', function(req, res, next) {
  var model = req.params.model;
  if (model == 'platform') {
    searchClient
      .indices
      .putMapping({
        index: 'ddld',
        type: 'platforms',
        updateAllTypes: true,
        body: {
          platforms: {
            properties: {
              name: {
                type: 'string',
                term_vector: 'with_positions_offsets',
                analyzer: 'ik_smart',
                search_analyzer: 'ik_smart'
              },
              intro: {
                type: 'string',
                term_vector: 'with_positions_offsets',
                analyzer: 'ik_smart',
                search_analyzer: 'ik_smart'
              }
            }
          }
        }
      })
      .then(function(response) {
        console.log('[*] Create type: platforms response: ', response);
        res.status(200).send(response);
      });
  } else if (model == 'product') {
    searchClient
      .indices
      .putMapping({
        index: 'ddld',
        type: 'products',
        updateAllTypes: true,
        body: {
          products: {
            properties: {
              name: {
                type: 'string',
                term_vector: 'with_positions_offsets',
                analyzer: 'ik_smart',
                search_analyzer: 'ik_smart'
              },
              detail: {
                type: 'string',
                term_vector: 'with_positions_offsets',
                analyzer: 'ik_smart',
                search_analyzer: 'ik_smart'
              },
              kind: {
                type: 'string',
                term_vector: 'with_positions_offsets',
                analyzer: 'ik_smart',
                search_analyzer: 'ik_smart'
              },
              sub_kind: {
                type: 'string',
                term_vector: 'with_positions_offsets',
                analyzer: 'ik_smart',
                search_analyzer: 'ik_smart'
              }
            }
          }
        }
      })
      .then(function(response) {
        console.log('[*] Create type: products response:', response);
        res.status(200).send(response);
      });
  } else if (model == 'news') {
    searchClient
      .indices
      .putMapping({
        index: 'ddld',
        type: 'news',
        updateAllTypes: true,
        body: {
          news: {
            properties: {
              title: {
                type: 'string',
                term_vector: 'with_positions_offsets',
                analyzer: 'ik_smart',
                search_analyzer: 'ik_smart'
              },
              abstract: {
                type: 'string',
                term_vector: 'with_positions_offsets',
                analyzer: 'ik_smart',
                search_analyzer: 'ik_smart'
              },
              kind: {
                type: 'string',
                index: 'not_analyzed'
              },
              tags: {
                type: 'string',
                index: 'not_analyzed'
              }
            }
          }
        }
      })
      .then(function(response) {
        console.log('[*] Create type: news response: ', response);
        res.status(200).send(response);
      });
  } else if (model == 'employment') {
    searchClient
      .indices
      .putMapping({
        index: 'ddld',
        type: 'employments',
        updateAllTypes: true,
        body: {
          employments: {
            properties: {
              title: {
                type: 'string',
                term_vector: 'with_positions_offsets',
                analyzer: 'ik_smart',
                search_analyzer: 'ik_smart'
              },
              requirement: {
                type: 'string',
                term_vector: 'with_positions_offsets',
                analyzer: 'ik_smart',
                search_analyzer: 'ik_smart'
              },
              duty: {
                type: 'string',
                term_vector: 'with_positions_offsets',
                analyzer: 'ik_smart',
                search_analyzer: 'ik_smart'
              }
            }
          }
        }
      })
      .then(function(response) {
        console.log('[*] Create type: employments response: ', response);
        res.status(200).send(response);
      });
  }
});

module.exports = router;
