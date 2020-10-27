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

const index = require('../index');
const containerInitFunction = require('../__mocks__/containerInitFunction');

const globalFetch = (resource) =>
  Promise.resolve({
    clone: () => ({
      arrayBuffer: () => Promise.resolve(`${resource}:arrayBuffer`),
      status: 200
    }),
    arrayBuffer: () => Promise.resolve(`${resource}:arrayBuffer`),
    status: 200
  });

jest.mock('../createNewLogger.js');

describe('index', () => {
  test('executes rules conditions and actions and returns a JSON result', () => {
    const callData = {
      event: { xdm: {}, data: {} },
      request: { header: {}, body: { xdm: {}, data: {} } }
    };

    const execute = index.initialize(containerInitFunction, {
      fetch: globalFetch
    });

    return execute(callData, {
      isDebugEnabled: true,
      headersForSubrequests: {}
    }).then((result) => {
      expect(result).toStrictEqual([
        {
          ruleId: 'RLbb1d94c79fee4733a510564a86ba3c59',
          status: 'success',
          logs: [
            ['Rule "Rule 1" is being executed.'],
            [
              'Calling "Custom Code Condition" module from the "Core" extension.',
              'Event: ',
              '{"xdm":{},"data":{}}',
              'Rule Stash: ',
              '{}'
            ],
            [
              '"Custom Code Condition" module from the "Core" extension returned.',
              'Output:',
              'true'
            ],
            [
              'Calling "Send Beacon" module from the "Adobe Cloud Connector" extension.',
              'Event: ',
              '{"xdm":{},"data":{}}',
              'Rule Stash: ',
              '{}'
            ],
            [
              'FETCH',
              'Resource',
              'https://webhook.site/160e3622-264a-4d9b-aeb4-875d9a3f3a5a?z=precious',
              'Options',
              '{"headers":{}}',
              'Response Status',
              '200',
              'Response Body',
              'empty'
            ],
            [
              '"Send Beacon" module from the "Adobe Cloud Connector" extension returned.',
              'Output:',
              'send data done'
            ]
          ]
        },
        {
          ruleId: 'RLbb1d94c79fee4733a510564a86ba3c60',
          status: 'success',
          logs: [
            ['Rule "Rule 2" is being executed.'],
            [
              'Calling "Send Beacon" module from the "Adobe Cloud Connector" extension.',
              'Event: ',
              '{"xdm":{},"data":{}}',
              'Rule Stash: ',
              '{}'
            ],
            [
              'FETCH',
              'Resource',
              'https://webhook.site/160e3622-264a-4d9b-aeb4-875d9a3f3a5a',
              'Options',
              '{"headers":{}}',
              'Response Status',
              '200',
              'Response Body',
              'empty'
            ],
            [
              '"Send Beacon" module from the "Adobe Cloud Connector" extension returned.',
              'Output:',
              'send data done'
            ]
          ]
        }
      ]);
    });
  });
});
