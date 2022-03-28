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
      headersForSubrequests: {}
    }).then((result) => {
      expect(result).toStrictEqual([
        {
          ruleId: 'RLbb1d94c79fee4733a510564a86ba3c59',
          status: 'success',
          logs: [
            [
              'Execution of rule "Rule with one condition and two actions" is starting.',
              'log'
            ],
            [
              'Calling "Custom Code Condition" module from the "Core" extension.',
              'Event: ',
              '{"xdm":{},"data":{}}',
              'Rule Stash: ',
              '{}',
              'log'
            ],
            [
              '"Custom Code Condition" module from the "Core" extension returned.',
              'Output:',
              'true',
              'log'
            ],
            [
              'Calling "Send Beacon" module from the "Adobe Cloud Connector" extension.',
              'Event: ',
              '{"xdm":{},"data":{}}',
              'Rule Stash: ',
              '{}',
              'log'
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
              'empty',
              'log'
            ],
            [
              '"Send Beacon" module from the "Adobe Cloud Connector" extension returned.',
              'Output:',
              'send data done',
              'log'
            ],
            [
              'Calling "Send Beacon" module from the "Demo Extensions With Settings" extension.',
              'Event: ',
              '{"xdm":{},"data":{}}',
              'Rule Stash: ',
              '{"adobe-cloud-connector":"send data done"}',
              'log'
            ],
            [
              '"Send Beacon" module from the "Demo Extensions With Settings" extension returned.',
              'Output:',
              'UA-X-123',
              'log'
            ],
            [
              'Execution of rule "Rule with one condition and two actions" is complete.',
              'log'
            ]
          ]
        },
        {
          ruleId: 'RLbb1d94c79fee4733a510564a86ba3c60',
          status: 'success',
          logs: [
            ['Execution of rule "Rule with one action" is starting.', 'log'],
            [
              'Calling "Send Beacon" module from the "Adobe Cloud Connector" extension.',
              'Event: ',
              '{"xdm":{},"data":{}}',
              'Rule Stash: ',
              '{}',
              'log'
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
              'empty',
              'log'
            ],
            [
              '"Send Beacon" module from the "Adobe Cloud Connector" extension returned.',
              'Output:',
              'send data done',
              'log'
            ],
            ['Execution of rule "Rule with one action" is complete.', 'log']
          ]
        },
        {
          logs: [
            [
              'Execution of rule "Rule with one false condition and two actions" is starting.',
              'log'
            ],
            [
              'Calling "Custom Code Condition" module from the "Core" extension.',
              'Event: ',
              '{"xdm":{},"data":{}}',
              'Rule Stash: ',
              '{}',
              'log'
            ],
            [
              '"Custom Code Condition" module from the "Core" extension returned.',
              'Output:',
              'false',
              'log'
            ],
            [
              'Failed to execute "Custom Code Condition". Condition "Custom Code Condition" ' +
                'from rule "Rule with one false condition and two actions" not met.',
              'log'
            ],
            [
              'Execution of rule "Rule with one false condition and two actions" is complete.',
              'log'
            ]
          ],
          ruleId: 'RLbb1d94c79fee4733a510564a86ba3c99',
          status: 'condition_not_met'
        }
      ]);
    });
  });
});
