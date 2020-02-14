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

const createGetExtensionSettings = require('./createGetExtensionSettings');
const logger = require('./logger');

const scopedTurbine = {};

module.exports = (container, replaceTokens, getDataElementValue) => {
  const {
    extensions,
    buildInfo,
    property: { settings: propertySettings }
  } = container;

  if (extensions) {
    Object.keys(extensions).forEach(extensionName => {
      const extension = extensions[extensionName];
      const getExtensionSettings = createGetExtensionSettings(
        replaceTokens,
        extension.settings
      );

      const prefixedLogger = logger.createPrefixedLogger(extension.displayName);

      scopedTurbine[extensionName] = {
        buildInfo,
        getDataElementValue,
        getExtensionSettings,
        logger: prefixedLogger,
        propertySettings,
        replaceTokens
      };
    });
  }

  return scopedTurbine;
};
