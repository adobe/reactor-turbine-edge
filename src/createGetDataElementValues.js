module.exports = (getDataElementValue) => (
  tokenList,
  { payload, dataElementCallStack }
) =>
  Promise.all(
    tokenList.map((t) => {
      const clonedStack = dataElementCallStack.slice();
      return getDataElementValue(t, {
        payload,
        dataElementCallStack: clonedStack
      });
    })
  ).then((resolvedValues) => {
    const zipResults = {};

    tokenList.forEach((dataElementName, index) => {
      zipResults[dataElementName] = resolvedValues[index];
    });

    return (name) => zipResults[name];
  });
