let searchTokenNames;

const searchTokenNamesInString = (str, tokensBucket) => {
  const tokenRegex = RegExp('%(.+?)%', 'g');
  let result;

  result = tokenRegex.exec(str);
  while (result !== null) {
    tokensBucket.push(result[1]);
    result = tokenRegex.exec(str);
  }
};

const searchTokenNamesInObject = (obj, tokensBucket) => {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    searchTokenNames(value, tokensBucket);
  });

  return tokensBucket;
};

const searchTokenNamesInArray = (arr, tokensBucket) => {
  for (let i = 0, len = arr.length; i < len; i += 1) {
    searchTokenNames(arr[i], tokensBucket);
  }
  return tokensBucket;
};

searchTokenNames = (thing, tokensBucket) => {
  if (typeof thing === 'string') {
    return searchTokenNamesInString(thing, tokensBucket);
  }

  if (Array.isArray(thing)) {
    return searchTokenNamesInArray(thing, tokensBucket);
  }

  if (typeof thing === 'object' && thing !== null) {
    return searchTokenNamesInObject(thing, tokensBucket);
  }

  return thing;
};

module.exports = (thing) => {
  const tokensBucket = [];
  return searchTokenNames(thing, tokensBucket);
};
