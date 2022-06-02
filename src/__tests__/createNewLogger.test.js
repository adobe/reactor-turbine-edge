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

const createNewLogger = require('../createNewLogger');

jest.mock('../getCurrentTimestamp.js');

describe('createNewLogger', () => {
  test('returns an object which allows logging and retrival of the logs in a JSON format', () => {
    const context = { ruleId: 1234 };
    const logger = createNewLogger(context);

    // Log all log types.
    logger.log('some log');
    logger.info('multiple logs', { a: 1 });
    logger.debug('another log', 5, 4);
    logger.warn('yet another log', true);
    logger.error('and one error');

    // Get all JSON logs.
    expect(logger.getJsonLogs()).toStrictEqual([
      {
        attributes: { logLevel: 'log' },
        context: { ruleId: 1234 },
        messages: ['🚀', 'some log'],
        name: 'evaluatingRule',
        timestampMs: 1111
      },
      {
        attributes: { logLevel: 'info' },
        context: { ruleId: 1234 },
        messages: ['🚀', 'multiple logs', '{"a":1}'],
        name: 'evaluatingRule',
        timestampMs: 1111
      },
      {
        attributes: { logLevel: 'debug' },
        context: { ruleId: 1234 },
        messages: ['🚀', 'another log', '5', '4'],
        name: 'evaluatingRule',
        timestampMs: 1111
      },
      {
        attributes: { logLevel: 'warn' },
        context: { ruleId: 1234 },
        messages: ['🚀', 'yet another log', 'true'],
        name: 'evaluatingRule',
        timestampMs: 1111
      },
      {
        attributes: { logLevel: 'error' },
        context: { ruleId: 1234 },
        messages: ['🚀', 'and one error'],
        name: 'evaluatingRule',
        timestampMs: 1111
      }
    ]);
  });

  test.only('returns an object which allows anonymizing tokens in logs', () => {
    const context = { ruleId: 1234 };
    const logger = createNewLogger(context, [
      'TOKENIZED_DATA',
      'ANOTHER_TOKEN'
    ]);

    // Log all log types.
    logger.log('some log TOKENIZED_DATA');
    logger.info('multiple logs', { a: 'TOKENIZED_DATA' });
    logger.debug('another log', 5, 'TOKENIZED_DATA');
    logger.warn('yet another log', ['TOKENIZED_DATA', 'ANOTHER_TOKEN']);

    // Get all JSON logs.
    expect(logger.getJsonLogs()).toStrictEqual([
      {
        attributes: { logLevel: 'log' },
        context: { ruleId: 1234 },
        messages: ['🚀', 'some log *****DATA'],
        name: 'evaluatingRule',
        timestampMs: 1111
      },
      {
        attributes: { logLevel: 'info' },
        context: { ruleId: 1234 },
        messages: ['🚀', 'multiple logs', '{"a":"*****DATA"}'],
        name: 'evaluatingRule',
        timestampMs: 1111
      },
      {
        attributes: { logLevel: 'debug' },
        context: { ruleId: 1234 },
        messages: ['🚀', 'another log', '5', '*****DATA'],
        name: 'evaluatingRule',
        timestampMs: 1111
      },
      {
        attributes: { logLevel: 'warn' },
        context: { ruleId: 1234 },
        messages: ['🚀', 'yet another log', '["*****DATA","*****OKEN"]'],
        name: 'evaluatingRule',
        timestampMs: 1111
      }
    ]);
  });
});
