/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { describe, it, expect, vi, beforeEach } from 'vitest';
import getMtlsFetch from '../getMtlsFetch.js';
import { MTLS_BINDING } from '../constants.js';

describe('getMtlsFetch', () => {
  let mockEnv;
  let mockFetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    mockEnv = {};
  });

  it('should return the MTLS fetch function when the binding exists', () => {
    // Arrange
    mockEnv[MTLS_BINDING] = { fetch: mockFetch };
    const boundMockFetch = mockFetch.bind(mockEnv[MTLS_BINDING]);
    mockFetch.bind = vi.fn().mockReturnValue(boundMockFetch);

    // Act
    const result = getMtlsFetch(mockEnv);

    // Assert
    expect(result).toBe(boundMockFetch);
  });

  it('should return a function that throws an error when the binding does not exist', () => {
    // Arrange
    mockEnv = {}; // Empty env without MTLS binding

    // Act
    const result = getMtlsFetch(mockEnv);

    // Assert
    expect(() => result()).toThrowError(
      'MTLS certificate not found on the worker'
    );
  });

  it('should handle undefined env gracefully', () => {
    // Act
    const result = getMtlsFetch(undefined);

    // Assert
    expect(result).toBeInstanceOf(Function);
    expect(() => result()).toThrowError(
      'MTLS certificate not found on the worker'
    );
  });
});
