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

const getExtensionSettingsByRuleComponent = require('../getExtensionSettingsByRuleComponent');

describe('getExtensionSettingsByRuleComponent', () => {
  test('calls getExtensionSettings with the full context data', () => {
    const arcAndUtils = { arc: { contextData1: 2 }, utils: {} };
    const extensionSettingsMockFn = jest.fn(() => Promise.resolve());

    return getExtensionSettingsByRuleComponent({
      delegateConfig: {
        extension: {
          getExtensionSettings: extensionSettingsMockFn
        }
      },
      arcAndUtils
    }).then(() => {
      expect(extensionSettingsMockFn).toHaveBeenCalledWith({
        arcAndUtils: { arc: { contextData1: 2 }, utils: {} },
        delegateConfig: { extension: expect.any(Object) }
      });
    });
  });

  test('adds the extension settings to the context data', () => {
    const extensionSettings = { setting1: 1 };
    const arcAndUtils = { arc: { contextData1: 2 }, utils: {} };

    return getExtensionSettingsByRuleComponent({
      delegateConfig: {
        extension: {
          getExtensionSettings: () => Promise.resolve(extensionSettings)
        }
      },
      arcAndUtils
    }).then((context) => {
      const {
        arcAndUtils: {
          arc,
          utils: { getExtensionSettings }
        }
      } = context;

      expect(arc).toStrictEqual({ contextData1: 2 });
      expect(getExtensionSettings()).toStrictEqual({
        setting1: 1
      });
    });
  });

  test(
    'adds and empty object as the extension settings to the context data if ' +
      'getExtensionSetting is not provided',
    () => {
      const arcAndUtils = { arc: { contextData1: 2 }, utils: {} };

      return getExtensionSettingsByRuleComponent({
        delegateConfig: {
          extension: {}
        },
        arcAndUtils
      }).then((context) => {
        const {
          arcAndUtils: {
            arc,
            utils: { getExtensionSettings }
          }
        } = context;

        expect(arc).toStrictEqual({ contextData1: 2 });
        expect(getExtensionSettings()).toStrictEqual({});
      });
    }
  );
});
