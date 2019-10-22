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

var logger = require('./logger');
var createExecuteDelegateModule = require('./createExecuteDelegateModule');
var Promise = require('@adobe/reactor-promise');
var PROMISE_TIMEOUT = 2000;

module.exports = function(moduleProvider, replaceTokens, rules, payload) {
  var rulePromises = [];

  (rules || []).forEach(function(rule) {
    var lastPromiseInQueue = Promise.resolve();
    var payloadPromise = Promise.resolve(payload);

    var executeDelegateModule = createExecuteDelegateModule(
      moduleProvider,
      replaceTokens
    );

    var getModuleDisplayNameByRuleComponent = function(ruleComponent) {
      var moduleDefinition = moduleProvider.getModuleDefinition(
        ruleComponent.modulePath
      );
      return (
        (moduleDefinition && moduleDefinition.displayName) ||
        ruleComponent.modulePath
      );
    };

    var getErrorMessage = function(ruleComponent, errorMessage, errorStack) {
      var moduleDisplayName = getModuleDisplayNameByRuleComponent(
        ruleComponent
      );
      return (
        'Failed to execute ' +
        moduleDisplayName +
        errorMessage +
        (errorStack ? '\n' + errorStack : '')
      );
    };

    var logActionError = function(action, e) {
      logger.error(getErrorMessage(action, e.message, e.stack));
    };

    var logConditionError = function(condition, rule, e) {
      logger.error(getErrorMessage(condition, rule, e.message, e.stack));
    };

    var logConditionNotMet = function(condition, rule) {
      var conditionDisplayName = getModuleDisplayNameByRuleComponent(condition);

      logger.log(
        'Condition ' +
          conditionDisplayName +
          ' for rule ' +
          rule.name +
          ' not met.'
      );
    };

    var logRuleCompleted = function(rule) {
      logger.log('Rule "' + rule.name + '" fired.');
    };

    var normalizeError = function(e) {
      if (!e) {
        e = new Error(
          'The extension triggered an error, but no error information was provided.'
        );
      }

      if (!(e instanceof Error)) {
        e = new Error(String(e));
      }

      return e;
    };

    var isConditionMet = function(condition, result) {
      return (result && !condition.negate) || (!result && condition.negate);
    };

    if (rule.conditions) {
      rule.conditions.forEach(function(condition) {
        lastPromiseInQueue = lastPromiseInQueue.then(function() {
          var timeoutId;

          return new Promise(function(resolve, reject) {
            timeoutId = setTimeout(function() {
              // Reject instead of resolve to prevent subsequent
              // conditions and actions from executing.
              reject(
                'A timeout occurred because the condition took longer than ' +
                  PROMISE_TIMEOUT / 1000 +
                  ' seconds to complete. '
              );
            }, PROMISE_TIMEOUT);

            Promise.resolve(
              executeDelegateModule(condition, payload, [payload])
            ).then(resolve, reject);
          })
            .catch(function(e) {
              e = normalizeError(e, condition);
              logConditionError(condition, rule, e);
              return false;
            })
            .then(function(result) {
              clearTimeout(timeoutId);
              if (!isConditionMet(condition, result)) {
                logConditionNotMet(condition, rule);
              }
            });
        });
      });
    }

    if (rule.actions) {
      lastPromiseInQueue = lastPromiseInQueue.then(function() {
        return payloadPromise;
      });

      rule.actions.forEach(function(action) {
        lastPromiseInQueue = lastPromiseInQueue.then(function(payload) {
          var timeoutId;

          return new Promise(function(resolve, reject) {
            timeoutId = setTimeout(function() {
              reject(
                'A timeout occurred because the action took longer than ' +
                  PROMISE_TIMEOUT / 1000 +
                  ' seconds to complete. '
              );
            }, PROMISE_TIMEOUT);

            Promise.resolve(
              executeDelegateModule(action, payload, [payload])
            ).then(resolve, reject);
          })
            .catch(function(e) {
              e = normalizeError(e);
              logActionError(action, rule, e);
            })
            .then(function(result) {
              clearTimeout(timeoutId);
              return result;
            });
        });
      });
    }

    lastPromiseInQueue = lastPromiseInQueue
      .then(function(lastActionResult) {
        logRuleCompleted(rule);
        return lastActionResult;
      })
      .catch(function() {});

    rulePromises.push(lastPromiseInQueue);
  });

  return Promise.all(rulePromises);
};
