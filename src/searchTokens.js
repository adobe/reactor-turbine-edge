let searchTokens;

const searchTokensInString = (str, tokensBucket) => {
  const tokenRegex = RegExp('%(.+?)%', 'g');
  let result;

  result = tokenRegex.exec(str);
  while (result !== null) {
    tokensBucket.push(result[1]);
    result = tokenRegex.exec(str);
  }
};

const searchTokensInObject = (obj, tokensBucket) => {
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    searchTokens(value, tokensBucket);
  });

  return tokensBucket;
};

const searchTokensInArray = (arr, tokensBucket) => {
  for (let i = 0, len = arr.length; i < len; i += 1) {
    searchTokens(arr[i], tokensBucket);
  }
  return tokensBucket;
};

searchTokens = (thing, tokensBucket) => {
  if (typeof thing === 'string') {
    return searchTokensInString(thing, tokensBucket);
  }

  if (Array.isArray(thing)) {
    return searchTokensInArray(thing, tokensBucket);
  }

  if (typeof thing === 'object' && thing !== null) {
    return searchTokensInObject(thing, tokensBucket);
  }

  return thing;
};

module.exports = (thing) => {
  const tokensBucket = [];
  return searchTokens(thing, tokensBucket);
};
