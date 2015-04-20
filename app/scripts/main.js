(function(window, document, Q, reddit, doT) {

  "use strict";

  //reddit sections
  var sections = ['hot', 'new', 'top'];

  //app state
  var params = {
    section: null,
    subreddit: window.location.hash.substr(1) || undefined,
    limit: 25
  };

  //doT templates
  var templates = {
    post: doT.template(document.getElementById('posttmpl').text)
  };

  //DOM nodes
  var blocks = {
    posts: document.getElementById('list'),
    menu: document.getElementById('menu'),
    sub: document.getElementById('subname')
  };

  //simple cache
  var cache = {};

  //observer
  Object.observe(params, function() {

    blocks.sub.innerHTML = params.subreddit ? ('/ ' + params.subreddit) : '';

    get(params.limit, params.subreddit)[params.section].then(function(result) {
      render(result);
    });

  });

  //reflect data to DOM
  function render(raw) {
    var content = raw.data.children.map(function(post) {
      return templates.post(post.data);
    });
    blocks.posts.innerHTML = content.join('');
  }

  //get posts
  function get(limit, subreddit) {

    if (subreddit in cache) {
      return cache[subreddit];
    } else {
      cache[subreddit] = {};
      sections.forEach(function(section) {
        var dfd = Q.defer();
        reddit[section](subreddit).limit(limit).fetch(function(response) {
          dfd.resolve(response);
        });
        cache[subreddit][section] = dfd.promise;
      });
      return cache[subreddit];
    }
  }

  //unfinished
  function getComments(article, subreddit, limit) {
    var id = article + subreddit;
    if (id in cache) {
      return cache[id];
    } else {

      var dfd = Q.defer();
      reddit.comments(article, subreddit).limit(limit).fetch(function(response) {
        console.log('response ' , response);
        dfd.resolve(response);
      });
      cache[id] = dfd.promise;
      return dfd.promise;
    }
  }

  //change section
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

  //reaction on URL change
  window.addEventListener('hashchange',
    function(event) {
      console.log('event ' , event);
      var hash = window.location.hash.substr(1);
      params.subreddit = hash || undefined;
    }, false);

  //default section
  params.section = 'hot';

})(window, document, window.Q, window.reddit, window.doT);
