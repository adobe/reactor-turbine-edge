/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import normalizeDelegate from './normalizeDelegate';
import addModuleToQueue from './addModuleToQueue';
import logModuleErrorAndRethrow from './logModuleErrorAndRethrow';
import { PROMISE_TIMEOUT } from '../constants';

export default ({ modules, resultFn, moduleProvider, utils }) =>
  (context) => {
    let lastPromiseInChain = Promise.resolve(context);

    if (modules) {
      modules.forEach((condition) => {
        lastPromiseInChain = addModuleToQueue(lastPromiseInChain, resultFn, {
          timeout: PROMISE_TIMEOUT,
          ...normalizeDelegate(condition, moduleProvider)
        });
      });
    }

    lastPromiseInChain = lastPromiseInChain.catch(
      logModuleErrorAndRethrow({ utils })
    );

    return lastPromiseInChain;
  };
