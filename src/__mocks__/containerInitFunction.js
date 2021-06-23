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

module.exports = (getDataElementValues) => ({
  buildInfo: {},
  modules: {
    'adobe-cloud-connector/src/lib/actions/sendData.js': {
      extensionName: 'adobe-cloud-connector',
      displayName: 'Send Beacon',
      script: ({ utils: { getSettings, fetch } }) =>
        fetch(getSettings().url).then(() => 'send data done')
    },
    'extension-with-settings/src/lib/actions/sendData.js': {
      extensionName: 'extension-with-settings',
      displayName: 'Send Beacon',
      script: ({ utils: { getExtensionSettings } }) =>
        getExtensionSettings().uid
    },
    'core/src/lib/dataElements/customCode.js': {
      extensionName: 'core',
      displayName: 'Custom Code Data Element',
      script: ({ utils: { getSettings } }) => getSettings().source()
    },
    'core/src/lib/conditions/customCode.js': {
      extensionName: 'core',
      displayName: 'Custom Code Condition',
      script: ({ utils: { getSettings } }) => getSettings().source()
    }
  },
  dataElements: {
    myPrecious: {
      modulePath: 'core/src/lib/conditions/customCode.js',
      getSettings: () =>
        Promise.resolve({
          source: () => 'precious'
        })
    },

    UID: {
      modulePath: 'core/src/lib/conditions/customCode.js',
      getSettings: () =>
        Promise.resolve({
          source: () => 'UA-X-123'
        })
    }
  },
  extensions: {
    'extension-with-settings': {
      displayName: 'Demo Extensions With Settings',
      getSettings: (context) => {
        return getDataElementValues(['UID'], context).then(
          (getDataElementValue) => ({
            uid: `${getDataElementValue('UID')}`
          })
        );
      }
    },
    'adobe-cloud-connector': {
      displayName: 'Adobe Cloud Connector'
    },
    core: {
      displayName: 'Core'
    }
  },
  company: {},
  property: {},
  rules: [
    {
      id: 'RLbb1d94c79fee4733a510564a86ba3c59',
      name: 'Rule with one condition and two actions',
      conditions: [
        {
          id: 'RCbb1d94c79fee4733a510564a86ba3c99',
          name: 'Custom Code',
          modulePath: 'core/src/lib/conditions/customCode.js',
          timeout: 100,
          getSettings: () =>
            Promise.resolve({
              source: () => true
            })
        }
      ],
      actions: [
        {
          id: 'RCbb1d94c79fee4733a510564a86ba3a99',
          name: 'Send Data',
          modulePath: 'adobe-cloud-connector/src/lib/actions/sendData.js',
          timeout: 100,
          getSettings: (context) =>
            getDataElementValues(['myPrecious'], context).then(
              (getDataElementValue) => ({
                method: 'POST',
                body: '',
                url: `https://webhook.site/160e3622-264a-4d9b-aeb4-875d9a3f3a5a?z=${getDataElementValue(
                  'myPrecious'
                )}`
              })
            )
        },
        {
          id: 'RCbb1d94c79fee4733a510564a86ba3a99',
          name: 'Send Data',
          modulePath: 'extension-with-settings/src/lib/actions/sendData.js',
          timeout: 100,
          getSettings: (context) => {
            return getDataElementValues([], context).then(() => ({}));
          }
        }
      ]
    },
    {
      id: 'RLbb1d94c79fee4733a510564a86ba3c60',
      name: 'Rule with one action',
      actions: [
        {
          id: 'RCbb1d94c79fee4733a510564a86ba3a99',
          name: 'Send Data',
          modulePath: 'adobe-cloud-connector/src/lib/actions/sendData.js',
          timeout: 100,
          getSettings: () =>
            Promise.resolve({
              method: 'GET',
              url: 'https://webhook.site/160e3622-264a-4d9b-aeb4-875d9a3f3a5a'
            })
        }
      ]
    },
    {
      id: 'RLbb1d94c79fee4733a510564a86ba3c99',
      name: 'Rule with one false condition and two actions',
      conditions: [
        {
          id: 'RCbb1d94c79fee4733a510564a86ba3c99',
          name: 'Custom Code',
          modulePath: 'core/src/lib/conditions/customCode.js',
          timeout: 100,
          getSettings: () =>
            Promise.resolve({
              source: () => false
            })
        }
      ],
      actions: [
        {
          id: 'RCbb1d94c79fee4733a510564a86ba3a99',
          name: 'Send Data',
          modulePath: 'adobe-cloud-connector/src/lib/actions/sendData.js',
          timeout: 100,
          getSettings: (context) =>
            getDataElementValues(['myPrecious'], context).then(
              (getDataElementValue) => ({
                method: 'POST',
                body: '',
                url: `https://webhook.site/160e3622-264a-4d9b-aeb4-875d9a3f3a5a?z=${getDataElementValue(
                  'myPrecious'
                )}`
              })
            )
        },
        {
          id: 'RCbb1d94c79fee4733a510764a86ba3c99',
          name: 'Send Data',
          modulePath: 'extension-with-settings/src/lib/actions/sendData.js',
          timeout: 100,
          getSettings: (context) => {
            return getDataElementValues([], context).then(() => ({}));
          }
        }
      ]
    }
  ]
});
