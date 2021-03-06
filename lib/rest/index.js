'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _express = require('express');

var _list = require('./list');

var _list2 = _interopRequireDefault(_list);

var _post = require('./post');

var _post2 = _interopRequireDefault(_post);

var _put = require('./put');

var _put2 = _interopRequireDefault(_put);

var _delete = require('./delete');

var _delete2 = _interopRequireDefault(_delete);

var _patch = require('./patch');

var _patch2 = _interopRequireDefault(_patch);

var _get = require('./get');

var _get2 = _interopRequireDefault(_get);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function authorizePipe(req, res, auth) {
  return new Promise(function (resolve, reject) {
    if (auth !== undefined) {
      if (!auth(req, res)) {
        return reject({ status: 401 });
      }
    }
    return resolve();
  });
}

function beforePipe(req, res, before) {
  return new Promise(function (resolve) {
    if (before) {
      before(req.body, req, res);
    }
    resolve();
  });
}

function respondPipe(req, res, result) {
  return new Promise(function (resolve) {
    var status = result.status || 200;
    var data = result.entity;
    res.status(status).jsonp(data);
    resolve(data);
  });
}

function afterPipe(req, res, after, data) {
  return new Promise(function (resolve) {
    if (after) {
      after(data, req.body, req, res);
    }
    resolve();
  });
}

function errorPipe(req, res, err) {
  return new Promise(function () {
    var status = err.status || 500;
    var text = err.text || err.message || _http2.default.STATUS_CODES[status];
    res.status(status).send(text);
  });
}

function addRestRoutes(router, routes, mongooseModel, options) {
  return routes.map(function (route) {
    var method = route.method,
        url = route.url,
        ctrl = route.ctrl,
        hook = route.hook;

    return router[method](url, function (req, res) {
      authorizePipe(req, res, hook.auth).then(function () {
        return beforePipe(req, res, hook.before);
      }).then(function () {
        return ctrl(req, mongooseModel, options);
      }).then(function (result) {
        return respondPipe(req, res, result || {});
      }).then(function (data) {
        return afterPipe(req, res, hook.after, data);
      }).catch(function (err) {
        return errorPipe(req, res, err);
      });
    });
  });
}

function addActionRoutes(router, resourceURL, actions) {
  return Object.keys(actions).map(function (url) {
    var action = actions[url];
    return router.post('' + resourceURL + url, function (req, res, next) {
      authorizePipe(req, res, action.auth).then(function () {
        return action(req, res, next);
      }).catch(function (result) {
        return errorPipe(req, res, result);
      });
    });
  });
}

var getRouter = function getRouter(mongooseModel, _ref) {
  var url = _ref.url,
      hooks = _ref.hooks,
      actions = _ref.actions,
      options = _ref.options;

  var resourceListURL = '/' + url;
  var resourceURL = resourceListURL + '\\(:id\\)';

  var routes = [{
    method: 'post',
    url: resourceListURL,
    ctrl: _post2.default,
    hook: hooks.post
  }, {
    method: 'put',
    url: resourceURL,
    ctrl: _put2.default,
    hook: hooks.put
  }, {
    method: 'patch',
    url: resourceURL,
    controller: _patch2.default,
    config: hooks.patch
  }, {
    method: 'delete',
    url: resourceURL,
    ctrl: _delete2.default,
    hook: hooks.delete
  }, {
    method: 'get',
    url: resourceURL,
    ctrl: _get2.default,
    hook: hooks.get
  }, {
    method: 'get',
    url: resourceListURL,
    ctrl: _list2.default,
    hook: hooks.list
  }];

  /*eslint-disable */
  var router = (0, _express.Router)();
  /*eslint-enable */
  addRestRoutes(router, routes, mongooseModel, options);
  addActionRoutes(router, resourceURL, actions);
  return router;
};

exports.default = { getRouter: getRouter };