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

const logger = require('../getFakeLogger');

describe('getFakeLogger', () => {
  test('returns an object which fakes logging and retrival of the logs in a JSON format', () => {
    // Log all log types.
    logger.log('some log');
    logger.info('multiple logs', { a: 1 });
    logger.debug('another log', 5, 4);
    logger.warn('yet another log', true);
    logger.error('and one error');

    // Get all JSON logs.
    expect(logger.getJsonLogs()).toStrictEqual([]);
  });
});
