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

const getRuleFetchFn = require('../getRuleFetchFn');
const createNewLogger = require('../createNewLogger');

const createFakeFetch = (returnStatus = 200) => (resource) =>
  Promise.resolve({
    clone: () => ({
      arrayBuffer: () => Promise.resolve(`${resource}:arrayBuffer`),
      status: returnStatus
    }),
    arrayBuffer: () => Promise.resolve(`${resource}:arrayBuffer`),
    status: returnStatus
  });

describe('getRuleFetchFn', () => {
  test('returns a function that will make a successful fetch and returns the response', () => {
    const logger = createNewLogger();
    const ruleFetchFn = getRuleFetchFn(createFakeFetch(), {}, logger);

    return ruleFetchFn('http://www.google.com').then((r) => {
      expect(r.status).toBe(200);
      return r.arrayBuffer().then((b) => {
        expect(b).toBe('http://www.google.com:arrayBuffer');
      });
    });
  });

  test('returns a function that logs a successful fetch', () => {
    const logger = createNewLogger({ ruleId: 1 });
    const ruleFetchFn = getRuleFetchFn(createFakeFetch(), {}, logger);

    return ruleFetchFn('http://www.google.com').then(() => {
      expect(logger.getJsonLogs()).toStrictEqual([
        {
          attributes: { logLevel: 'log' },
          context: { ruleId: 1 },
          messages: [
            '🚀',
            'FETCH',
            'Resource',
            'http://www.google.com',
            'Options',
            '{"headers":{}}',
            'Response Status',
            '200',
            'Response Body',
            'empty'
          ],
          name: 'evaluatingRule',
          timestampMs: expect.any(Number)
        }
      ]);
    });
  });

  test('returns a function that makes a fetch using the headers provided in init', () => {
    const logger = createNewLogger({ ruleId: 1 });
    const ruleFetchFn = getRuleFetchFn(createFakeFetch(), {}, logger);

    return ruleFetchFn('http://www.google.com', {
      headers: { 'X-Id': 112 }
    }).then(() => {
      expect(logger.getJsonLogs()).toStrictEqual([
        {
          attributes: { logLevel: 'log' },
          context: { ruleId: 1 },
          messages: [
            '🚀',
            'FETCH',
            'Resource',
            'http://www.google.com',
            'Options',
            '{"headers":{"X-Id":112}}',
            'Response Status',
            '200',
            'Response Body',
            'empty'
          ],
          name: 'evaluatingRule',
          timestampMs: expect.any(Number)
        }
      ]);
    });
  });

  test(
    'returns a function that makes a fetch using the headers provided in ' +
      'headersForSubrequests',
    () => {
      const logger = createNewLogger({ ruleId: 1 });
      const ruleFetchFn = getRuleFetchFn(
        createFakeFetch(),
        { 'X-Id-SubRequest': 123 },
        logger
      );

      return ruleFetchFn('http://www.google.com').then(() => {
        expect(logger.getJsonLogs()).toStrictEqual([
          {
            attributes: { logLevel: 'log' },
            context: { ruleId: 1 },
            messages: [
              '🚀',
              'FETCH',
              'Resource',
              'http://www.google.com',
              'Options',
              '{"headers":{"X-Id-SubRequest":123}}',
              'Response Status',
              '200',
              'Response Body',
              'empty'
            ],
            name: 'evaluatingRule',
            timestampMs: expect.any(Number)
          }
        ]);
      });
    }
  );

  test('returns a function that will make a successful fetch using a Request object', () => {
    const logger = createNewLogger({ ruleId: 1 });
    const ruleFetchFn = getRuleFetchFn(createFakeFetch(), {}, logger);

    return ruleFetchFn({
      headers: { entries: () => [['X-Id-Resource', 123]] }
    }).then(() => {
      expect(logger.getJsonLogs()).toStrictEqual([
        {
          attributes: { logLevel: 'log' },
          context: { ruleId: 1 },
          messages: [
            '🚀',
            'FETCH',
            'Resource',
            '{"headers":{}}',
            'Options',
            '{"headers":{"X-Id-Resource":123}}',
            'Response Status',
            '200',
            'Response Body',
            'empty'
          ],
          name: 'evaluatingRule',
          timestampMs: expect.any(Number)
        }
      ]);
    });
  });

  test('returns a function that logs a fetch error', () => {
    const fetchWithError = () => Promise.reject(new Error('some error'));

    const logger = createNewLogger({ ruleId: 1 });
    const ruleFetchFn = getRuleFetchFn(fetchWithError, {}, logger);

    return ruleFetchFn('http://www.google.com')
      .then(() => {
        throw new Error('This section should not have been called.');
      })
      .catch(() => {
        expect(logger.getJsonLogs()).toStrictEqual([
          {
            attributes: { logLevel: 'error' },
            context: { ruleId: 1 },
            messages: [
              '🚀',
              'FETCH',
              'Resource',
              'http://www.google.com',
              'Options',
              '{"headers":{}}',
              'Error',
              'some error'
            ],
            name: 'evaluatingRule',
            timestampMs: expect.any(Number)
          }
        ]);
      });
  });
});
