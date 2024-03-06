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

const createGetModuleProvider = (o = {}) => {
  return {
    getModuleExports: () => (context) => context.utils.getSettings().foo,
    getModuleDefinition: () => ({
      extensionName: 'someextension'
    }),
    getExtensionDefinition: () => ({
      getSettings: () => ({ data: 'extension settings' })
    }),
    ...o
  };
};

const createGetDataElementValue = (
  delegateDefinition,
  {
    moduleProvider = createGetModuleProvider(),
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
  test('returns a value from the settings object as value', async () => {
    const getDataElementValue = createGetDataElementValue({
      settings: {
        foo: 'bar'
      }
    });

    return getDataElementValue('testDataElement', defaultContext).then(
      (dataElementValue) => expect(dataElementValue).toBe('bar')
    );
  });

  test('returns a value from the contextData object as value', async () => {
    const context = {
      arcAndUtils: {
        arc: {
          foo: 'bar'
        }
      }
    };

    const moduleProvider = createGetModuleProvider({
      getModuleExports: () => (c) => c.arc.foo
    });

    const getDataElementValue = createGetDataElementValue(
      {},
      { moduleProvider }
    );

    return getDataElementValue('testDataElement', context).then(
      (dataElementValue) => expect(dataElementValue).toBe('bar')
    );
  });

  test('gives extension settings access to the data element module', async () => {
    const moduleProvider = createGetModuleProvider({
      getModuleExports:
        () =>
        ({ utils }) =>
          utils.getExtensionSettings()
    });

    const getDataElementValue = createGetDataElementValue(
      {},
      { moduleProvider }
    );

    return getDataElementValue('testDataElement', defaultContext).then(
      (dataElementValue) =>
        expect(dataElementValue).toEqual({ data: 'extension settings' })
    );
  });

  test('gives env access to the data element module called by the core extension', async () => {
    const context = {
      arcAndUtils: {},
      env: {
        foo: 'bar'
      }
    };

    const moduleProvider = createGetModuleProvider({
      getModuleDefinition: () => ({
        extensionName: 'core'
      }),
      getModuleExports:
        () =>
        ({ utils }) =>
          utils.getEnv()
    });

    const getDataElementValue = createGetDataElementValue(
      {},
      { moduleProvider }
    );

    return getDataElementValue('testDataElement', context).then(
      (dataElementValue) => expect(dataElementValue).toEqual({ foo: 'bar' })
    );
  });

  test('does not give env access to the data element module called by extensions that are not core', async () => {
    const context = {
      arcAndUtils: {},
      env: {
        foo: 'bar'
      }
    };

    const moduleProvider = createGetModuleProvider({
      getModuleExports:
        () =>
        ({ utils }) =>
          utils.getEnv()
    });

    const getDataElementValue = createGetDataElementValue(
      {},
      { moduleProvider }
    );

    return getDataElementValue('testDataElement', context).then(
      (dataElementValue) => expect(dataElementValue).toEqual({})
    );
  });

  test('cleans the value when cleanText = true', async () => {
    const getDataElementValue = createGetDataElementValue({
      cleanText: true,
      settings: { foo: 'bar' }
    });

    return getDataElementValue('testDataElement', defaultContext).then(
      (dataElementValue) => expect(dataElementValue).toBe('cleaned:bar')
    );
  });

  [undefined, null].forEach((testDataElementValue) => {
    const moduleProvider = createGetModuleProvider({
      getModuleExports: () => () => testDataElementValue
    });

    test(`returns a default value if data element value is ${testDataElementValue}`, async () => {
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
            and default is undefined`, async () => {
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
    const moduleProvider = createGetModuleProvider({
      getModuleExports: () => () => testDataElementValue
    });

    test(`does not return a default value if value is ${testDataElementValue}`, async () => {
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

  test('lowercases the value if forceLowerCase = true', async () => {
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

  test('lowercases the default value if forceLowerCase = true', async () => {
    const getDataElementValue = createGetDataElementValue({
      forceLowerCase: true,
      defaultValue: 'bAr',
      settings: {}
    });

    return getDataElementValue('testDataElement', defaultContext).then(
      (dataElementValue) => expect(dataElementValue).toBe('bar')
    );
  });

  test('throws an error when calling data element module exports fails', async () => {
    const moduleProvider = createGetModuleProvider({
      getModuleExports: () => () => {
        throw new Error('noob tried to divide by zero');
      }
    });

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

  test('throws an error when calling data element module exports fails', async () => {
    const moduleProvider = createGetModuleProvider({
      getModuleExports: () => () => {
        throw new Error('noob tried to divide by zero');
      }
    });

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

  test('throws an error when data element definition is not found', async () => {
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

  test('throws an error when data element circular reference is detected', async () => {
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

  test('provides access to getComponent method when it calls the data element module ', async () => {
    const moduleProvider = createGetModuleProvider({
      getModuleExports:
        () =>
        ({ utils: { getComponent } }) =>
          getComponent()
    });

    const getDataElementValue = createGetDataElementValue(
      {
        settings: {},
        id: 'DE123',
        name: 'data element name'
      },
      { moduleProvider }
    );

    return getDataElementValue('testDataElement', defaultContext).then(
      (dataElementValue) =>
        expect(dataElementValue).toEqual({
          id: 'DE123',
          name: 'data element name'
        })
    );
  });
});
