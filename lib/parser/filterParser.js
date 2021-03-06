'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }(); // Operator  Description             Example
// Comparison Operators
// eq        Equal                   Address/City eq 'Redmond'
// ne        Not equal               Address/City ne 'London'
// gt        Greater than            Price gt 20
// ge        Greater than or equal   Price ge 10
// lt        Less than               Price lt 20
// le        Less than or equal      Price le 100
// has       Has flags               Style has Sales.Color'Yellow'    #todo
// Logical Operators
// and       Logical and             Price le 200 and Price gt 3.5
// or        Logical or              Price le 3.5 or Price gt 200     #todo
// not       Logical negation        not endswith(Description,'milk') #todo

// eg.
//   http://host/service/Products?$filter=Price lt 10.00
//   http://host/service/Categories?$filter=Products/$count lt 10

var _functionsParser = require('./functionsParser');

var _functionsParser2 = _interopRequireDefault(_functionsParser);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var OPERATORS_KEYS = ['eq', 'ne', 'gt', 'ge', 'lt', 'le', 'has'];

var stringHelper = {
  has: function has(str, key) {
    return str.indexOf(key) >= 0;
  },

  isBeginWith: function isBeginWith(str, key) {
    return str.indexOf(key) === 0;
  },

  isEndWith: function isEndWith(str, key) {
    return str.lastIndexOf(key) === str.length - key.length;
  },

  removeEndOf: function removeEndOf(str, key) {
    if (stringHelper.isEndWith(str, key)) {
      return str.substr(0, str.length - key.length);
    }
    return str;
  }
};

var validator = {
  formatValue: function formatValue(value) {
    var val = void 0;
    if (value === 'true') {
      val = true;
    } else if (value === 'false') {
      val = false;
    } else if (+value === +value) {
      val = +value;
    } else if (stringHelper.isBeginWith(value, "'") && stringHelper.isEndWith(value, "'")) {
      val = value.slice(1, -1);
    } else if (value === 'null') {
      val = value;
    } else {
      return { err: 'Syntax error at \'' + value + '\'.' };
    }
    return { val: val };
  }
};

exports.default = function (query, $filter) {
  return new Promise(function (resolve, reject) {
    if (!$filter) {
      return resolve();
    }

    var condition = (0, _utils.split)($filter, ['and', 'or']).filter(function (item) {
      return item !== 'and' && item !== 'or';
    });

    condition.map(function (item) {
      // parse "indexof(title,'X1ML') gt 0"
      var conditionArr = (0, _utils.split)(item, OPERATORS_KEYS);
      if (conditionArr.length === 0) {
        // parse "contains(title,'X1ML')"
        conditionArr.push(item);
      }
      if (conditionArr.length !== 3 && conditionArr.length !== 1) {
        return reject('Syntax error at \'' + item + '\'.');
      }

      var key = conditionArr[0];

      var _conditionArr = _slicedToArray(conditionArr, 3),
          odataOperator = _conditionArr[1],
          value = _conditionArr[2];

      if (key === 'id') key = '_id';

      var val = void 0;
      if (value !== undefined) {
        var result = validator.formatValue(value);
        if (result.err) {
          return reject(result.err);
        }
        val = result.val;
      }

      // function query
      var functionKey = key.substring(0, key.indexOf('('));
      if (['indexof', 'year', 'contains'].indexOf(functionKey) > -1) {
        _functionsParser2.default[functionKey](query, key, odataOperator, val);
      } else {
        if (conditionArr.length === 1) {
          return reject('Syntax error at \'' + item + '\'.');
        }
        if (value === 'null') {
          switch (odataOperator) {
            case 'eq':
              query.exists(key, false);
              return resolve();
            case 'ne':
              query.exists(key, true);
              return resolve();
            default:
              break;
          }
        }
        // operator query
        switch (odataOperator) {
          case 'eq':
            query.where(key).equals(val);
            break;
          case 'ne':
            query.where(key).ne(val);
            break;
          case 'gt':
            query.where(key).gt(val);
            break;
          case 'ge':
            query.where(key).gte(val);
            break;
          case 'lt':
            query.where(key).lt(val);
            break;
          case 'le':
            query.where(key).lte(val);
            break;
          default:
            return reject("Incorrect operator at '#{item}'.");
        }
      }
      return undefined;
    });
    return resolve();
  });
};