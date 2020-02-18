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

const cleanText = require('./cleanText');

const getErrorMessage = (dataDef, dataElementName, errorMessage, errorStack) =>
  `Failed to execute data element module ${
    dataDef.modulePath
  } for data element ${dataElementName}. ${errorMessage} ${
    errorStack ? `\n ${errorStack} ` : ''
  }`;

const isDataElementValuePresent = value =>
  value !== undefined && value !== null;

module.exports = (
  moduleProvider,
  getDataElementDefinition,
  replaceTokens,
  undefinedVarsReturnEmpty
) => (logger, name, syntheticEvent) => {
  const dataDef = getDataElementDefinition(name);
  let value = undefinedVarsReturnEmpty ? '' : null;

  if (!dataDef) {
    return value;
  }

  let moduleExports;

  try {
    moduleExports = moduleProvider.getModuleExports(dataDef.modulePath);
  } catch (e) {
    logger.error(getErrorMessage(dataDef, name, e.message, e.stack));
    return value;
  }

  if (typeof moduleExports !== 'function') {
    logger.error(
      getErrorMessage(dataDef, name, 'Module did not export a function.')
    );
    return value;
  }

  try {
    value = moduleExports(
      replaceTokens(logger, dataDef.settings, syntheticEvent),
      syntheticEvent
    );
  } catch (e) {
    logger.error(getErrorMessage(dataDef, name, e.message, e.stack));
    return value;
  }

  if (!isDataElementValuePresent(value)) {
    value = dataDef.defaultValue || value;
  }

  if (typeof value === 'string') {
    if (dataDef.cleanText) {
      value = cleanText(value);
    }

    if (dataDef.forceLowerCase) {
      value = value.toLowerCase();
    }
  }

  return value;
};
