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

import createGetDataElementValues from './createGetDataElementValues.js';
import createGetDataElementValue from './createGetDataElementValue.js';
import createModuleProvider from './createModuleProvider.js';
import executeRules from './executeRules.js';

let dataElements = {};

const moduleProvider = createModuleProvider();

const getDataElementDefinition = (name) => {
  return dataElements[name];
};

const getDataElementValue = createGetDataElementValue(
  moduleProvider,
  getDataElementDefinition
);

const getDataElementValues = createGetDataElementValues(getDataElementValue);

const initialize = (containerInitFunction) => {
  const container = containerInitFunction(getDataElementValues);
  if (container.dataElements) {
    dataElements = container.dataElements;
  }

  moduleProvider.registerModules(container.modules, container.extensions);
  return executeRules.bind(null, moduleProvider, container);
};

export default {
  initialize
};
