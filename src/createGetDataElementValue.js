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

import cleanTextFn from './cleanText.js';
import normalizeDelegate from './rules/normalizeDelegate.js';
import getExecuteModulePromise from './rules/getExecuteModulePromise.js';

const enhanceErrorMessage = (dataElementName, e) => {
  e.message = `Failed to execute module for data element "${dataElementName}". ${e.message}`;
};

export default (moduleProvider, getDataElementDefinition) =>
  (dataElementName, context) => {
    const {
      dataElementCallStack = [],
      arcAndUtils: {
        utils: { logger }
      }
    } = context;

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

    const { defaultValue, cleanText, forceLowerCase } = dataDef;

    logger.log(`Resolving the data element "${dataElementName}".`);
    return getExecuteModulePromise({
      ...context,
      delegateConfig: normalizeDelegate(dataDef, moduleProvider)
    })
      .then((c) => {
        let { moduleOutput: value } = c;

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

        logger.log(
          `The "${dataElementName}" data element value is "${value}".`
        );
        return value;
      })
      .catch((e) => {
        enhanceErrorMessage(dataElementName, e);
        throw e;
      });
  };
