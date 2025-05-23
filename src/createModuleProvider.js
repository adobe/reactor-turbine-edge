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

export default () => {
  let modules = {};
  let extensions = {};

  return {
    registerModules: (newModules, newExtensions) => {
      modules = newModules;
      extensions = newExtensions;
    },

    getModuleDefinition: (modulePath) => {
      return modules[modulePath];
    },

    getExtensionDefinition: (modulePath) => {
      return extensions[modules[modulePath].extensionName];
    },

    getModuleExports: (modulePath) => {
      let moduleExports;

      try {
        moduleExports = modules[modulePath].script;
      } catch (e) {
        throw new Error(
          `Failed to access module "${modulePath}". ${e.message}`
        );
      }

      if (typeof moduleExports !== 'function') {
        throw new Error(`Module "${modulePath}" did not export a function.`);
      }

      return moduleExports;
    }
  };
};
