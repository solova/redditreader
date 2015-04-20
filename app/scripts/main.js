(function(window, document) {

  var sections = ['hot', 'new', 'top'];

  var params = {
    section: null,
    subreddit: window.location.hash.substr(1) || undefined,
    limit: 25
  };

  var templates = {
    post: doT.template(document.getElementById('posttmpl').text)
  };

  var blocks = {
    posts: document.getElementById('list'),
    menu: document.getElementById('menu'),
    sub: document.getElementById('subname')
  }

  var cache = {};

  Object.observe(params, function(changes) {

    blocks.sub.innerHTML = params.subreddit ? ('/ ' + params.subreddit) : '';

    get(params.limit, params.subreddit)[params.section].then(function(result) {
      render(result);
    });

  });

  function render(raw) {
    var content = raw.data.children.map(function(post) {
      return templates.post(post.data);
    });
    blocks.posts.innerHTML = content.join('');
  }

  function get(limit, subreddit) {

    if (subreddit in cache) {
      return cache[subreddit];
    } else {
      cache[subreddit] = {};
      sections.forEach(function(section) {
        var dfd = Q.defer();
        reddit[section](subreddit).limit(limit).fetch(function(response) {
          dfd.resolve(response);
        })
        cache[subreddit][section] = dfd.promise;
      });
      return cache[subreddit];
    }
  }

  function getComments(article, subreddit, limit) {
    var id = article + subreddit;
    if (id in cache) {
      return cache[id];
    } else {

      var dfd = Q.defer();
      reddit.comments(article, subreddit).limit(limit).fetch(function(response) {
        console.log('response ' , response);
        dfd.resolve(response);
      })
      cache[id] = dfd.promise;
      return dfd.promise;
    }
  }

  get(params.limit, params.subreddit);

  window.go = function(section) {
    params.section = section;
    Array.prototype.forEach.call(blocks.menu.children, function(menuItem) {

      if (menuItem.classList.contains(section)) {
        menuItem.classList.add('active');
      } else {
        menuItem.classList.remove('active');
      }
      //menuItem.classList[menuItem.classList.contains(section) ? 'add' : 'remove' ]('active');
    });
  };

  window.addEventListener('hashchange',
    function(event) {
      console.log('event ' , event);
      var hash = window.location.hash.substr(1);
      params.subreddit = hash || undefined;
    }, false);

  params.section = 'hot';

})(window, document);
