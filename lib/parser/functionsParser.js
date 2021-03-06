'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var convertToOperator = function convertToOperator(odataOperator) {
  var operator = void 0;
  switch (odataOperator) {
    case 'eq':
      operator = '==';
      break;
    case 'ne':
      operator = '!=';
      break;
    case 'gt':
      operator = '>';
      break;
    case 'ge':
      operator = '>=';
      break;
    case 'lt':
      operator = '<';
      break;
    case 'le':
      operator = '<=';
      break;
    default:
      throw new Error('Invalid operator code, expected one of ["==", "!=", ">", ">=", "<", "<="].');
  }
  return operator;
};

// contains(CompanyName,'icrosoft')
var contains = function contains(query, fnKey) {
  var _fnKey$substring$spli = fnKey.substring(fnKey.indexOf('(') + 1, fnKey.indexOf(')')).split(','),
      _fnKey$substring$spli2 = _slicedToArray(_fnKey$substring$spli, 2),
      key = _fnKey$substring$spli2[0],
      target = _fnKey$substring$spli2[1];

  var _ref = [key.trim(), target.trim()];
  key = _ref[0];
  target = _ref[1];

  query.$where('this.' + key + '.indexOf(' + target + ') != -1');
};

// indexof(CompanyName,'X') eq 1
var indexof = function indexof(query, fnKey, odataOperator, value) {
  var _fnKey$substring$spli3 = fnKey.substring(fnKey.indexOf('(') + 1, fnKey.indexOf(')')).split(','),
      _fnKey$substring$spli4 = _slicedToArray(_fnKey$substring$spli3, 2),
      key = _fnKey$substring$spli4[0],
      target = _fnKey$substring$spli4[1];

  var _ref2 = [key.trim(), target.trim()];
  key = _ref2[0];
  target = _ref2[1];

  var operator = convertToOperator(odataOperator);
  query.$where('this.' + key + '.indexOf(' + target + ') ' + operator + ' ' + value);
};

// year(publish_date) eq 2000
var year = function year(query, fnKey, odataOperator, value) {
  var key = fnKey.substring(fnKey.indexOf('(') + 1, fnKey.indexOf(')'));

  var start = new Date(+value, 0, 1);
  var end = new Date(+value + 1, 0, 1);

  switch (odataOperator) {
    case 'eq':
      query.where(key).gte(start).lt(end);
      break;
    case 'ne':
      {
        var condition = [{}, {}];
        condition[0][key] = { $lt: start };
        condition[1][key] = { $gte: end };
        query.or(condition);
        break;
      }
    case 'gt':
      query.where(key).gte(end);
      break;
    case 'ge':
      query.where(key).gte(start);
      break;
    case 'lt':
      query.where(key).lt(start);
      break;
    case 'le':
      query.where(key).lt(end);
      break;
    default:
      throw new Error('Invalid operator code, expected one of ["==", "!=", ">", ">=", "<", "<="].');
  }
};

exports.default = { indexof: indexof, year: year, contains: contains };