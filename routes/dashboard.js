var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var Transfer = require('../models/transfer');
var Merchant = require('../models/merchant');
var News = require('../models/news');
var Employments = require('../models/employment');
var Platforms = require('../models/platform');

var introImagePath = path.join(__dirname, '..', 'uploads', 'certifications', 'images');

// 添加中间件, 用来限制管理员权限, 如果没有权限, 不能进入dashboard
router.use(function checkUser(req, res, next) {
  if (!req.user) {
    res.redirect('/users/login');
  } else {
    next();
  }
})

/**
 * 后台首页
 */
router.get('/home', function(req, res, next) {
  res.render('dashboard/index');
});

/**
 * 多媒体管理
 */
router.get('/intro', function(req, res, next) {
  var imagesPath = introImagePath;
  var images = new Array();
  fs.readdir(imagesPath, function(err, files) {
    if (err || files.length === 0) {
      res.render('dashboard/intro', {images: []});
    } else {
      var images = new Array();
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (path.extname(file) == '.jpg' || path.extname(file) == '.png') {
          var url = '/certifications/images/' + file;
          images.push({
            thumbnail: url.replace('images', 'thumbnails'),
            image: url
          });
        }
      }
      res.render('dashboard/intro', {images: images}); 
    }
  });
});

/**
 * 技术平台管理列表页
 */
router.get('/platforms', function(req, res, next) {
  Platforms
    .find()
    .exec()
    .then(function(platforms) {
      res.render('dashboard/platforms', {platforms: platforms});
    })
    .catch(function(err) {
      console.log(err);
      res.render('404', {err: err});
    });
});

/**
 * 技术平台详情页面
 */
router.get('/platform', function(req, res, next) {
  res.render('dashboard/platform');
})

/**
 * 产品管理--转让产品列表
 */
router.get('/products/transfer', function(req, res, next) {
  Products
  .find({kind: 'transfer'})
  .exec()
  .then(function(products) {
    res.render('dashboard/transfer', {products: products});
  })
  .catch(function(err) {
    res.render('404');
  });

});

/**
 * 产品管理--招商产品列表
 */
router.get('/products/merchant', function(req, res, next) {
  var sub_kind = req.query.kind || "";
  var query = {
    kind: 'merchant'
  }
  if (sub_kind) {
    query['sub_kind'] = {$in: [sub_kind]};
  }
  Products
    .find(query)
    .exec()
    .then(function(products) {
      res.render('dashboard/merchant', {products: products});
    })
    .catch(function(err) {
      res.render('404');
    });
});

/**
 * 获取产品详情
 * :type: merchant | transfer
 */
router.get('/products/product/:type', function(req, res, next) {
  var productId = req.query.id || "";
  if (productId) {
    Products
    .findById(productId)
    .exec()
    .then(function(product) {
      if (req.params.type == 'transfer') {
        res.render('dashboard/product_transfer', {product: product});
      } else if (req.params.type == 'merchant') {
        res.render('dashboard/product_merchant', {product: product});
      }
    })
    .catch(function(err) {
      res.render('404');
    })
  } else {
    if (req.params.type == 'transfer') {
      res.render('dashboard/product_transfer');
    } else if (req.params.type == 'merchant') {
      res.render('dashboard/product_merchant');
    }
  }
});

/**
 * 资讯列表
 */
router.get('/news', function(req, res, next) {
  News
    .find()
    .exec()
    .then(function(news_list) {
      res.render('dashboard/news', {news_list: news_list});
    })
    .catch(function(err) {
      res.render('../404');
    });
});

/**
 * 资讯详情: 新增&修改
 */
router.get('/news/detail', function(req, res, next) {
  res.render('dashboard/news_detail');
});

/**
 * 招聘信息列表
 */
router.get('/employment', function(req, res, next) {
  Employments
    .find()
    .exec()
    .then(function(employments) {
      res.render('dashboard/employment', {employments: employments});
    })
    .catch(function(err) {
      res.status(404).send(err);
    });
});

/**
 * 添加新的招聘信息
 */
router.get('/employment/new', function(req, res, next) {
  res.render('dashboard/employment_new');
});

router.get('/employment/detail', function(req, res, next) {
  res.render('dashboard/employment_new');
});

module.exports = router;
