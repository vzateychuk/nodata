'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _express = require('./express');

var _express2 = _interopRequireDefault(_express);

var _ODataResource = require('./ODataResource');

var _ODataResource2 = _interopRequireDefault(_ODataResource);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

_mongoose2.default.Promise = global.Promise;

function checkAuth(auth, req) {
  return !auth || auth(req);
}

var Server = function () {
  function Server(db, prefix, options) {
    _classCallCheck(this, Server);

    this._app = (0, _express2.default)(options);
    this._mongoose = _mongoose2.default;
    this._settings = {
      maxTop: 10000,
      maxSkip: 10000,
      orderby: undefined
    };
    this.defaultConfiguration(db, prefix);

    // TODO: Infact, resources is a mongooseModel instance, origin name is repositories.
    // Should mix _resources object and resources object: _resources + resource = resources.
    // Encapsulation to a object, separate mognoose, try to use *repository pattern*.
    // 这里也许应该让 resources 支持 odata 查询的, 以方便直接在代码中使用 OData 查询方式来进行数据筛选, 达到隔离 mongo 的效果.
    this._resources = [];
    this.resources = {};
  }

  _createClass(Server, [{
    key: 'defaultConfiguration',
    value: function defaultConfiguration(db) {
      var prefix = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      this.set('app', this._app);
      this.set('db', db);
      this.set('prefix', prefix);
    }
  }, {
    key: 'resource',
    value: function resource(name, model) {
      if (model === undefined) {
        return this._resources.name;
      }
      var resource = new _ODataResource2.default(name, model);
      this._resources.push(resource);
      return resource;
    }
  }, {
    key: 'post',
    value: function post(url, callback, auth) {
      var app = this.get('app');
      var prefix = this.get('prefix');
      app.post('' + prefix + url, function (req, res, next) {
        if (checkAuth(auth, req)) {
          callback(req, res, next);
        } else {
          res.status(401).end();
        }
      });
    }
  }, {
    key: 'put',
    value: function put(url, callback, auth) {
      var app = this.get('app');
      var prefix = this.get('prefix');
      app.put('' + prefix + url, function (req, res, next) {
        if (checkAuth(auth, req)) {
          callback(req, res, next);
        } else {
          res.status(401).end();
        }
      });
    }
  }, {
    key: 'delete',
    value: function _delete(url, callback, auth) {
      var app = this.get('app');
      var prefix = this.get('prefix');
      app.delete('' + prefix + url, function (req, res, next) {
        if (checkAuth(auth, req)) {
          callback(req, res, next);
        } else {
          res.status(401).end();
        }
      });
    }
  }, {
    key: 'patch',
    value: function patch(url, callback, auth) {
      var app = this.get('app');
      var prefix = this.get('prefix');
      app.patch('' + prefix + url, function (req, res, next) {
        if (checkAuth(auth, req)) {
          callback(req, res, next);
        } else {
          res.status(401).end();
        }
      });
    }
  }, {
    key: 'listen',
    value: function listen() {
      var _this = this,
          _app;

      this._resources.map(function (resource) {
        var router = resource._router(_this._db, _this._settings);
        _this._app.use(_this.get('prefix'), router);
        _this.resources[resource._name] = _this._db.model(resource._name);
        return true;
      });
      return (_app = this._app).listen.apply(_app, arguments);
    }
  }, {
    key: 'use',
    value: function use() {
      var _app2;

      if ((arguments.length <= 0 ? undefined : arguments[0]) instanceof _ODataResource2.default) {
        this._resources.push(arguments.length <= 0 ? undefined : arguments[0]);
        return;
      }
      (_app2 = this._app).use.apply(_app2, arguments);
    }
  }, {
    key: 'get',
    value: function get(key, callback, auth) {
      if (callback === undefined) {
        return this._settings[key];
      }
      // TODO: Need to refactor, same as L70-L80
      var app = this.get('app');
      var prefix = this.get('prefix');
      return app.get('' + prefix + key, function (req, res, next) {
        if (checkAuth(auth, req)) {
          callback(req, res, next);
        } else {
          res.status(401).end();
        }
      });
    }
  }, {
    key: 'set',
    value: function set(key, val) {
      switch (key) {
        case 'db':
          {
            var options = { server: { reconnectTries: Number.MAX_VALUE } };
            this._db = _mongoose2.default.createConnection(val, options, function (err) {
              if (err) {
                console.error('Failed to connect to database on startup.');
                process.exit();
              }
            });

            this._settings[key] = val;
            break;
          }
        case 'prefix':
          {
            var prefix = val;
            if (prefix === '/') {
              prefix = '';
            }
            if (prefix.length > 0 && prefix[0] !== '/') {
              prefix = '/' + prefix;
            }
            this._settings[key] = prefix;
            break;
          }
        default:
          {
            this._settings[key] = val;
            break;
          }
      }
      return this;
    }

    // provide a event listener to handle not able to connect DB.

  }, {
    key: 'on',
    value: function on(name, event) {
      if (['connected', 'disconnected'].indexOf(name) > -1) {
        this._db.on(name, event);
      }
    }
  }, {
    key: 'engine',
    value: function engine() {
      var _app3;

      (_app3 = this._app).engine.apply(_app3, arguments);
    }
  }]);

  return Server;
}();

exports.default = Server;