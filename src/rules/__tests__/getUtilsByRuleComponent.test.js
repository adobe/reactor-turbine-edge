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

const getUtilsByRuleComponent = require('../getUtilsByRuleComponent');

describe('getUtilsByRuleComponent', () => {
  test('adds the extension settings to the context data', () => {
    const extensionSettings = { setting1: 1 };
    const arcAndUtils = { arc: { contextData1: 2 }, utils: {} };

    return getUtilsByRuleComponent({
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

  test('adds the env to the context data of the core extension', () => {
    const arcAndUtils = {};

    return getUtilsByRuleComponent({
      delegateConfig: {
        extension: {
          name: 'core'
        }
      },
      arcAndUtils,
      env: { foo: 'bar' }
    }).then((context) => {
      const {
        arcAndUtils: {
          utils: { getEnv }
        }
      } = context;

      expect(getEnv()).toStrictEqual({
        foo: 'bar'
      });
    });
  });

  test('does not add the env to the context data of the core extension', () => {
    const arcAndUtils = {};

    return getUtilsByRuleComponent({
      delegateConfig: {
        extension: {
          name: 'another'
        }
      },
      arcAndUtils,
      env: { foo: 'bar' }
    }).then((context) => {
      const {
        arcAndUtils: {
          utils: { getEnv }
        }
      } = context;

      expect(getEnv()).toStrictEqual({});
    });
  });

  test(
    'adds and empty object as the extension settings to the context data if ' +
      'getExtensionSetting is not provided',
    () => {
      const arcAndUtils = { arc: { contextData1: 2 }, utils: {} };

      return getUtilsByRuleComponent({
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
