'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _countParser = require('../parser/countParser');

var _countParser2 = _interopRequireDefault(_countParser);

var _filterParser = require('../parser/filterParser');

var _filterParser2 = _interopRequireDefault(_filterParser);

var _orderbyParser = require('../parser/orderbyParser');

var _orderbyParser2 = _interopRequireDefault(_orderbyParser);

var _skipParser = require('../parser/skipParser');

var _skipParser2 = _interopRequireDefault(_skipParser);

var _topParser = require('../parser/topParser');

var _topParser2 = _interopRequireDefault(_topParser);

var _selectParser = require('../parser/selectParser');

var _selectParser2 = _interopRequireDefault(_selectParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _countQuery(model, _ref) {
  var count = _ref.count,
      filter = _ref.filter;

  return new Promise(function (resolve, reject) {
    (0, _countParser2.default)(model, count, filter).then(function (dataCount) {
      return dataCount !== undefined ? resolve({ '@odata.count': dataCount }) : resolve({});
    }).catch(reject);
  });
}

function _dataQuery(model, _ref2, options) {
  var filter = _ref2.filter,
      orderby = _ref2.orderby,
      skip = _ref2.skip,
      top = _ref2.top,
      select = _ref2.select;

  return new Promise(function (resolve, reject) {
    var query = model.find();
    (0, _filterParser2.default)(query, filter).then(function () {
      return (0, _orderbyParser2.default)(query, orderby || options.orderby);
    }).then(function () {
      return (0, _skipParser2.default)(query, skip, options.maxSkip);
    }).then(function () {
      return (0, _topParser2.default)(query, top, options.maxTop);
    }).then(function () {
      return (0, _selectParser2.default)(query, select);
    }).then(function () {
      return query.exec(function (err, data) {
        if (err) {
          return reject(err);
        }
        return resolve({ value: data });
      });
    }).catch(reject);
  });
}

exports.default = function (req, MongooseModel, options) {
  return new Promise(function (resolve, reject) {
    var params = {
      count: req.query.$count,
      filter: req.query.$filter,
      orderby: req.query.$orderby,
      skip: req.query.$skip,
      top: req.query.$top,
      select: req.query.$select
      // TODO expand: req.query.$expand,
      // TODO search: req.query.$search,
    };

    Promise.all([_countQuery(MongooseModel, params), _dataQuery(MongooseModel, params, options)]).then(function (results) {
      var entity = results.reduce(function (current, next) {
        return _extends({}, current, next);
      });
      resolve({ entity: entity });
    }).catch(function (err) {
      return reject({ status: 500, text: err });
    });
  });
};