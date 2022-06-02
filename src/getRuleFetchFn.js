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

/* eslint-disable no-param-reassign */

const byteArrayToString = (buf) =>
  String.fromCharCode.apply(null, new Uint8Array(buf));

module.exports = (
  globalFetch,
  headerOverrides,
  headersForSubrequests,
  logger
) => {
  return (resource, init = {}) => {
    // If resource is not a string then it must be a Request object and we
    // need to read it's headers. Otherwise the Request headers will be
    // lost when we add our mandatory headers.
    const resourceHeaders = {};
    if (typeof resource !== 'string' && resource.headers) {
      [...resource.headers.entries()].reduce((acc, [k, v]) => {
        acc[k] = v;
        return acc;
      }, resourceHeaders);
    }

    init.headers = {
      ...resourceHeaders,
      ...init.headers,
      ...headersForSubrequests
    };

    const url = resource.url || resource;
    headerOverrides.forEach(({ key, value, urlPattern }) => {
      const urlRegex = new RegExp(urlPattern);
      const headerValueRegex = new RegExp(`\\[\\[${key}]]`, 'ig');
      if (url.match(urlRegex)) {
        Object.keys(init.headers).forEach((headerKey) => {
          init.headers[headerKey] = init.headers[headerKey].replaceAll(
            headerValueRegex,
            value
          );
        });
      }
    });

    return globalFetch(resource, init).then(
      (r) => {
        // Below we will read the body of the response. The body can be read only once.
        // We are cloning the response and sending it down to the actions so in case
        // they also need to read the response, they can do it.
        const clonedResponse = r.clone();

        // We read r.text() in order to get rid of the potential CF warning:
        // A stalled HTTP response was canceled to prevent deadlock. This can happen when a
        // Worker calls fetch() or cache.match() several times without reading the bodies
        // of the returned Response objects. There is a limit on the number of concurrent
        // HTTP requests that can be in-flight at one time. Normally, additional requests made
        // beyond that limit are delayed until previous responses complete. However, because the
        // Worker did not read the responses, they would never complete. Therefore, to prevent
        // deadlock, the oldest response was canceled. To avoid this warning, make sure to either
        // read the body of every HTTP Response or call response.body.cancel() to cancel a response
        // that you don’t plan to read from.
        return Promise.all([
          r.arrayBuffer().then(byteArrayToString),
          r.status
        ]).then(([body, status]) => {
          logger.log(
            'FETCH',
            'Resource',
            resource,
            'Options',
            init,
            'Response Status',
            status,
            'Response Body',
            body || 'empty'
          );

          return clonedResponse;
        });
      },
      (e) => {
        logger.error(
          'FETCH',
          'Resource',
          resource,
          'Options',
          init,
          'Error',
          e.message
        );

        throw e;
      }
    );
  };
};
