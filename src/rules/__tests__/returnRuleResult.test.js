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

const returnRuleResult = require('../returnRuleResult');

describe('returnRuleResult', () => {
  test('returns the result for a successful rule', () => {
    const lastPromiseInQueue = Promise.resolve();
    const logger = { getJsonLogs: () => [{ a: 1 }, { b: 2 }] };

    return returnRuleResult(lastPromiseInQueue, { id: 123 }, logger).then(
      (ruleResult) =>
        expect(ruleResult).toStrictEqual({
          ruleId: 123,
          status: 'success',
          logs: [{ a: 1 }, { b: 2 }]
        })
    );
  });

  test('returns the result for a failed rule', () => {
    const lastPromiseInQueue = Promise.reject();
    const logger = { getJsonLogs: () => [{ a: 1 }, { b: 2 }] };

    return returnRuleResult(lastPromiseInQueue, { id: 123 }, logger).then(
      (ruleResult) =>
        expect(ruleResult).toStrictEqual({
          ruleId: 123,
          status: 'failed',
          logs: [{ a: 1 }, { b: 2 }]
        })
    );
  });
});
