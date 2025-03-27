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

import { describe, test, expect, vi } from 'vitest';

import normalizeDelegate from '../normalizeDelegate';

const getExtensionSettings = () => {};
const moduleExports = () => {};
const moduleProvider = vi.fn(() => ({
  getModuleDefinition: (path) => {
    if (path === 'a.js') {
      return {
        extensionName: 'extension name',
        displayName: 'module display name'
      };
    }

    return null;
  },
  getExtensionDefinition: (path) => {
    if (path === 'a.js') {
      return {
        displayName: 'extension display name',
        getSettings: getExtensionSettings
      };
    }

    return null;
  },
  getModuleExports: (path) => {
    if (path === 'a.js') {
      return moduleExports;
    }
    return null;
  }
}))();

describe('normalizeDelegate', () => {
  test('creates a normalized delegate', () => {
    const normalizedDelegate = normalizeDelegate(
      {
        modulePath: 'a.js',
        otherProp: 'o'
      },
      moduleProvider
    );

    expect(normalizedDelegate).toStrictEqual({
      displayName: 'module display name',
      extension: {
        displayName: 'extension display name',
        getExtensionSettings,
        name: 'extension name'
      },
      moduleExports,
      otherProp: 'o'
    });
  });
});
