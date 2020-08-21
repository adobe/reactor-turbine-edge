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

const createGetDataElementValue = require('../createGetDataElementValue');

const createGetDataElementDefinition = (settings) =>
  jest.fn().mockImplementation((dataElementName) => {
    if (dataElementName === 'testDataElement') {
      return settings;
    }

    return null;
  });

const createModuleProvider = (f) => ({
  getModuleExports: () => f
});

const replaceTokens = jest
  .fn()
  .mockImplementation((_, settings, context) =>
    Promise.resolve(settings, context)
  );

describe('function returned by createGetDataElementValue', () => {
  test('returns a data element value using data from settings', () => {
    const moduleProvider = {
      getModuleExports: () => (settings) => settings.foo
    };

    const getDataElementDefinition = createGetDataElementDefinition({
      settings: {
        foo: 'bar'
      }
    });

    const getDataElementValue = createGetDataElementValue(
      moduleProvider,
      getDataElementDefinition,
      replaceTokens
    ).bind(null, null);

    return getDataElementValue('testDataElement', {
      a: 1
    }).then((dataElementValue) => expect(dataElementValue).toBe('bar'));
  });

  test('returns a data element value using data from event', () => {
    const getDataElementDefinition = createGetDataElementDefinition({
      settings: {}
    });

    const getDataElementValue = createGetDataElementValue(
      createModuleProvider((_, context) => context.foo),
      getDataElementDefinition,
      replaceTokens
    ).bind(null, null);

    const context = {
      foo: 'bar'
    };

    return getDataElementValue(
      'testDataElement',
      context
    ).then((dataElementValue) => expect(dataElementValue).toBe('bar'));
  });

  //   test(`${d} cleans the value when cleanText = true`, (t) => {
  //     createGetDataElementValue = proxyquire('../createGetDataElementValue', {
  //       './cleanText': sinon.stub().callsFake((value) => `cleaned:${value}`)
  //     });

  //     const getDataElementDefinition = createGetDataElementDefinition({
  //       cleanText: true,
  //       settings: {}
  //     });

  //     const getDataElementValue = createGetDataElementValue(
  //       createModuleProvider(() => 'bar'),
  //       getDataElementDefinition,
  //       replaceTokens
  //     ).bind(null, null);

  //     t.is(getDataElementValue('testDataElement'), 'cleaned:bar');
  //   });

  //   test(`${d} cleans the default value when cleanText = true`, (t) => {
  //     createGetDataElementValue = proxyquire('../createGetDataElementValue', {
  //       './cleanText': sinon.stub().callsFake((value) => `cleaned:${value}`)
  //     });

  //     const getDataElementDefinition = createGetDataElementDefinition({
  //       cleanText: true,
  //       defaultValue: 'bar',
  //       settings: {}
  //     });

  //     const getDataElementValue = createGetDataElementValue(
  //       createModuleProvider(() => {}),
  //       getDataElementDefinition,
  //       replaceTokens
  //     ).bind(null, null);

  //     t.is(getDataElementValue('testDataElement'), 'cleaned:bar');
  //   });

  //   test(`${d} returns an empty string when undefinedVarsReturnEmpty = true and data element
  //         does not exist`, (t) => {
  //     const getDataElementDefinition = sinon.spy();
  //     const getDataElementValue = createGetDataElementValue(
  //       {},
  //       getDataElementDefinition,
  //       replaceTokens,
  //       true
  //     ).bind(null, null);

  //     t.is(getDataElementValue('testDataElement'), '');
  //     t.true(getDataElementDefinition.calledWith('testDataElement'));
  //     t.true(getDataElementDefinition.calledOnce);
  //   });

  //   test(`${d} returns null when undefinedVarsReturnEmpty = false and data element
  //         does not exist`, (t) => {
  //     const getDataElementDefinition = sinon.spy();
  //     const getDataElementValue = createGetDataElementValue(
  //       {},
  //       getDataElementDefinition,
  //       replaceTokens,
  //       false
  //     ).bind(null, null);

  //     t.is(getDataElementValue('testDataElement'), null);
  //     t.true(getDataElementDefinition.calledWith('testDataElement'));
  //     t.true(getDataElementDefinition.calledOnce);
  //   });

  //   [undefined, null].forEach((dataElementValue) => {
  //     test(`${d} returns a default value if value is ${dataElementValue}`, (t) => {
  //       const getDataElementDefinition = createGetDataElementDefinition({
  //         defaultValue: 'defaultValue',
  //         settings: {}
  //       });

  //       const getDataElementValue = createGetDataElementValue(
  //         createModuleProvider(() => dataElementValue),
  //         getDataElementDefinition,
  //         replaceTokens
  //       ).bind(this, this);

  //       t.is(getDataElementValue('testDataElement'), 'defaultValue');
  //     });

  //     test(`${d} returns an empty string if value is ${dataElementValue}
  //           and default is undefined`, (t) => {
  //       const getDataElementDefinition = createGetDataElementDefinition({
  //         settings: {}
  //       });

  //       const getDataElementValue = createGetDataElementValue(
  //         createModuleProvider(() => dataElementValue),
  //         getDataElementDefinition,
  //         replaceTokens
  //       ).bind(null, null);

  //       t.is(getDataElementValue('testDataElement'), '');
  //     });
  //   });

  //   ['', 0, false, NaN].forEach((dataElementValue) => {
  //     test(`${d} does not return a default value if value is ${dataElementValue}`, (t) => {
  //       const getDataElementDefinition = createGetDataElementDefinition({
  //         defaultValue: 'defaultValue',
  //         settings: {}
  //       });

  //       const getDataElementValue = createGetDataElementValue(
  //         createModuleProvider(() => dataElementValue),
  //         getDataElementDefinition,
  //         replaceTokens
  //       ).bind(this, this);

  //       t.is(getDataElementValue('testDataElement'), dataElementValue);
  //     });
  //   });

  //   test(`${d} lowercases the value if forceLowerCase = true`, (t) => {
  //     const getDataElementDefinition = createGetDataElementDefinition({
  //       forceLowerCase: true,
  //       settings: {
  //         foo: 'bAr'
  //       }
  //     });

  //     const getDataElementValue = createGetDataElementValue(
  //       createModuleProvider((settings) => settings.foo),
  //       getDataElementDefinition,
  //       replaceTokens
  //     ).bind(this, this);

  //     t.is(getDataElementValue('testDataElement'), 'bar');
  //   });

  //   test(`${d} lowercases the default value if forceLowerCase = true`, (t) => {
  //     const getDataElementDefinition = createGetDataElementDefinition({
  //       forceLowerCase: true,
  //       defaultValue: 'bAr',
  //       settings: {}
  //     });

  //     const getDataElementValue = createGetDataElementValue(
  //       createModuleProvider(() => {}),
  //       getDataElementDefinition,
  //       replaceTokens
  //     ).bind(this, this);

  //     t.is(getDataElementValue('testDataElement'), 'bar');
  //   });

  //   test(`${d} replaces tokens in settings object`, (t) => {
  //     const getDataElementDefinition = createGetDataElementDefinition({
  //       settings: {
  //         foo: '%bar%'
  //       }
  //     });

  //     const getDataElementValue = createGetDataElementValue(
  //       createModuleProvider((settings) => settings.foo),
  //       getDataElementDefinition,
  //       () => ({
  //         foo: 'valueOfBar'
  //       })
  //     ).bind(null, null);

  //     t.is(getDataElementValue('testDataElement'), 'valueOfBar');
  //   });

  //   test(`${d} throws an error when retrieving data element module exports fails`, (t) => {
  //     const moduleProvider = {
  //       getModuleExports: () => {
  //         throw new Error('noob tried to divide by zero');
  //       }
  //     };

  //     const getDataElementDefinition = createGetDataElementDefinition({
  //       modulePath: 'hello-world/foo.js',
  //       settings: {}
  //     });

  //     const getDataElementValue = createGetDataElementValue(
  //       moduleProvider,
  //       getDataElementDefinition,
  //       replaceTokens
  //     ).bind(this, this);

  //     t.throws(() => getDataElementValue('testDataElement'), {
  //       instanceOf: Error,
  //       message: new RegExp(
  //         '^Failed to execute data element module hello-world/foo.js \
  //       for data element testDataElement. noob tried to divide by zero'
  //       )
  //     });
  //   });

  //   test(`${d} throws an error when executing data element module exports fails`, (t) => {
  //     const getDataElementDefinition = createGetDataElementDefinition({
  //       modulePath: 'hello-world/foo.js',
  //       settings: {}
  //     });

  //     const getDataElementValue = createGetDataElementValue(
  //       createModuleProvider(() => {
  //         throw new Error('noob tried to divide by zero');
  //       }),
  //       getDataElementDefinition,
  //       replaceTokens
  //     ).bind(this, this);

  //     t.throws(() => getDataElementValue('testDataElement'), {
  //       instanceOf: Error,
  //       message: new RegExp(
  //         '^Failed to execute data element module hello-world/foo.js \
  //       for data element testDataElement. noob tried to divide by zero'
  //       )
  //     });
  //   });

  //   test(`${d} throws an error when the data element module does not export a function`, (t) => {
  //     const getDataElementDefinition = createGetDataElementDefinition({
  //       modulePath: 'hello-world/foo.js',
  //       settings: {}
  //     });

  //     const getDataElementValue = createGetDataElementValue(
  //       createModuleProvider({}),
  //       getDataElementDefinition,
  //       replaceTokens
  //     ).bind(this, this);

  //     t.throws(() => getDataElementValue('testDataElement'), {
  //       instanceOf: Error,
  //       message: new RegExp(
  //         '^Failed to execute data element module hello-world/foo.js \
  //       for data element testDataElement. Module did not export a function.'
  //       )
  //     });
  //   });
});
