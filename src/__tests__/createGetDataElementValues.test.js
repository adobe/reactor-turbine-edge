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

import createGetDataElementValues from '../createGetDataElementValues.js';

const getDataElementValue = vi.fn((v) => `resolved:${v}`);

describe('function returned by createGetDataElementValues', () => {
  test('returns another function that will return data element values when it is called', () => {
    const getDataElementValues =
      createGetDataElementValues(getDataElementValue);

    return getDataElementValues(['de1'], {}).then(
      (getResolvedDataElementValue) => {
        expect(getResolvedDataElementValue('de1')).toBe('resolved:de1');
      }
    );
  });

  test('sends context to getDataElementValue', async () => {
    const getDataElementValues =
      createGetDataElementValues(getDataElementValue);

    const context = { a: 1 };
    await getDataElementValues(['de1'], context);

    expect(getDataElementValue).toHaveBeenCalledWith('de1', {
      a: 1,
      dataElementCallStack: []
    });
  });
});
