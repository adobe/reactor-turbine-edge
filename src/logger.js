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

let logs = [];

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
 * Whether logged messages should be output to the console.
 * @type {boolean}
 */
let outputEnabled = false;

/**
 * Processes a log message.
 * @param {string} level The level of message to log.
 * @param {...*} arg Any argument to be logged.
 * @private
 */
const process = (level, ...logArguments) => {
  if (outputEnabled) {
    logArguments.unshift(launchPrefix);

    logs.push({
      timestamps: Date.now(),
      type: level,
      message: logArguments
    });
  }
};

/**
 * Outputs a message to the web console.
 * @param {...*} arg Any argument to be logged.
 */
const log = process.bind(null, levels.LOG);

/**
 * Outputs informational message to the web console. In some browsers a small "i" icon is
 * displayed next to these items in the web console's log.
 * @param {...*} arg Any argument to be logged.
 */
const info = process.bind(null, levels.INFO);

/**
 * Outputs debug message to the web console. In browsers that do not support
 * console.debug, console.info is used instead.
 * @param {...*} arg Any argument to be logged.
 */
const debug = process.bind(null, levels.DEBUG);

/**
 * Outputs a warning message to the web console.
 * @param {...*} arg Any argument to be logged.
 */
const warn = process.bind(null, levels.WARN);

/**
 * Outputs an error message to the web console.
 * @param {...*} arg Any argument to be logged.
 */
const error = process.bind(null, levels.ERROR);

module.exports = {
  log,
  info,
  debug,
  warn,
  error,

  getLogs: () => logs,
  clearLogs: () => {
    logs = [];
  },

  /**
   * Whether logged messages should be output to the console.
   * @type {boolean}
   */
  get outputEnabled() {
    return outputEnabled;
  },
  set outputEnabled(value) {
    outputEnabled = value;
  },
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
