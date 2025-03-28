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

import { describe, test, expect } from 'vitest';

import createModuleProvider from '../createModuleProvider.js';

const defaultModules = {
  'core/src/lib/dataElements/path.js': {
    extensionName: 'core',
    displayName: 'Path',
    script: () => {}
  }
};
const defaultExtensions = {
  core: {
    displayName: 'Core'
  }
};

describe('createModuleProvider', () => {
  test('returns an object which allows you to register and retrieve modules and extensions', () => {
    const moduleProvider = createModuleProvider();

    // Register modules and extensions.
    moduleProvider.registerModules(defaultModules, defaultExtensions);

    // Get module and extension definition.
    expect(
      moduleProvider.getModuleDefinition('core/src/lib/dataElements/path.js')
    ).toStrictEqual({
      extensionName: 'core',
      displayName: 'Path',
      script: expect.any(Function)
    });

    expect(
      moduleProvider.getExtensionDefinition('core/src/lib/dataElements/path.js')
    ).toStrictEqual({
      displayName: 'Core'
    });
  });

  test('returns an object which allows you to retrieve the module exports', () => {
    const moduleProvider = createModuleProvider();
    const f = (v) => v;

    const modules = {
      'core/src/lib/dataElements/path.js': {
        extensionName: 'core',
        displayName: 'Path',
        script: f
      }
    };

    moduleProvider.registerModules(modules, defaultExtensions);

    // Get module and extension definition.
    expect(
      moduleProvider.getModuleExports('core/src/lib/dataElements/path.js')
    ).toBe(f);
  });

  test('throws an error when trying to access a module definition that does not exists', () => {
    const moduleProvider = createModuleProvider();
    moduleProvider.registerModules(defaultModules, defaultExtensions);

    expect(() => {
      moduleProvider.getModuleExports(
        'anotherExtension/src/lib/dataElements/path.js'
      );
    }).toThrowError(
      /Failed to access module "anotherExtension\/src\/lib\/dataElements\/path.js"/
    );
  });

  test('throws an error when the module exports is not a function', () => {
    const moduleProvider = createModuleProvider();
    const f = 5;

    const modules = {
      'core/src/lib/dataElements/path.js': {
        extensionName: 'core',
        displayName: 'Path',
        script: f
      }
    };

    moduleProvider.registerModules(modules, defaultExtensions);

    expect(() => {
      moduleProvider.getModuleExports('core/src/lib/dataElements/path.js');
    }).toThrowError(
      new Error(
        'Module "core/src/lib/dataElements/path.js" did not export a function.'
      )
    );
  });
});
