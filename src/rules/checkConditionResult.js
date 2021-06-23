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

const ConditionNotMetError = require('./conditionNotMetError');

const isConditionMet = (result, negate) => {
  return (result === true && !negate) || (result === false && negate);
};

module.exports = ({
  moduleOutput: conditionResult,
  arcAndUtils,
  delegateConfig: { displayName: conditionDisplayName, negate = false }
}) => {
  const {
    utils: { getRule }
  } = arcAndUtils;
  const { name } = getRule();

  if (typeof conditionResult !== 'boolean') {
    return Promise.reject(
      new Error(
        `Condition "${conditionDisplayName}" from rule "${name}" did not return a boolean result.`
      )
    );
  }

  if (!isConditionMet(conditionResult, negate)) {
    return Promise.reject(
      new ConditionNotMetError(
        `Condition "${conditionDisplayName}" from rule "${name}" not met.`
      )
    );
  }

  return Promise.resolve({ arcAndUtils });
};
