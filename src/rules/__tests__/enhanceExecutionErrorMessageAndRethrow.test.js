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

import { describe, test, expect, vi } from 'vitest';

import enhanceExecutionErrorMessageAndRethrow from '../enhanceExecutionErrorMessageAndRethrow.js';

vi.mock('../normalizeError.js');

describe('enhanceExecutionErrorMessageAndRethrow', () => {
  test(
    'returns a rejected promise that has the module display name ' +
      'added to the original error',
    () =>
      enhanceExecutionErrorMessageAndRethrow({
        delegateConfig: { displayName: 'module display name' }
      })(new Error('some error'))
        .then(() => {
          throw new Error('This section should not have been called.');
        })
        .catch((e) => {
          expect(e.message).toBe(
            'Failed to execute "module display name". normalized some error'
          );
        })
  );
});
