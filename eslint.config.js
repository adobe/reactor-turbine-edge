/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { FlatCompat } from '@eslint/eslintrc';
// eslint-disable-next-line import/no-unresolved
import { defineConfig, globalIgnores } from 'eslint/config';
import pluginJs from '@eslint/js';
import path from 'path';
import { fileURLToPath } from 'url';
import globals from 'globals';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import vitest from '@vitest/eslint-plugin';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const compat = new FlatCompat({
  baseDirectory: dirname
});

export default defineConfig([
  ...compat.extends('airbnb-base'),
  globalIgnores(['src/__tests_helpers__/largeJsonResponse.json', 'dist/**']),
  {
    files: ['**/*.{js,cjs,jsx}'],
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.cjs', '.mjs', '.jsx']
        }
      }
    },
    languageOptions: {
      ecmaVersion: 2021,
      globals: {
        ...globals.node
      }
    },
    rules: {
      'prettier/prettier': 'error'
    }
  },
  {
    files: ['src/**/*.js'],
    rules: {
      'import/no-extraneous-dependencies': 'error',
      'no-param-reassign': 'off',
      'import/extensions': [
        'error',
        {
          js: 'always'
        }
      ]
    }
  },
  {
    files: ['eslint.config.js'],
    rules: {
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true
        }
      ]
    }
  },
  {
    files: ['src/**/*.test.js}'],
    plugins: {
      vitest
    },
    rules: {
      ...vitest.configs.recommended.rules
    }
  },

  pluginJs.configs.recommended,
  eslintPluginPrettierRecommended
]);
