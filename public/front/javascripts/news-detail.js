(function($) {
  function parseNewsId() {
    var url = location.href;
    var URLRegExp = new RegExp('\/news\/detail\/([0-9a-zA-Z]*)?');
    return URLRegExp.exec(url)[1];
  }

  $(function() {
    var url = '/news/detail?id=' + parseNewsId();
    $.get(url, function(news, status, _) {
      if (status == 'success') {
        new Sosh('#sosh-share', {
          title: news.title,
          digest: news.abstract,
          pic: news.thumbnail,
          sites: ['weixin', 'weixintimeline', 'weibo', 'qq', 'qzone']
        });
      }
    });
  });
}(jQuery));
