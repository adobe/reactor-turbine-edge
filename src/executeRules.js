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

const createNewLogger = require('./createNewLogger');
const fakeLogger = require('./getFakeLogger');

const getRuleFetchFn = require('./getRuleFetchFn');
const checkConditionResult = require('./rules/checkConditionResult');
const addActionResultToStash = require('./rules/addActionResultToStash');
const addModuleToQueue = require('./rules/addModuleToQueue');
const normalizeDelegate = require('./rules/normalizeDelegate');

const PROMISE_TIMEOUT = 5000;

module.exports = (
  moduleProvider,
  container,
  globalFetch,
  callData,
  { isDebugEnabled, headersForSubrequests } = {}
) => {
  const rulePromises = [];

  const {
    rules,
    buildInfo,
    property: { settings: propertySettings }
  } = container;

  const freezedInitialCallData = JSON.stringify(callData);

  rules.forEach((rule) => {
    const logger = isDebugEnabled
      ? createNewLogger({ ruleId: rule.id })
      : fakeLogger;

    const fetch = getRuleFetchFn(globalFetch, headersForSubrequests, logger);

    const utils = {
      logger,
      fetch
    };

    const initialRuleContextData = {
      buildInfo,
      propertySettings,
      rule,
      ruleStash: {},
      ...JSON.parse(freezedInitialCallData)
    };

    let lastPromiseInQueue = Promise.resolve(initialRuleContextData);

    const logRuleStarting = (ruleDefinition) => {
      logger.log(`Rule "${ruleDefinition.name}" is being executed.`);
    };

    lastPromiseInQueue = lastPromiseInQueue.then((context) => {
      logRuleStarting(rule);
      return context;
    });

    if (rule.conditions) {
      rule.conditions.forEach((condition) => {
        lastPromiseInQueue = addModuleToQueue(
          lastPromiseInQueue,
          checkConditionResult,
          {
            ...normalizeDelegate(condition, moduleProvider),
            timeout: PROMISE_TIMEOUT
          },
          utils
        );
      });
    }

    if (rule.actions) {
      rule.actions.forEach((action) => {
        lastPromiseInQueue = addModuleToQueue(
          lastPromiseInQueue,
          addActionResultToStash,
          {
            ...normalizeDelegate(action, moduleProvider),
            timeout: PROMISE_TIMEOUT
          },
          utils
        );
      });
    }

    lastPromiseInQueue = lastPromiseInQueue
      .then(() => {
        return {
          ruleId: rule.id,
          status: 'success'
        };
      })
      .catch(() => {
        return {
          ruleId: rule.id,
          status: 'failed'
        };
      })
      .then((baseResult) => {
        const r = baseResult;
        r.logs = logger.getJsonLogs();

        return r;
      });

    rulePromises.push(lastPromiseInQueue);
  });

  return Promise.all(rulePromises);
};
