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

const getTimeoutPromise = require('../getTimeoutPromise');

describe('getTimeoutPromise', () => {
  test('returns a promise that will get rejected when the timeout is hit', () =>
    getTimeoutPromise(100)
      .then(() => {
        throw new Error('This section should not have been called.');
      })
      .catch((e) =>
        expect(e.message).toBe(
          'A timeout occurred because the module took longer than 0.1 seconds to complete.'
        )
      ));
});
