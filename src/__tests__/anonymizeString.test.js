/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const anonymizeString = require('../anonymizeString');

describe('anonymizeString', () => {
  test('returns 5 asterisk for strings with length lower than 9 characters', () => {
    expect(anonymizeString('somedata')).toBe('*****');
  });

  test('returns an anonymized string where just the last 4 characters are visible', () => {
    expect(anonymizeString('some data')).toBe('*****data');
  });

  test('returns an empty string when no data is provided', () => {
    expect(anonymizeString('')).toBe('');
  });
});
