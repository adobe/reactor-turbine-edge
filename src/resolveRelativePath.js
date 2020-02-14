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

const JS_EXTENSION = '.js';

/**
 * @private
 * Returns the directory of a path. A limited version of path.dirname in nodejs.
 *
 * To keep it simple, it makes the following assumptions:
 * path has a least one slash
 * path does not end with a slash
 * path does not have empty segments (e.g., /src/lib//foo.bar)
 *
 * @param {string} path
 * @returns {string}
 */
const dirname = path => {
  return path.substr(0, path.lastIndexOf('/'));
};

/**
 * Determines if a string ends with a certain string.
 * @param {string} str The string to test.
 * @param {string} suffix The suffix to look for at the end of str.
 * @returns {boolean} Whether str ends in suffix.
 */
const endsWith = (str, suffix) => {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

/**
 * Given a starting path and a path relative to the starting path, returns the final path. A
 * limited version of path.resolve in nodejs.
 *
 * To keep it simple, it makes the following assumptions:
 * fromPath has at least one slash
 * fromPath does not end with a slash.
 * fromPath does not have empty segments (e.g., /src/lib//foo.bar)
 * relativePath starts with ./ or ../
 *
 * @param {string} fromPath
 * @param {string} relativePath
 * @returns {string}
 */
module.exports = (fromPath, relativePath) => {
  let rp = relativePath;

  // Handle the case where the relative path does not end in the .js extension. We auto-append it.
  if (!endsWith(rp, JS_EXTENSION)) {
    rp += JS_EXTENSION;
  }

  const relativePathSegments = relativePath.split('/');
  const resolvedPathSegments = dirname(fromPath).split('/');

  relativePathSegments.forEach(relativePathSegment => {
    if (!relativePathSegment || relativePathSegment === '.') {
    } else if (relativePathSegment === '..') {
      if (resolvedPathSegments.length) {
        resolvedPathSegments.pop();
      }
    } else {
      resolvedPathSegments.push(relativePathSegment);
    }
  });

  return resolvedPathSegments.join('/');
};
