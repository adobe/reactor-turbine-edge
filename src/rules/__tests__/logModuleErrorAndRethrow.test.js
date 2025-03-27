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

import logModuleErrorAndRethrow from '../logModuleErrorAndRethrow';
import createNewLogger from '../../__mocks__/createNewLogger';
import ConditionNotMetError from '../conditionNotMetError';

describe('logModuleErrorAndRethrow', () => {
  test('logs the error message with a stack when available and returs a rejected promise', () => {
    const logger = createNewLogger();
    const e = new Error('some error');

    logModuleErrorAndRethrow({ utils: { logger } })(e)
      .then(() => {})
      .catch(() => {
        expect(logger.getJsonLogs()).toStrictEqual([
          [`some error \n ${e.stack}`, 'error']
        ]);
      });
  });

  test('logs the log message for a ConditionNotMetError and returs a rejected promise', () => {
    const logger = createNewLogger();
    const e = new ConditionNotMetError('some error');

    logModuleErrorAndRethrow({ utils: { logger } })(e)
      .then(() => {})
      .catch(() => {
        expect(logger.getJsonLogs()).toStrictEqual([['some error', 'log']]);
      });
  });

  test('logs the error message when stack is not available and returs a rejected promise', () => {
    const logger = createNewLogger();
    const e = { message: 'some error' };

    logModuleErrorAndRethrow({ utils: { logger } })(e)
      .then(() => {})
      .catch(() => {
        expect(logger.getJsonLogs()).toStrictEqual([['some error', 'error']]);
      });
  });
});
