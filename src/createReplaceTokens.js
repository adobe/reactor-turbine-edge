/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

/**
 * Replacing any variable tokens (%myDataElement%, %this.foo%, etc.) with their associated values.
 * A new string, object, or array will be created; the thing being processed will never be
 * modified.
 * @param {*} thing Thing potentially containing variable tokens. Objects and arrays will be
 * deeply processed.
 * @param {HTMLElement} [element] Associated HTML element. Used for special tokens
 * (%this.something%).
 * @param {Object} [event] Associated event. Used for special tokens (%event.something%,
 * %target.something%)
 * @returns {*} A processed value.
 */
module.exports = (isDataElement, getDataElementValue) => {
  let replaceTokens;

  const variablesBeingRetrieved = [];

  const getVarValue = (logger, token, variableName, syntheticEvent) => {
    if (!isDataElement(variableName)) {
      return token;
    }

    variablesBeingRetrieved.push(variableName);
    const val = getDataElementValue(logger, variableName, syntheticEvent);
    variablesBeingRetrieved.pop();
    return val;
  };

  /**
   * Perform variable substitutions to a string where tokens are specified in the form %foo%.
   * If the only content of the string is a single data element token, then the raw data element
   * value will be returned instead.
   *
   * @param str {string} The string potentially containing data element tokens.
   * @param element {HTMLElement} The element to use for tokens in the form of %this.property%.
   * @param event {Object} The event object to use for tokens in the form of %target.property%.
   * @returns {*}
   */
  const replaceTokensInString = (logger, str, syntheticEvent) => {
    // Is the string a single data element token and nothing else?
    const result = /^%([^%]+)%$/.exec(str);

    if (result) {
      return getVarValue(logger, str, result[1], syntheticEvent);
    }

    return str.replace(/%(.+?)%/g, (token, variableName) => {
      return getVarValue(logger, token, variableName, syntheticEvent);
    });
  };

  const replaceTokensInObject = (logger, obj, syntheticEvent) => {
    const ret = {};

    Object.keys(obj).forEach(key => {
      const value = obj[key];
      ret[key] = replaceTokens(logger, value, syntheticEvent);
    });

    return ret;
  };

  const replaceTokensInArray = (logger, arr, syntheticEvent) => {
    const ret = [];
    for (let i = 0, len = arr.length; i < len; i += 1) {
      ret.push(replaceTokens(logger, arr[i], syntheticEvent));
    }
    return ret;
  };

  replaceTokens = (logger, thing, syntheticEvent) => {
    if (typeof thing === 'string') {
      return replaceTokensInString(logger, thing, syntheticEvent);
    }

    if (Array.isArray(thing)) {
      return replaceTokensInArray(logger, thing, syntheticEvent);
    }

    if (typeof thing === 'object' && thing !== null) {
      return replaceTokensInObject(logger, thing, syntheticEvent);
    }

    return thing;
  };

  return (logger, thing, syntheticEvent) => {
    // It's possible for a data element to reference another data element. Because of this,
    // we need to prevent circular dependencies from causing an infinite loop.
    if (variablesBeingRetrieved.length > 10) {
      throw new Error(
        `Data element circular reference detected: ${variablesBeingRetrieved.join(
          ' -> '
        )}`
      );
    }

    return replaceTokens(logger, thing, syntheticEvent);
  };
};
