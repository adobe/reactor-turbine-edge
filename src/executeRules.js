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

const createNewLogger = require('./createNewLogger');
const fakeLogger = require('./getFakeLogger');

const getRuleFetchFn = require('./getRuleFetchFn');
const checkConditionResult = require('./rules/checkConditionResult');
const addActionResultToStash = require('./rules/addActionResultToStash');
const addModuleToQueue = require('./rules/addModuleToQueue');
const normalizeDelegate = require('./rules/normalizeDelegate');
const logRuleStarting = require('./rules/logRuleStarting');
const returnRuleResult = require('./rules/returnRuleResult');

const PROMISE_TIMEOUT = 30000;

module.exports = (
  moduleProvider,
  container,
  globalFetch,
  callData,
  { isDebugEnabled, headersForSubrequests } = {}
) => {
  const rulePromises = [];

  const { rules, buildInfo } = container;

  const freezedInitialCallData = JSON.stringify(callData);

  rules.forEach((rule) => {
    const logger = isDebugEnabled
      ? createNewLogger({ ruleId: rule.id })
      : fakeLogger;

    const fetch = getRuleFetchFn(globalFetch, headersForSubrequests, logger);

    const utils = {
      getRule: () => rule,
      getBuildInfo: () => buildInfo,
      logger,
      fetch
    };

    const initialContext = {
      arcAndUtils: {
        utils,
        arc: {
          ruleStash: {},
          ...JSON.parse(freezedInitialCallData)
        }
      }
    };

    let lastPromiseInQueue = Promise.resolve(initialContext);

    lastPromiseInQueue = lastPromiseInQueue.then(logRuleStarting);

    if (rule.conditions) {
      rule.conditions.forEach((condition) => {
        lastPromiseInQueue = addModuleToQueue(
          lastPromiseInQueue,
          checkConditionResult,
          {
            timeout: PROMISE_TIMEOUT,
            ...normalizeDelegate(condition, moduleProvider)
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
            timeout: PROMISE_TIMEOUT,
            ...normalizeDelegate(action, moduleProvider)
          },
          utils
        );
      });
    }

    lastPromiseInQueue = returnRuleResult(lastPromiseInQueue, rule, logger);

    rulePromises.push(lastPromiseInQueue);
  });

  return Promise.all(rulePromises);
};
