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

const cleanTextFn = require('./cleanText');

const enhanceErrorMessage = (dataElementName, e) => {
  e.message = `Failed to execute module for data element "${dataElementName}". ${e.message}`;
};

module.exports =
  (moduleProvider, getDataElementDefinition) => (dataElementName, context) => {
    const { dataElementCallStack = [], arcAndUtils } = context;
    const { utils } = arcAndUtils;

    const dataDef = getDataElementDefinition(dataElementName);

    if (!dataDef) {
      return Promise.reject(
        new Error(
          `Data element definition for "${dataElementName}" was not found.`
        )
      );
    }

    if (dataElementCallStack.includes(dataElementName)) {
      dataElementCallStack.push(dataElementName);

      return Promise.reject(
        new Error(
          `Data element circular reference detected: ${dataElementCallStack.join(
            ' -> '
          )}`
        )
      );
    }
    dataElementCallStack.push(dataElementName);

    const {
      modulePath,
      getSettings,
      id,
      name,
      defaultValue,
      cleanText,
      forceLowerCase
    } = dataDef;

    const moduleExports = moduleProvider.getModuleExports(modulePath);
    const valuePromise = getSettings(context).then((settings) => {
      try {
        return moduleExports({
          ...arcAndUtils,
          utils: {
            ...utils,
            getSettings: () => settings,
            getComponent: () => ({ id, name })
          }
        });
      } catch (e) {
        enhanceErrorMessage(dataElementName, e);
        throw e;
      }
    });

    return valuePromise.then((resolvedValue) => {
      let value = resolvedValue;

      if (value == null && defaultValue != null) {
        value = defaultValue;
      }

      if (typeof value === 'string') {
        if (cleanText) {
          value = cleanTextFn(value);
        }

        if (forceLowerCase) {
          value = value.toLowerCase();
        }
      }

      return value;
    });
  };
