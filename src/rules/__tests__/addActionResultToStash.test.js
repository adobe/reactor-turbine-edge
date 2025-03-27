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

import addActionResultToStash from '../addActionResultToStash';

const generateContext = (obj) => ({
  moduleOutput: 'actionResult',
  arcAndUtils: { arc: { ruleStash: {} } },
  delegateConfig: {
    extension: { name: 'extensionName' }
  },
  ...obj
});

describe('addActionResultToStash', () => {
  test('adds the action result to the  rule stash', () => {
    const ruleStash = {};
    addActionResultToStash(
      generateContext({ arcAndUtils: { arc: { ruleStash } } })
    );
    expect(ruleStash.extensionName).toBe('actionResult');
  });

  test('adds null as action result to rule stash if the action result is undefined or null', () => {
    const ruleStash = {};
    addActionResultToStash(
      generateContext({
        moduleOutput: undefined,
        arcAndUtils: { arc: { ruleStash } }
      })
    );

    expect(ruleStash.extensionName).toBeNull();
  });

  test('adds the action results to rule stash if the action result is any falsy value', () => {
    const ruleStash = {};

    addActionResultToStash(
      generateContext({
        moduleOutput: '',
        arcAndUtils: { arc: { ruleStash } }
      })
    );

    expect(ruleStash.extensionName).toBe('');
  });

  test('does nothing if extension name is not present', () => {
    const ruleStash = {};
    addActionResultToStash(
      generateContext({
        moduleOutput: '',
        arcAndUtils: { arc: { ruleStash } },
        delegateConfig: {
          extension: {}
        }
      })
    );

    expect(ruleStash.extensionName).toBeUndefined();
  });
});
