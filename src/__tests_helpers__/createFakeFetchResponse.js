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

const largeJson = require('./largeJsonResponse.json');

module.exports = (returnStatus = 200, largeResponse = false) =>
  jest.fn((resource) => {
    const response = largeResponse
      ? JSON.stringify(largeJson)
      : `${resource?.url || resource}:arrayBuffer`;
    const arrayBuffer = Promise.resolve(new TextEncoder().encode(response));

    return Promise.resolve({
      clone: () => ({
        arrayBuffer: () => arrayBuffer,
        status: returnStatus
      }),
      arrayBuffer: () => arrayBuffer,
      status: returnStatus
    });
  });
