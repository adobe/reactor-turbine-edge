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

const addModuleToQueue = require('../addModuleToQueue');
const getExecuteModulePromise = require('../getExecuteModulePromise.js');

jest.mock('../getExecuteModulePromise.js');
jest.mock('../enhanceExecutionErrorMessageAndRethrow.js');
jest.mock('../transformToTimeBoundedPromise.js');

const delegateConfig = {};

describe('addModuleToQueue', () => {
  test('callback function processes the module result', () => {
    const processResultFn = jest.fn();

    getExecuteModulePromise.mockResolvedValue('module result');

    return addModuleToQueue(
      Promise.resolve(),
      processResultFn,
      delegateConfig
    ).then(() => {
      expect(processResultFn).toHaveBeenCalledWith('module result');
    });
  });

  test('cathces error thrown by the module', () => {
    const processResultFn = () => {};

    getExecuteModulePromise.mockImplementation(() => {
      throw new Error('error from inside the module');
    });

    return addModuleToQueue(Promise.resolve(), processResultFn, delegateConfig)
      .then(() => {
        throw new Error('This section should not have been called.');
      })
      .catch((e) => {
        expect(e.message).toBe('error from inside the module');
      });
  });

  test('cathces error thrown by the function that does the module result processing', () => {
    const processResultFn = () => {
      throw new Error('error from inside the processing function');
    };

    getExecuteModulePromise.mockResolvedValue('module result');

    return addModuleToQueue(Promise.resolve(), processResultFn, delegateConfig)
      .then(() => {
        throw new Error('This section should not have been called.');
      })
      .catch((e) => {
        expect(e.message).toBe('error from inside the processing function');
      });
  });
});
