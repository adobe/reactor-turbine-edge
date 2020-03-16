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

/**
 * Log levels.
 * @readonly
 * @enum {string}
 * @private
 */
const levels = {
  LOG: 'log',
  INFO: 'info',
  DEBUG: 'debug',
  WARN: 'warn',
  ERROR: 'error'
};

/**
 * Rocket unicode surrogate pair.
 * @type {string}
 */
const ROCKET = '\uD83D\uDE80';

/**
 * Prefix to use on all messages. The rocket unicode doesn't work on IE 10.
 * @type {string}
 */
const launchPrefix = ROCKET;

/**
 * Processes a log message.
 * @param {string} level The level of message to log.
 * @param {...*} arg Any argument to be logged.
 * @private
 */
const process = (level, meta, logs, ...logArguments) => {
  logArguments.unshift(launchPrefix);

  logs.push({
    timestamp: Date.now(),
    level,
    message: logArguments.map(l =>
      typeof l !== 'string' ? JSON.stringify(l) : l
    ),
    meta
  });
};

module.exports = {
  createNewLogger: meta => {
    const logs = [];

    /**
     * Outputs a message to the SSF logs.
     * @param {...*} arg Any argument to be logged.
     */
    const log = process.bind(null, levels.LOG, meta, logs);

    /**
     * Outputs informational message to the SSF logs.
     * @param {...*} arg Any argument to be logged.
     */
    const info = process.bind(null, levels.INFO, meta, logs);

    /**
     * Outputs debug message to the SSF logs.
     * @param {...*} arg Any argument to be logged.
     */
    const debug = process.bind(null, levels.DEBUG, meta, logs);

    /**
     * Outputs a warning message to the SSF logs.
     * @param {...*} arg Any argument to be logged.
     */
    const warn = process.bind(null, levels.WARN, meta, logs);

    /**
     * Outputs an error message to the SSF logs.
     * @param {...*} arg Any argument to be logged.
     */
    const error = process.bind(null, levels.ERROR, meta, logs);

    return {
      log,
      info,
      debug,
      warn,
      error,

      getLogs: () => logs,

      /**
       * Creates a logging utility that only exposes logging functionality and prefixes all messages
       * with an identifier.
       */
      createPrefixedLogger: identifier => {
        const loggerSpecificPrefix = `[ ${identifier} ]`;

        return {
          log: log.bind(null, loggerSpecificPrefix),
          info: info.bind(null, loggerSpecificPrefix),
          debug: debug.bind(null, loggerSpecificPrefix),
          warn: warn.bind(null, loggerSpecificPrefix),
          error: error.bind(null, loggerSpecificPrefix)
        };
      }
    };
  }
};
