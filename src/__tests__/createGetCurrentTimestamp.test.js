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

import { describe, test, expect, afterAll, beforeAll, vi } from 'vitest';

import createGetCurrentTimestamp from '../createGetCurrentTimestamp.js';

describe('getCurrentTimestamp', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  test('returns a timestamp', () => {
    const date = new Date(Date.UTC(2000, 1, 1, 13));
    vi.setSystemTime(date);

    const getCurrentTimestamp = createGetCurrentTimestamp();

    expect(getCurrentTimestamp()).toBe(949410000000);
  });

  test('returns an unique timestamp if the same timestamp is returned multiple times', () => {
    const date = new Date(Date.UTC(2000, 1, 1, 13));
    vi.setSystemTime(date);

    const getCurrentTimestamp = createGetCurrentTimestamp();

    expect(getCurrentTimestamp()).toBe(949410000000);
    expect(getCurrentTimestamp()).toBe(949410000001);
  });
});
