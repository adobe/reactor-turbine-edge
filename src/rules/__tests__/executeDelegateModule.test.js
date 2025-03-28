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

import executeDelegateModule from '../executeDelegateModule.js';

describe('executeDelegateModule', () => {
  test('executes the delegate module and adds the module output to the context', () => {
    const delegateConfig = {
      extension: {
        name: 'extensionName',
        getSettings: () => Promise.resolve()
      },
      getSettings: () => Promise.resolve(),
      moduleExports: () => 'result'
    };

    return executeDelegateModule({
      arcAndUtils: { arc: { someValue: 1 }, utils: {} },
      delegateConfig
    }).then((context) => {
      expect(context).toStrictEqual({
        moduleOutput: 'result',
        delegateConfig,
        arcAndUtils: { arc: { someValue: 1 }, utils: {} }
      });
    });
  });

  test('sends getSettings method when the delegate module is executed', () => {
    const delegateConfig = {
      extension: {
        name: 'extensionName',
        getSettings: () => Promise.resolve()
      },
      getSettings: (context) =>
        Promise.resolve({
          returnValue: context.arcAndUtils.arc.someValue
        }),
      moduleExports: ({ utils: { getSettings } }) => getSettings().returnValue
    };

    return executeDelegateModule({
      arcAndUtils: { arc: { someValue: 1 }, utils: {} },
      delegateConfig
    }).then((context) => {
      expect(context).toStrictEqual({
        moduleOutput: 1,
        delegateConfig,
        arcAndUtils: { arc: { someValue: 1 }, utils: {} }
      });
    });
  });

  test('sends getComponent method when the delegate module is executed', () => {
    const delegateConfig = {
      id: 'RC123',
      name: 'Delegate name',
      getSettings: () => Promise.resolve(1),
      moduleExports: ({ utils: { getComponent } }) => getComponent(),
      extension: {
        name: 'extensionName',
        getSettings: () => Promise.resolve()
      }
    };

    return executeDelegateModule({
      arcAndUtils: {},
      delegateConfig
    }).then((context) => {
      expect(context).toStrictEqual({
        moduleOutput: { id: 'RC123', name: 'Delegate name' },
        delegateConfig,
        arcAndUtils: {}
      });
    });
  });
});
