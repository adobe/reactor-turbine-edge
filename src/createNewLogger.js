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

const anonymizeString = require('./anonymizeString');
const getCurrentTimestamp = require('./getCurrentTimestamp');

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
 * @param {array} logsBucket Queue where the log should be pushed.
 * @param {logSensitiveTokens} logSensitiveTokens An array of tokens that need to be anonymized.
 * @param {...*} arg Any argument to be logged.
 * @private
 */
const process = (logLevel, context, logsBucket, logSensitiveTokens, args) => {
  args.unshift(launchPrefix);
  const sensitiveTokensRegexp = new RegExp(logSensitiveTokens.join('|'), 'g');

  logsBucket.push({
    name: 'evaluatingRule',
    timestampMs: getCurrentTimestamp(),
    attributes: { logLevel },
    messages: args.map((m) =>
      typeof m !== 'string'
        ? JSON.stringify(m)?.replaceAll(sensitiveTokensRegexp, anonymizeString)
        : m.replaceAll(sensitiveTokensRegexp, anonymizeString)
    ),
    context
  });
};

module.exports = (context, logSensitiveTokens = []) => {
  const logsBucket = [];

  return {
    log: (...args) =>
      process(levels.LOG, context, logsBucket, logSensitiveTokens, args),
    info: (...args) =>
      process(levels.INFO, context, logsBucket, logSensitiveTokens, args),
    debug: (...args) =>
      process(levels.DEBUG, context, logsBucket, logSensitiveTokens, args),
    warn: (...args) =>
      process(levels.WARN, context, logsBucket, logSensitiveTokens, args),
    error: (...args) =>
      process(levels.ERROR, context, logsBucket, logSensitiveTokens, args),

    getJsonLogs: () => logsBucket
  };
};
