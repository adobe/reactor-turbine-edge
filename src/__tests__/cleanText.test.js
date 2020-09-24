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

const textCleaner = require('../cleanText');

describe('cleanText', () => {
  test('removes extra spaces from a string', () => {
    expect(textCleaner('Clean   multiple    spaces')).toBe(
      'Clean multiple spaces'
    );
  });

  test('removes new lines from a string', () => {
    expect(textCleaner('new line here \n and\nhere \n')).toBe(
      'new line here and here'
    );
  });

  test('returns same string if no modifications need to be made', () => {
    expect(textCleaner('This is my Perfect String')).toBe(
      'This is my Perfect String'
    );
  });

  test('removes spaces from the beginning and end of a string', () => {
    expect(textCleaner('  This is my String     ')).toBe('This is my String');
  });

  test('returns unmodified value it is not a string', () => {
    expect(textCleaner()).toBeUndefined();
    expect(textCleaner(123)).toBe(123);
    const obj = {};
    expect(textCleaner(obj)).toEqual(obj);
  });
});
