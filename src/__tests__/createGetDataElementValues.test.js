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

const createGetDataElementValues = require('../createGetDataElementValues');

const getDataElementValue = jest.fn((v) => `resolved:${v}`);

describe('function returned by createGetDataElementValues', () => {
  test('returns another function that will return data element values when it is called', () => {
    const getDataElementValues = createGetDataElementValues(
      getDataElementValue
    );

    getDataElementValues(['de1'], {}).then((getResolvedDataElementValue) => {
      expect(getResolvedDataElementValue('de1')).toBe('resolved:de1');
    });
  });

  test('adds a dataElementCallStack to the context if it does not exist', () => {
    const getDataElementValues = createGetDataElementValues(
      getDataElementValue
    );

    const context = {};
    getDataElementValues(['de1'], context).then(() => {
      expect(context.dataElementCallStack).toStrictEqual([]);
    });
  });

  test('sends context to getDataElementValue', () => {
    const getDataElementValues = createGetDataElementValues(
      getDataElementValue
    );

    const context = { a: 1, dataElementCallStack: [1] };
    getDataElementValues(['de1'], context).then(() => {
      expect(getDataElementValue).toHaveBeenCalledWith('de1', context);
    });
  });
});
