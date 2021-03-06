'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _model = require('./model');

var _model2 = _interopRequireDefault(_model);

var _rest = require('./rest');

var _rest2 = _interopRequireDefault(_rest);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function hook(resource, pos, fn) {
  var method = resource._currentMethod;
  if (method === 'all') {
    method = ['get', 'post', 'put', 'delete', 'patch', 'list'];
  } else {
    method = [method];
  }
  /*eslint-disable */
  method.map(function (curr) {
    if (resource._hooks[curr][pos]) {
      var _fn = resource._hooks[curr][pos];
      resource._hooks[curr][pos] = function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        _fn.apply(resource, args);
        fn.apply(resource, args);
      };
    } else {
      resource._hooks[curr][pos] = fn;
    }
  });
  /*eslint-enable */
}

var _default = function () {
  function _default(name, userModel) {
    _classCallCheck(this, _default);

    this._name = name;
    this._url = name;
    this._model = userModel;
    this._hooks = {
      list: {},
      get: {},
      post: {},
      put: {},
      delete: {},
      patch: {}
    };
    this._actions = {};
    this._options = {
      maxTop: 10000,
      maxSkip: 10000,
      orderby: undefined
    };
  }

  _createClass(_default, [{
    key: 'action',
    value: function action(url, fn, auth) {
      this._actions[url] = fn;
      this._actions[url].auth = auth;
      return this;
    }
  }, {
    key: 'maxTop',
    value: function maxTop(count) {
      this._maxTop = count;
      return this;
    }
  }, {
    key: 'maxSkip',
    value: function maxSkip(count) {
      this._maxSkip = count;
      return this;
    }
  }, {
    key: 'orderBy',
    value: function orderBy(field) {
      this._orderby = field;
      return this;
    }
  }, {
    key: 'list',
    value: function list() {
      this._currentMethod = 'list';
      return this;
    }
  }, {
    key: 'get',
    value: function get() {
      this._currentMethod = 'get';
      return this;
    }
  }, {
    key: 'post',
    value: function post() {
      this._currentMethod = 'post';
      return this;
    }
  }, {
    key: 'put',
    value: function put() {
      this._currentMethod = 'put';
      return this;
    }
  }, {
    key: 'delete',
    value: function _delete() {
      this._currentMethod = 'delete';
      return this;
    }
  }, {
    key: 'patch',
    value: function patch() {
      this._currentMethod = 'patch';
      return this;
    }
  }, {
    key: 'all',
    value: function all() {
      this._currentMethod = 'all';
      return this;
    }
  }, {
    key: 'before',
    value: function before(fn) {
      hook(this, 'before', fn);
      return this;
    }
  }, {
    key: 'after',
    value: function after(fn) {
      hook(this, 'after', fn);
      return this;
    }
  }, {
    key: 'auth',
    value: function auth(fn) {
      var _this = this;

      var method = this._currentMethod;
      if (method === 'all') {
        method = ['get', 'post', 'put', 'delete', 'patch', 'list'];
      } else {
        method = [method];
      }
      method.map(function (curr) {
        _this._hooks[curr].auth = fn;
        return undefined;
      });
      return this;
    }
  }, {
    key: 'url',
    value: function url(_url) {
      this._url = _url;
      return this;
    }
  }, {
    key: '_router',
    value: function _router(db) {
      var setting = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      // remove '/' if url is startwith it.
      if (this._url.indexOf('/') === 0) {
        this._url = this._url.substr(1);
      }

      // not allow contain '/' in url.
      if (this._url.indexOf('/') >= 0) {
        throw new Error('Url of resource[' + this._name + '] can\'t contain "/",' + 'it can only be allowed to exist in the beginning.');
      }

      var mongooseModel = _model2.default.register(db, this._url, this._model);

      var params = {
        url: this._url,
        options: {
          maxTop: (0, _utils.min)([setting.maxTop, this._maxTop]),
          maxSkip: (0, _utils.min)([setting.maxSkip, this._maxSkip]),
          orderby: this._orderby || setting.orderby
        },
        hooks: this._hooks,
        actions: this._actions
      };

      return _rest2.default.getRouter(mongooseModel, params);
    }
  }]);

  return _default;
}();

exports.default = _default;