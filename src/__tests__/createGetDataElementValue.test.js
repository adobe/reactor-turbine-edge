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

const createGetDataElementValueModule = require('../createGetDataElementValue');

jest.mock('../cleanText.js');

const defaultContext = { arcAndUtils: {} };

const createGetDataElementDefinitionDefault = (dataDef) =>
  jest.fn().mockImplementation((dataElementName) => {
    if (dataElementName === 'testDataElement') {
      return {
        ...dataDef,
        getSettings: () => Promise.resolve(dataDef.settings)
      };
    }

    return null;
  });

const createGetDataElementValue = (
  delegateDefinition,
  {
    moduleProvider = {
      getModuleExports: () => (context) => context.utils.getSettings().foo
    },
    createGetDataElementDefinition = createGetDataElementDefinitionDefault
  } = {}
) => {
  const getDataElementDefinition =
    createGetDataElementDefinition(delegateDefinition);

  return createGetDataElementValueModule(
    moduleProvider,
    getDataElementDefinition
  );
};

describe('function returned by createGetDataElementValue', () => {
  test('returns a value from the settings object as value', () => {
    const getDataElementValue = createGetDataElementValue({
      settings: {
        foo: 'bar'
      }
    });

    return getDataElementValue('testDataElement', defaultContext).then(
      (dataElementValue) => expect(dataElementValue).toBe('bar')
    );
  });

  test('returns a value from the contextData object as value', () => {
    const context = {
      arcAndUtils: {
        arc: {
          foo: 'bar'
        }
      }
    };

    const moduleProvider = {
      getModuleExports: () => (c) => c.arc.foo
    };

    const getDataElementValue = createGetDataElementValue(
      {},
      { moduleProvider }
    );

    return getDataElementValue('testDataElement', context).then(
      (dataElementValue) => expect(dataElementValue).toBe('bar')
    );
  });

  test('cleans the value when cleanText = true', () => {
    const getDataElementValue = createGetDataElementValue({
      cleanText: true,
      settings: { foo: 'bar' }
    });

    return getDataElementValue('testDataElement', defaultContext).then(
      (dataElementValue) => expect(dataElementValue).toBe('cleaned:bar')
    );
  });

  [undefined, null].forEach((testDataElementValue) => {
    const moduleProvider = {
      getModuleExports: () => () => testDataElementValue
    };

    test(`returns a default value if data element value is ${testDataElementValue}`, () => {
      const getDataElementValue = createGetDataElementValue(
        {
          defaultValue: 'defaultValue',
          settings: {}
        },
        moduleProvider
      );

      return getDataElementValue('testDataElement', defaultContext).then(
        (dataElementValue) => expect(dataElementValue).toBe('defaultValue')
      );
    });

    test(`returns ${testDataElementValue} if data element value is ${testDataElementValue}
            and default is undefined`, () => {
      const getDataElementValue = createGetDataElementValue(
        {
          settings: {}
        },
        { moduleProvider }
      );

      return getDataElementValue('testDataElement', defaultContext).then(
        (dataElementValue) =>
          expect(dataElementValue).toBe(testDataElementValue)
      );
    });
  });

  ['', 0, false, NaN].forEach((testDataElementValue) => {
    const moduleProvider = {
      getModuleExports: () => () => testDataElementValue
    };

    test(`does not return a default value if value is ${testDataElementValue}`, () => {
      const getDataElementValue = createGetDataElementValue(
        {
          defaultValue: 'defaultValue',
          settings: {}
        },
        { moduleProvider }
      );

      return getDataElementValue('testDataElement', defaultContext).then(
        (dataElementValue) =>
          expect(dataElementValue).toBe(testDataElementValue)
      );
    });
  });

  test('lowercases the value if forceLowerCase = true', () => {
    const getDataElementValue = createGetDataElementValue({
      forceLowerCase: true,
      settings: {
        foo: 'bAr'
      }
    });

    return getDataElementValue('testDataElement', defaultContext).then(
      (dataElementValue) => expect(dataElementValue).toBe('bar')
    );
  });

  test('lowercases the default value if forceLowerCase = true', () => {
    const getDataElementValue = createGetDataElementValue({
      forceLowerCase: true,
      defaultValue: 'bAr',
      settings: {}
    });

    return getDataElementValue('testDataElement', defaultContext).then(
      (dataElementValue) => expect(dataElementValue).toBe('bar')
    );
  });

  test('throws an error when calling data element module exports fails', () => {
    const moduleProvider = {
      getModuleExports: () => () => {
        throw new Error('noob tried to divide by zero');
      }
    };

    const getDataElementValue = createGetDataElementValue(
      {
        modulePath: 'hello-world/foo.js',
        settings: {}
      },
      { moduleProvider }
    );

    return getDataElementValue('testDataElement', defaultContext).catch((e) => {
      expect(e.message).toMatch(
        'Failed to execute module for data element "testDataElement". noob tried to divide by zero'
      );
    });
  });

  test('throws an error when calling data element module exports fails', () => {
    const moduleProvider = {
      getModuleExports: () => () => {
        throw new Error('noob tried to divide by zero');
      }
    };

    const getDataElementValue = createGetDataElementValue(
      {
        settings: {}
      },
      { moduleProvider }
    );

    return getDataElementValue('testDataElement', defaultContext)
      .then(() => {
        throw new Error('This section should not have been called.');
      })
      .catch((e) => {
        expect(e.message).toMatch(
          'Failed to execute module for data element "testDataElement". ' +
            'noob tried to divide by zero'
        );
      });
  });

  test('throws an error when data element definition is not found', () => {
    const getDataElementValue = createGetDataElementValue(
      {
        settings: {}
      },
      { createGetDataElementDefinition: () => () => {} }
    );

    return getDataElementValue('testDataElement', defaultContext)
      .then(() => {
        throw new Error('This section should not have been called.');
      })
      .catch((e) => {
        expect(e.message).toMatch(
          'Data element definition for "testDataElement" was not found.'
        );
      });
  });

  test('throws an error when data element circular reference is detected', () => {
    const getDataElementValue = createGetDataElementValue({
      settings: {
        foo: 'bar'
      }
    });

    return getDataElementValue('testDataElement', {
      dataElementCallStack: ['testDataElement'],
      arcAndUtils: {}
    })
      .then(() => {
        throw new Error('This section should not have been called.');
      })
      .catch((e) => {
        expect(e.message).toMatch(
          'Data element circular reference detected: testDataElement -> testDataElement'
        );
      });
  });
});
