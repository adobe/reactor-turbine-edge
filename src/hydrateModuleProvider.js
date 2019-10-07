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

var createGetSharedModuleExports = require('./createGetSharedModuleExports');
var createGetExtensionSettings = require('./createGetExtensionSettings');
var logger = require('./logger');
var resolveRelativePath = require('./resolveRelativePath');
var createPublicRequire = require('./createPublicRequire');

module.exports = function(container, moduleProvider, replaceTokens, getDataElementValue) {
  var extensions = container.extensions;
  var propertySettings = container.property.settings;

  if (extensions) {
    var getSharedModuleExports = createGetSharedModuleExports(extensions, moduleProvider);

    Object.keys(extensions).forEach(function(extensionName) {
      var extension = extensions[extensionName];
      var getExtensionSettings = createGetExtensionSettings(replaceTokens, extension.settings);

      if (extension.modules) {
        var prefixedLogger = logger.createPrefixedLogger(extension.displayName);
        var turbine = {
          getDataElementValue: getDataElementValue,
          getExtensionSettings: getExtensionSettings,
          getSharedModule: getSharedModuleExports,
          logger: prefixedLogger,
          propertySettings: propertySettings,
          replaceTokens: replaceTokens
        };

        Object.keys(extension.modules).forEach(function(referencePath) {
          var module = extension.modules[referencePath];
          var getModuleExportsByRelativePath = function(relativePath) {
            var resolvedReferencePath = resolveRelativePath(referencePath, relativePath);
            return moduleProvider.getModuleExports(resolvedReferencePath);
          };
          var publicRequire = createPublicRequire(getModuleExportsByRelativePath);

          moduleProvider.registerModule(
            referencePath,
            module,
            extensionName,
            publicRequire,
            turbine
          );
        });
      }
    });

    // We want to extract the module exports immediately to allow the modules
    // to run some logic immediately.
    // We need to do the extraction here in order for the moduleProvider to
    // have all the modules previously registered. (eg. when moduleA needs moduleB, both modules
    // must exist inside moduleProvider).
    moduleProvider.hydrateCache();
  }
  return moduleProvider;
};
