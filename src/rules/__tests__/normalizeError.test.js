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

const normalizeError = require('../normalizeError');

describe('normalizeError', () => {
  test('returns the same error if receives one', () => {
    const e = new Error('some error');
    expect(normalizeError(e)).toBe(e);
  });

  test('returns a generic error if no error is receieved', () => {
    expect(normalizeError().message).toBe(
      'The extension triggered an error, but no error information was provided.'
    );
  });

  test('returns a error if receives a string', () => {
    expect(normalizeError('some error').message).toBe('some error');
  });
});
