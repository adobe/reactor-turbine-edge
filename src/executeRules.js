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

import createNewLogger from './createNewLogger.js';
import getRuleFetchFn from './getRuleFetchFn.js';
import checkConditionResult from './rules/checkConditionResult.js';
import addActionResultToStash from './rules/addActionResultToStash.js';
import logRuleStarting from './rules/logRuleStarting.js';
import logRuleEnding from './rules/logRuleEnding.js';
import returnRuleResult from './rules/returnRuleResult.js';
import createPromiseChain from './rules/createPromiseChain.js';

export default (
  moduleProvider,
  container,
  globalFetch,
  requestData,
  env,
  { headersForSubrequests } = {}
) => {
  const rulePromises = [];

  const {
    rules = [],

    getHeaderOverrides = () => [],
    getLogSensitiveTokens = () => [],
    buildInfo
  } = container;

  const freezedInitialCallData = JSON.stringify(requestData);

  rules.forEach((rule) => {
    const { id, name } = rule;

    const logger = createNewLogger(
      { ruleId: rule.id },
      getLogSensitiveTokens(env)
    );

    const fetch = getRuleFetchFn(
      globalFetch,
      getHeaderOverrides(env),
      headersForSubrequests,
      logger
    );

    const utils = {
      getRule: () => ({ id, name }),
      getBuildInfo: () => buildInfo,
      logger,
      fetch
    };

    const initialContext = {
      env,
      arcAndUtils: {
        utils,
        arc: {
          ruleStash: {},
          ...JSON.parse(freezedInitialCallData)
        }
      }
    };

    let lastPromiseInQueue = Promise.resolve(initialContext);

    lastPromiseInQueue = lastPromiseInQueue
      .then(logRuleStarting)
      .then(
        createPromiseChain({
          modules: rule.conditions,
          resultFn: checkConditionResult,
          moduleProvider,
          utils
        })
      )
      .then(
        createPromiseChain({
          modules: rule.actions,
          resultFn: addActionResultToStash,
          moduleProvider,
          utils
        })
      )
      .then(logRuleEnding)
      .catch((e) => {
        logRuleEnding({ arcAndUtils: { utils } });
        throw e;
      });

    lastPromiseInQueue = returnRuleResult(lastPromiseInQueue, rule, logger);

    rulePromises.push(lastPromiseInQueue);
  });

  return Promise.all(rulePromises);
};
