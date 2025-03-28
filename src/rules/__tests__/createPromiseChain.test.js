/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, test, expect, vi } from 'vitest';

import createPromiseChain from '../createPromiseChain.js';

vi.mock('../logModuleErrorAndRethrow.js');
vi.mock('../normalizeDelegate.js');
vi.mock('../addModuleToQueue.js');

const context = { someProperty: 'some_value' };
const modules = [
  {
    modulePath: 'core/src/lib/conditions/customCode1.js',
    settings: {
      a: 'a'
    }
  },
  {
    modulePath: 'core/src/lib/conditions/customCode2.js',
    settings: {
      b: 'b'
    }
  }
];

describe('createPromiseChain', () => {
  test('adds each module to the promise chain', () => {
    const moduleList = [];
    const resultFn = (delegateConfig) => {
      moduleList.push(delegateConfig.modulePath);
    };

    return createPromiseChain({
      modules,
      resultFn
    })(context).then(() => {
      expect(moduleList).toEqual([
        'core/src/lib/conditions/customCode1.js',
        'core/src/lib/conditions/customCode2.js'
      ]);
    });
  });

  test('returns the initial context if no modules are provided', () => {
    return createPromiseChain({
      modules: []
    })(context).then((c) => {
      expect(c).toEqual({ someProperty: 'some_value' });
    });
  });

  test('cathces error thrown by the module', () => {
    const resultFn = () => {
      throw new Error('some error');
    };

    return createPromiseChain({
      modules,
      resultFn
    })(context).catch((e) => {
      expect(e.message).toBe('enhanced error: some error');
    });
  });
});
