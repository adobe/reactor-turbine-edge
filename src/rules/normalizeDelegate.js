/*
Copyright 2017 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

export default ({ modulePath, ...otherDelegateProps }, moduleProvider) => {
  const { extensionName, displayName: moduleDisplayName } =
    moduleProvider.getModuleDefinition(modulePath);

  const {
    displayName: extensionDisplayName,
    getSettings: getExtensionSettings
  } = moduleProvider.getExtensionDefinition(modulePath);

  const moduleExports = moduleProvider.getModuleExports(modulePath);

  return {
    ...otherDelegateProps,
    displayName: moduleDisplayName,
    moduleExports,
    extension: {
      name: extensionName,
      displayName: extensionDisplayName,
      getExtensionSettings
    }
  };
};
