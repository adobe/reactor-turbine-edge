/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { MTLS_BINDING } from './constants.js';

export default (env) => {
  if (env && env[MTLS_BINDING]) {
    // We need the binding here, otherwise the worker will throw an error:
    // TypeError: Illegal invocation: function called with incorrect `this` reference.
    return env[MTLS_BINDING].fetch.bind(env[MTLS_BINDING]);
  }

  return () => {
    throw new Error('MTLS certificate not found on the worker');
  };
};
