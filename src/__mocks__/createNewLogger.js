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

/**
 * Log levels.
 * @readonly
 * @enum {string}
 * @private
 */
const levels = {
  LOG: 'log',
  ERROR: 'error'
};

const process = (logLevel, context, logsBucket, args) => {
  logsBucket.push(
    args.map((m) => (typeof m !== 'string' ? JSON.stringify(m) : m))
  );
};

module.exports = (context) => {
  const logsBucket = [];

  return {
    log: (...args) => process(levels.LOG, context, logsBucket, args),
    error: (...args) => process(levels.ERROR, context, logsBucket, args),
    getJsonLogs: () => logsBucket
  };
};
