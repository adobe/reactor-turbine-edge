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

const clone = require('./clone');

const emptyFn = () => {};

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
 * @param {string} logLevel The level of message to log.
 * @param {object} meta Meta information related to the log (eg. ruleId, requestId).
 * @param {array} logs Queue where the log should be pushed.
 * @param {...*} arg Any argument to be logged.
 * @private
 */
const process = (logLevel, meta, logs, ...logArguments) => {
  logArguments.unshift(launchPrefix);

  logs.push({
    name: 'evaluatingRule',
    timestampMs: Date.now(),
    attributes: { logLevel },
    messages: clone(logArguments),
    context: meta
  });
};

module.exports = {
  createNewLogger: (meta, logEnabled) => {
    let logs = [];

    /**
     * Outputs a message to the SSF logs.
     * @param {...*} arg Any argument to be logged.
     */
    const log = logEnabled
      ? process.bind(null, levels.LOG, meta, logs)
      : emptyFn;

    /**
     * Outputs informational message to the SSF logs.
     * @param {...*} arg Any argument to be logged.
     */
    const info = logEnabled
      ? process.bind(null, levels.INFO, meta, logs)
      : emptyFn;

    /**
     * Outputs debug message to the SSF logs.
     * @param {...*} arg Any argument to be logged.
     */
    const debug = logEnabled
      ? process.bind(null, levels.DEBUG, meta, logs)
      : emptyFn;

    /**
     * Outputs a warning message to the SSF logs.
     * @param {...*} arg Any argument to be logged.
     */
    const warn = logEnabled
      ? process.bind(null, levels.WARN, meta, logs)
      : emptyFn;

    /**
     * Outputs an error message to the SSF logs.
     * @param {...*} arg Any argument to be logged.
     */
    const error = logEnabled
      ? process.bind(null, levels.ERROR, meta, logs)
      : emptyFn;

    return {
      log,
      info,
      debug,
      warn,
      error,

      getJsonLogs: () =>
        logs.map((l) => ({
          ...l,
          messages: l.messages.map((m) =>
            typeof m !== 'string' ? JSON.stringify(m) : m
          )
        })),

      flushLogsToConsole: () => {
        if (typeof console !== 'undefined') {
          logs.forEach((l) => {
            // eslint-disable-next-line no-console
            console[l.logLevel || 'log'].apply(null, l.messages);
          });

          logs = [];
        }
      },

      /**
       * Creates a logging utility that only exposes logging functionality and prefixes all messages
       * with an identifier.
       */
      createPrefixedLogger: (identifier) => {
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
