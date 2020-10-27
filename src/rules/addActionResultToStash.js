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

module.exports = ({
  moduleOutput: actionResult,
  arcAndUtils,
  delegateConfig: {
    extension: { name: extensionName }
  }
}) => {
  const {
    arc: { ruleStash }
  } = arcAndUtils;

  if (extensionName) {
    // If the module result is undefined, the module result will not
    // be logged correctly. Key with undefined won't be stringified
    // and then they won't appear in the response.
    // eslint-disable-next-line eqeqeq
    ruleStash[extensionName] = actionResult != undefined ? actionResult : null;
  }

  return { arcAndUtils };
};
