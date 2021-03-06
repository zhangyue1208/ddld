var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var Q = require('q');
var async = require('async');
var Transfer = require('../models/transfer');
var Merchant = require('../models/merchant');
var News = require('../models/news');
var Employments = require('../models/employment');
var Platforms = require('../models/platform');
var indexPageCache = require('../utils/cache').createIndexPageCache();
var modalContentCache = require('../utils/modal_content').createModalContentCache();
var GeoDataGetter = require('../utils//geodata.js').GeoDataGetter();

var introImagePath = path.join(__dirname, '..', 'uploads', 'certifications', 'images');

/* GET home page. */
router.get('/', function(req, res, next) {
  var indexPage = indexPageCache.get();
  if (indexPage) {
    // 没有过期, 存有数据
    res.render('index', indexPage);
  } else {
    // 已经过期,或者没有数据
    var data = {};
    var news_list = {};
    Transfer
      .find()
      .limit(10)
      .sort({date: -1})
      .exec()
      .then(function(products) {
        data['products_list'] = products;
        return News
                .find({kind: 'company'})
                .limit(3)
                .sort({date: -1})
                .exec()
      })
      .then(function(news) {
        news_list['company'] = news;
        return News
                .find({kind: 'industry'})
                .limit(3)
                .sort({date: -1})
                .exec();
      })
      .then(function(news) {
        news_list['industry'] = news;
        data['news_list'] = splitNewsArray(news_list);
        // 更新数据, 保存到cache中
        indexPageCache.set(data);
        res.render('index', data);
      })
      .catch(function(err) {
        console.log(err);
        res.render('404', {err: err});
      });
  }
});

/**
 * 将新闻数组分为几个子数组
 */
function splitNewsArray(original_news_list) {
  var news_list = new Array();
  for (var i = 0; i < original_news_list['company'].length ; i++) {
    news_list.push([original_news_list['company'][i], original_news_list['industry'][i]]);
  };
  return news_list;
}

router.get('/404', function(req, res, next) {
  res.render('404');
});

router.get('/intro', function(req, res, next) {
  fs.readdir(introImagePath, function(err, files) {
    if (err || files.length <= 0) {
      res.render('intro', {images: []});
    } else {
      var oriImageList = {};
      files.forEach(function(file) {
        var ext = path.extname(file).toLowerCase();
        if (ext == '.jpg' || ext == '.jpeg' || ext == '.png' || ext == '.gif') {
          var mtime = new Date(fs.statSync(path.join(introImagePath, file)).mtime).getTime();
          oriImageList[mtime.toString()] = file;
        }
      });
      var keys = Object.keys(oriImageList);
      var sortedImageList = Object.keys(oriImageList).sort();
      var imageList = [];
      sortedImageList.forEach(function(key) {
        imageList.push({
          image: '/certifications/images/' + oriImageList[key],
          thumbnail: '/certifications/thumbnails/' + oriImageList[key]
        });
      });
      res.render('intro', {images: imageList});  
    }
  });
});

/**
 * geodata,百度地图数据
 */
router.get('/geodata', function(req, res, next){
  var data = GeoDataGetter;
  data.reverse();
  res.status(200).send(data);
});

/**
 * 联系我们
 */
router.get('/contact', function(req, res, next) {
  Employments
    .find()
    .exec()
    .then(function(employments) {
      res.render('contact', {employments: employments});
    })
    .catch(function(err) {
      res.render('404', {err: err});
    })
});

/**
 * 加入我们
 */
router.get('/employ', function(req, res, next) {
  Employments
    .find()
    .exec()
    .then(function(employments) {
      res.render('employ', {employments: employments});
    })
    .catch(function(err) {
      res.render('404', {err: err});
    });
});

/**
 * 友情链接
 */
router.get('/friend', function(req, res, next) {

});

/**
 * 获取详细信息
 */
router.get('/employment/detail', function(req, res, next) {
  var employmentId = req.query.id || "";
  if (!employmentId) {
    res.status(404).send();
  } else {
    Employments
      .findById(employmentId)
      .exec()
      .then(function(employment) {
        res.status(200).send(employment);
      })
      .catch(function(err) {
        res.status(400).send(err);
      });
  }
});

/**
 * 提交招聘信息
 */
router.post('/employment', function(req, res, next) {
  var employmentId = req.query.id || "";
  var title = req.body.title;
  var requirement = req.body.requirement.split('\n');
  var duty = req.body.duty.split('\n');
  if (employmentId) {
    Employments
      .findById(employmentId)
      .exec()
      .then(function(employment) {
        employment.title = title;
        employment.requirement = requirement;
        employment.duty = duty;
        return employment.save();
      })
      .then(function(employment) {
        res.status(200).send(employment);
      })
      .catch(function(err) {
        res.status(404).send(err);
      });
  } else {
    var employment = new Employments({
      title: title,
      requirement: requirement,
      duty: duty
    });
    employment
      .save()
      .then(function(employment) {
        res.status(200).send(employment);
      })
      .catch(function(err) {
        res.status(400).send(err);
      });
  }
});

/**
 * 删除招聘信息
 */
router.delete('/employment', function(req, res, next) {
  var employmentId = req.query.id || "";
  Employments
    .findByIdAndRemove(employmentId, function(err) {
      if (err) {
        res.status(204).send(err);
      } else {
        res.status(200).send();
      }
    });
});

/**
 * 技术平台相关API
 */
router.get('/platform', function(req, res, next) {
  var platformId = req.query.id || "";
  if (platformId) {
    Platforms
      .findById(platformId)
      .exec()
      .then(function(platform) {
        res.status(200).send(platform);
      })
      .catch(function(err) {
        res.status(404).send(err);
      });
  } else {
    Platforms
      .find()
      .exec()
      .then(function(platforms) {
        res.render('platform', {platforms: platforms});
      })
      .catch(function(err) {
        res.render('404', {err: err});
      });
  }
});

router.post('/platform', function(req, res, next) {
  var platformId = req.query.id || "";
  var name = req.body.name;
  var intro = req.body.intro;
  if (platformId) {
    Platforms
      .findById(platformId)
      .exec()
      .then(function(platform) {
        platform.name = name;
        platform.intro = intro;
        return platform.save();
      })
      .then(function(platform) {
        res.status(200).send();
      })
      .catch(function(err) {
        res.status(404).send(err);
      });
  } else {
    var platform = new Platforms({
      name: name,
      intro: intro
    });
    platform
    .save()
    .then(function(platform) {
      res.status(200).send();
    })
    .catch(function(err) {
      res.status(400).send(err);
    });
  }
});

router.delete('/platform', function(req, res, next) {
  var platformId = req.query.id || "";
  if (!platformId) {
    res.status(404).send();
  } else {
    Platforms
      .findByIdAndRemove(platformId, function(err) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.status(200).send();
        }
      });
  }
});

/**
 * 创建modal需要显示的内容的RESTful API
 */
router.get('/modal_content', function(req, res, next) {
  modalContentCache.get(function(err, data) {
    console.log(data);
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

router.post('/modal_content', function(req, res, next) {
  var data = {
    title: req.body.title,
    content: req.body.content,
    link: req.body.link
  }
  modalContentCache.update(data, function(err) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(data);
    }
  });
});

router.delete('/modal_content', function(req, res, next) {
  modalContentCache.clear(function(err) {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send();
    }
  });  
});

/**
 * 公司组织结构
 */
router.get('/company', function(req, res, next) {
  var orgnizationImagePath = path.join(__dirname, '..', 'uploads', 'orgnizations');
  fs.readdir(orgnizationImagePath, function(err, files) {
    if (err || files.length == 0) {
      res.render('company', {image: null});
    } else {
      var finished = false;
      files.forEach(function(file) {
        var extname = path.extname(file).toLowerCase();
        if (extname == '.jpg' || extname == '.png' || extname == '.gif') {
          finished = true;
          res.render('company', {image: '/orgnizations/' + file});
        }
      });
      if (finished == false) {
        res.render('company', {image: null});
      }
    }
  });
});

module.exports = router;
