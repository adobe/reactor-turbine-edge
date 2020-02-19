/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

const test = require('ava');
const textCleaner = require('../cleanText');

test('cleanText removes extra spaces from a string', t => {
  t.is(textCleaner('Clean   multiple    spaces'), 'Clean multiple spaces');
});

test('cleanText removes new lines from a string', t => {
  t.is(textCleaner('new line here \n and\nhere \n'), 'new line here and here');
});

test('cleanText returns same string if no modifications need to be made', t => {
  t.is(textCleaner('This is my Perfect String'), 'This is my Perfect String');
});

test('cleanText removes spaces from the beginning and end of a string', t => {
  t.is(textCleaner('  This is my String     '), 'This is my String');
});

test('cleanText returns unmodified value it is not a string', t => {
  t.is(textCleaner(), undefined);
  t.is(textCleaner(123), 123);
  const obj = {};
  t.is(textCleaner(obj), obj);
});
