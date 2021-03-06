'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.min = min;
exports.split = split;
// like _.min
function min(arr) {
  return arr.map(function (item) {
    return +item;
  }).filter(function (item) {
    return Number.isInteger(item);
  }).reduce(function (current, next) {
    return current < next ? current : next;
  });
}

function merge(list) {
  return list.join(' ').trim();
}

/**
 * split by multiple keywords in a sentence
 *
 * @example
   split('Price le 200 and Price gt 3.5 or length(CompanyName) eq 19', ['and', 'or'])

   [
     'Price le 200',
     'and',
     'Price gt 3.5',
     'or',
     'length(CompanyName) eq 19'
   ]
*/
function split(sentence) {
  var keys = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  var keysArray = keys;
  if (!(keysArray instanceof Array)) {
    keysArray = [keysArray];
  }
  var result = [];
  var tmp = [];
  var words = sentence.split(' ');
  words.forEach(function (word) {
    if (keysArray.indexOf(word) > -1) {
      result.push(merge(tmp));
      result.push(word);
      tmp = [];
    } else {
      tmp.push(word);
    }
  });
  result.push(merge(tmp));
  return result;
}