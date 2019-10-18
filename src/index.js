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
var createReplaceTokens = require('./createReplaceTokens');
var createGetDataElementValue = require('./createGetDataElementValue');
var createModuleProvider = require('./createModuleProvider');
var createIsVar = require('./createIsVar');
var createGetVar = require('./createGetVar');
var executeRules = require('./executeRules');
var hydrateScopedUtilities = require('./hydrateScopedUtilities');

var scopedTurbineVariable = {};
var moduleProvider = createModuleProvider();

var initialize = function(container, modules) {
  var undefinedVarsReturnEmpty =
    container.property.settings.undefinedVarsReturnEmpty;

  var dataElements = container.dataElements || {};

  var getDataElementDefinition = function(name) {
    return dataElements[name];
  };

  var replaceTokens;

  // We support data elements referencing other data elements. In order to be able to retrieve a
  // data element value, we need to be able to replace data element tokens inside its settings
  // object (which is what replaceTokens is for). In order to be able to replace data element
  // tokens inside a settings object, we need to be able to retrieve data element
  // values (which is what getDataElementValue is for). This proxy replaceTokens function solves the
  // chicken-or-the-egg problem by allowing us to provide a replaceTokens function to
  // getDataElementValue that will stand in place of the real replaceTokens function until it
  // can be created. This also means that createDataElementValue should not call the proxy
  // replaceTokens function until after the real replaceTokens has been created.
  var proxyReplaceTokens = function() {
    return replaceTokens.apply(null, arguments);
  };

  var getDataElementValue = createGetDataElementValue(
    moduleProvider,
    getDataElementDefinition,
    proxyReplaceTokens,
    undefinedVarsReturnEmpty
  );

  var isVar = createIsVar(getDataElementDefinition);

  var getVar = createGetVar(getDataElementDefinition, getDataElementValue);

  replaceTokens = createReplaceTokens(isVar, getVar, undefinedVarsReturnEmpty);

  scopedTurbineVariable = hydrateScopedUtilities(
    container,
    replaceTokens,
    getDataElementValue
  );

  moduleProvider.registerModules(container.modules);

  return executeRules.bind(null, moduleProvider, replaceTokens, container.rules);
};

module.exports = {
  initialize: initialize,
  getScopedExtensionUtilities: function getScopedExtensionUtilities(
    extensionPackageId
  ) {
    return scopedTurbineVariable[extensionPackageId];
  }
};