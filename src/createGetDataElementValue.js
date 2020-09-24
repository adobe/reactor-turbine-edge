/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const cleanText = require('./cleanText');

const enhanceErrorMessage = (dataElementName, e) => {
  e.message = `Failed to execute module for data element "${dataElementName}". ${e.message}`;
};

module.exports = (moduleProvider, getDataElementDefinition) => (
  name,
  context
) => {
  const { dataElementCallStack = [], utils, contextData } = context;

  const dataDef = getDataElementDefinition(name);
  if (!dataDef) {
    return Promise.reject(
      new Error(`Data element definition for "${name}" was not found.`)
    );
  }

  if (dataElementCallStack.includes(name)) {
    dataElementCallStack.push(name);

    return Promise.reject(
      new Error(
        `Data element circular reference detected: ${dataElementCallStack.join(
          ' -> '
        )}`
      )
    );
  }
  dataElementCallStack.push(name);

  const moduleExports = moduleProvider.getModuleExports(dataDef.modulePath);

  const valuePromise = dataDef.getSettings(context).then((settings) => {
    try {
      return moduleExports(settings, contextData, utils);
    } catch (e) {
      enhanceErrorMessage(name, e);
      throw e;
    }
  });

  return valuePromise.then((resolvedValue) => {
    let value = resolvedValue;

    if (value == null && dataDef.defaultValue != null) {
      value = dataDef.defaultValue;
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
  });
};
