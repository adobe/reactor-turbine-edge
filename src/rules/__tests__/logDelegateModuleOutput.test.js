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

import logDelegateModuleOutput from '../logDelegateModuleOutput.js';
import createNewLogger from '../../__mocks__/createNewLogger.js';

describe('logDelegateModuleOutput', () => {
  test('logs the call to and returns the context', () => {
    const logger = createNewLogger();
    const context = {
      moduleOutput: 'module output',
      arcAndUtils: { arc: { c: 1 }, utils: { logger } },
      delegateConfig: {
        displayName: 'module display name',
        extension: { displayName: 'extension display name' }
      }
    };

    const result = logDelegateModuleOutput(context);
    expect(result.arcAndUtils.utils.logger.getJsonLogs()).toStrictEqual([
      [
        '"module display name" module from the "extension display name" extension returned.',
        'Output:',
        'module output',
        'log'
      ]
    ]);
    expect(result).toBe(context);
  });
});
