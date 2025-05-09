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

import getRuleFetchFn from '../getRuleFetchFn.js';
import createNewLogger from '../createNewLogger.js';
import createFakeFetch from '../__tests_helpers__/createFakeFetchResponse.js';

describe('getRuleFetchFn', () => {
  test('returns a function that will make a successful fetch and returns the response', () => {
    const logger = createNewLogger();
    const ruleFetchFn = getRuleFetchFn(createFakeFetch(), [], {}, logger);

    return ruleFetchFn('http://www.google.com').then((r) => {
      expect(r.status).toBe(200);
      return r.arrayBuffer().then((b) => {
        expect(new TextDecoder('utf-8').decode(b)).toBe(
          'http://www.google.com:arrayBuffer'
        );
      });
    });
  });

  test('returns a function that will make a successful fetch and handles large responses', async () => {
    const logger = createNewLogger();
    const ruleFetchFn = getRuleFetchFn(
      createFakeFetch(200, true),
      [],
      {},
      logger
    );

    await expect(
      ruleFetchFn('http://www.google.com')
    ).resolves.not.toThrowError();
  });

  test('returns a function that logs a successful fetch', () => {
    const logger = createNewLogger({ ruleId: 1 });
    const ruleFetchFn = getRuleFetchFn(createFakeFetch(), [], {}, logger);

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
            'http://www.google.com:arrayBuffer'
          ],
          name: 'evaluatingRule',
          timestampMs: expect.any(Number)
        }
      ]);
    });
  });

  test('returns a function that makes a fetch using the headers provided in init', () => {
    const logger = createNewLogger({ ruleId: 1 });
    const ruleFetchFn = getRuleFetchFn(createFakeFetch(), [], {}, logger);

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
            'http://www.google.com:arrayBuffer'
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
        [],
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
              'http://www.google.com:arrayBuffer'
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
    const ruleFetchFn = getRuleFetchFn(createFakeFetch(), [], {}, logger);

    return ruleFetchFn({
      url: 'http://www.google.com',
      method: 'POST',
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
            '{"url":"http://www.google.com","method":"POST","headers":{}}',
            'Options',
            '{"headers":{"X-Id-Resource":123}}',
            'Response Status',
            '200',
            'Response Body',
            'http://www.google.com:arrayBuffer'
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
    const ruleFetchFn = getRuleFetchFn(fetchWithError, [], {}, logger);

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

  test('returns a function that will make a successful fetch with headers overriden', () => {
    const logger = createNewLogger();
    const fakeFetch = createFakeFetch();
    const ruleFetchFn = getRuleFetchFn(
      fakeFetch,
      [
        {
          key: 'DEVELOPER_TOKEN',
          urlPattern: '^http://www.google.com/',
          value: 'ABCD'
        }
      ],
      {},
      logger
    );

    return ruleFetchFn('http://www.google.com/1234', {
      headers: {
        developer_token: '[[DEVELOPER_TOKEN]]',
        developer_token2: 'abcd [[DEVELOPER_TOKEN]]',
        developer_token3: '[[developer_token]] abcd'
      }
    }).then(() => {
      const replacedHeaders = fakeFetch.mock.calls[0][1].headers;
      expect(replacedHeaders).toMatchObject({
        developer_token: 'ABCD',
        developer_token2: 'abcd ABCD',
        developer_token3: 'ABCD abcd'
      });
    });
  });

  test('returns a function that will make a successful fetch with headers overriden using a Request object', () => {
    const logger = createNewLogger();
    const fakeFetch = createFakeFetch();
    const ruleFetchFn = getRuleFetchFn(
      fakeFetch,
      [
        {
          key: 'DEVELOPER_TOKEN',
          urlPattern: '^http://www.google.com/',
          value: 'ABCD'
        }
      ],
      {},
      logger
    );

    return ruleFetchFn({
      url: 'http://www.google.com/1234',
      headers: {
        entries: () => [
          ['developer_token', '[[DEVELOPER_TOKEN]]'],
          ['developer_token2', 'abcd [[DEVELOPER_TOKEN]]'],
          ['developer_token3', '[[developer_token]] abcd']
        ]
      }
    }).then(() => {
      const replacedHeaders = fakeFetch.mock.calls[0][1].headers;
      expect(replacedHeaders).toMatchObject({
        developer_token: 'ABCD',
        developer_token2: 'abcd ABCD',
        developer_token3: 'ABCD abcd'
      });
    });
  });

  test('returns a function that will make a successful fetch with headers unchanged when the pattern is not matched', () => {
    const logger = createNewLogger();
    const fakeFetch = createFakeFetch();
    const ruleFetchFn = getRuleFetchFn(
      fakeFetch,
      [
        {
          key: 'DEVELOPER_TOKEN',
          urlPattern: '^http://www.google2.com/',
          value: 'ABCD'
        }
      ],
      {},
      logger
    );

    return ruleFetchFn('http://www.google.com/1234', {
      headers: {
        developer_token: '[[DEVELOPER_TOKEN]]'
      }
    }).then(() => {
      const replacedHeaders = fakeFetch.mock.calls[0][1].headers;
      expect(replacedHeaders).toMatchObject({
        developer_token: '[[DEVELOPER_TOKEN]]'
      });
    });
  });
});
