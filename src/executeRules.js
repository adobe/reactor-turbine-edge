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

const logger = require('./logger');
const clone = require('./clone');
const createExecuteDelegateModule = require('./createExecuteDelegateModule');

const PROMISE_TIMEOUT = 2000;

module.exports = (
  moduleProvider,
  replaceTokens,
  container,
  ruleIds,
  initialPayload
) => {
  const rulePromises = [];

  const {
    rules,
    buildInfo,
    property: { settings: propertySettings }
  } = container;

  (
    rules.filter(rule => {
      return (ruleIds || []).indexOf(rule.id) !== -1;
    }) || []
  ).forEach(rule => {
    let lastPromiseInQueue = Promise.resolve(clone(initialPayload));

    const l = logger.createNewLogger();

    const executeDelegateModule = createExecuteDelegateModule(
      moduleProvider,
      replaceTokens
    );

    const getExtensionNameByRuleComponent = ruleComponent => {
      const moduleDefinition = moduleProvider.getModuleDefinition(
        ruleComponent.modulePath
      );

      return (moduleDefinition && moduleDefinition.extensionName) || '';
    };

    const getExtensionDisplayNameByRuleComponent = ruleComponent => {
      const extensionDefinition = moduleProvider.getExtensionDefinition(
        ruleComponent.modulePath
      );

      return (extensionDefinition && extensionDefinition.displayName) || '';
    };

    const getExtensionSettingsByRuleComponent = (
      ruleComponent,
      syntethicEvent
    ) => {
      const extensionDefinition = moduleProvider.getExtensionDefinition(
        ruleComponent.modulePath
      );

      const extensionSettings =
        (extensionDefinition && extensionDefinition.settings) || {};
      return replaceTokens(l, extensionSettings, syntethicEvent);
    };

    const getModuleDisplayNameByRuleComponent = ruleComponent => {
      const moduleDefinition = moduleProvider.getModuleDefinition(
        ruleComponent.modulePath
      );
      return (
        (moduleDefinition && moduleDefinition.displayName) ||
        ruleComponent.modulePath
      );
    };

    const getErrorMessage = (ruleComponent, errorMessage, errorStack) => {
      const moduleDisplayName = getModuleDisplayNameByRuleComponent(
        ruleComponent
      );
      return `Failed to execute ${moduleDisplayName} ${errorMessage} ${
        errorStack ? `\n ${errorStack}` : ''
      }`;
    };

    const logActionError = (action, e) => {
      l.error(getErrorMessage(action, e.message, e.stack));
    };

    // var logConditionError = function(condition, rule, e) {
    //   logger.error(getErrorMessage(condition, rule, e.message, e.stack));
    // };

    // var logConditionNotMet = function(condition, rule) {
    //   var conditionDisplayName = getModuleDisplayNameByRuleComponent(condition);

    //   logger.log(
    //     'Condition ' +
    //       conditionDisplayName +
    //       ' for rule ' +
    //       rule.name +
    //       ' not met.'
    //   );
    // };

    const logRuleStarting = ruleDefinition => {
      l.log(`Rule "${ruleDefinition.name}" is being executed.`);
    };

    const logDelegateModuleCall = (module, payload) => {
      const m = getModuleDisplayNameByRuleComponent(module);
      const e = getExtensionDisplayNameByRuleComponent(module);

      l.log(
        `Calling "${m}" module from the "${e}" extension.`,
        'Input: ',
        payload
      );
    };

    const logDelegateModuleOutput = (module, output) => {
      const m = getModuleDisplayNameByRuleComponent(module);
      const e = getExtensionDisplayNameByRuleComponent(module);

      l.log(
        `"${m}" module from the "${e}" extension returned.`,
        'Output:',
        output
      );
    };

    const normalizeError = e => {
      let newError = e;

      if (!newError) {
        newError = new Error(
          'The extension triggered an error, but no error information was provided.'
        );
      }

      if (!(newError instanceof Error)) {
        newError = new Error(String(newError));
      }

      return newError;
    };

    // var isConditionMet = function(condition, result) {
    //   return (result && !condition.negate) || (!result && condition.negate);
    // };

    // if (rule.conditions) {
    //   rule.conditions.forEach(function(condition) {
    //     lastPromiseInQueue = lastPromiseInQueue.then(function() {
    //       var timeoutId;

    //       return new Promise(function(resolve, reject) {
    //         timeoutId = setTimeout(function() {
    //           // Reject instead of resolve to prevent subsequent
    //           // conditions and actions from executing.
    //           reject(
    //             'A timeout occurred because the condition took longer than ' +
    //               PROMISE_TIMEOUT / 1000 +
    //               ' seconds to complete. '
    //           );
    //         }, PROMISE_TIMEOUT);

    //         Promise.resolve(
    //           executeDelegateModule(condition, payload, [payload, rule])
    //         ).then(resolve, reject);
    //       })
    //         .catch(function(e) {
    //           e = normalizeError(e, condition);
    //           logConditionError(condition, rule, e);
    //           return false;
    //         })
    //         .then(function(result) {
    //           clearTimeout(timeoutId);
    //           if (!isConditionMet(condition, result)) {
    //             logConditionNotMet(condition, rule);
    //             return Promise.reject();
    //           }
    //         });
    //     });
    //   });
    // }

    if (rule.actions) {
      lastPromiseInQueue = lastPromiseInQueue.then(p => {
        logRuleStarting(rule);
        return p;
      });

      rule.actions.forEach(action => {
        lastPromiseInQueue = lastPromiseInQueue.then(payload => {
          let timeoutId;

          return new Promise((resolve, reject) => {
            timeoutId = setTimeout(() => {
              reject(
                new Error(
                  `A timeout occurred because the action took longer than ${PROMISE_TIMEOUT /
                    1000} seconds to complete. `
                )
              );
            }, PROMISE_TIMEOUT);

            logDelegateModuleCall(action, payload);
            const clonedPayload = clone(payload);

            Promise.resolve(
              executeDelegateModule(l, action, clonedPayload, [
                clonedPayload,
                {
                  buildInfo,
                  propertySettings,
                  extensionSettings: getExtensionSettingsByRuleComponent(
                    action,
                    clonedPayload
                  ),
                  logger: l,
                  rule
                }
              ])
            ).then(result => {
              logDelegateModuleOutput(action, result);
              resolve(result);
            }, reject);
          })
            .catch(e => {
              logActionError(action, normalizeError(e));
              throw e;
            })
            .finally(() => {
              clearTimeout(timeoutId);
            })
            .then(result => {
              const extensionName = getExtensionNameByRuleComponent(action);
              const newPayload = payload;

              if (extensionName) {
                // If the module result is undefined, the module result will not
                // be logged correctly. Key with undefined won't be stringified
                // and then they won't appear in the response.
                newPayload[extensionName] = result || null;
              }

              return newPayload;
            });
        });
      });

      lastPromiseInQueue = lastPromiseInQueue
        .then(() => {
          return {
            ruleId: rule.id,
            status: 'success',
            logs: l.getLogs()
          };
        })
        .catch(e => {
          l.error(e);

          return {
            ruleId: rule.id,
            status: 'failed',
            logs: l.getLogs()
          };
        });
    }

    rulePromises.push(lastPromiseInQueue);
  });

  return Promise.all(rulePromises);
};
