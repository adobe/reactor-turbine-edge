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

const checkConditionResult = require('../checkConditionResult');
const ConditionNotMetError = require('../conditionNotMetError');

describe('checkConditionResult', () => {
  test('returns a resolved promise in chain when condition result is true', () => {
    const arcAndUtils = { arc: { a: 1 }, utils: { getRule: () => ({}) } };

    return checkConditionResult({
      moduleOutput: true,
      arcAndUtils,
      delegateConfig: {}
    }).then((c) => {
      expect(c).toStrictEqual({
        arcAndUtils: {
          arc: { a: 1 },
          utils: {
            getRule: expect.any(Function)
          }
        }
      });
    });
  });

  test(
    'returns a resolved promise when condition result is false ' +
      'and negate is true',
    () => {
      const arcAndUtils = { arc: { a: 1 }, utils: { getRule: () => ({}) } };

      return checkConditionResult({
        moduleOutput: false,
        arcAndUtils,
        delegateConfig: {
          negate: true
        }
      }).then((c) => {
        expect(c).toStrictEqual({
          arcAndUtils: {
            arc: { a: 1 },
            utils: {
              getRule: expect.any(Function)
            }
          }
        });
      });
    }
  );

  test('returns a rejected promise if condition result is not boolean', () => {
    const arcAndUtils = {
      arc: { a: 1 },
      utils: { getRule: () => ({ name: 'R' }) }
    };

    checkConditionResult({
      moduleOutput: 5,
      arcAndUtils,
      delegateConfig: {
        displayName: 'A'
      }
    })
      .then(() => {
        throw new Error('This section should not have been called.');
      })
      .catch((e) => {
        expect(e.message).toBe(
          'Condition "A" from rule "R" did not return a boolean result.'
        );
      });
  });

  test('returns a rejected promise if condition is not met', () => {
    const arcAndUtils = {
      arc: { a: 1 },
      utils: { getRule: () => ({ name: 'R' }) }
    };

    checkConditionResult({
      moduleOutput: false,
      arcAndUtils,
      delegateConfig: {
        displayName: 'A'
      }
    })
      .then(() => {
        throw new Error('This section should not have been called.');
      })
      .catch((e) => {
        expect(e).toBeInstanceOf(ConditionNotMetError);
        expect(e.message).toBe('Condition "A" from rule "R" not met.');
      });
  });
});
