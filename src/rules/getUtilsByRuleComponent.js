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
const constants = require('../constants');

const { CORE } = constants;

module.exports = (context) => {
  const { arcAndUtils, delegateConfig, env = {} } = context;
  const { utils } = arcAndUtils;
  let {
    extension: { getExtensionSettings }
  } = delegateConfig;

  const {
    extension: { name: extensionName }
  } = delegateConfig;

  if (!getExtensionSettings) {
    getExtensionSettings = () => Promise.resolve({});
  }

  return getExtensionSettings(context).then((extensionSettings) => ({
    arcAndUtils: {
      ...arcAndUtils,
      utils: {
        ...utils,
        getEnv: extensionName === CORE ? () => env : () => ({}),
        getExtensionSettings: () => extensionSettings
      }
    },
    delegateConfig,
    env
  }));
};
