import { describe, expect, it } from 'vitest'

import { parseLimit, parseSearchQuery, rowToCpuSpec, rowToGpuSpec } from '../../index.js'

describe('parseSearchQuery', () => {
  it('trims query strings and falls back to empty string', () => {
    expect(parseSearchQuery('  ryzen  ')).toBe('ryzen')
    expect(parseSearchQuery(undefined)).toBe('')
  })
})

describe('parseLimit', () => {
  it('uses default 50 when missing or invalid', () => {
    expect(parseLimit(undefined)).toBe(50)
    expect(parseLimit('not-a-number')).toBe(50)
  })

  it('caps the limit at 100', () => {
    expect(parseLimit('25')).toBe(25)
    expect(parseLimit('999')).toBe(100)
  })
})

describe('rowToCpuSpec', () => {
  it('maps a processor row to the API CPU shape', () => {
    expect(
      rowToCpuSpec({
        source_id: 42,
        model_name: 'Ryzen 9 9950X',
        family: 'Ryzen 9',
        model: '9950X',
        codename: 'Granite Ridge',
        cores: 16,
        threads: 32,
        boost_clock_ghz: 5.7,
        cache_l3_mb: 64,
        tdp_watts: 170,
        launch_year: 2024,
        max_memory_tb: 0.192,
      })
    ).toEqual({
      id: 42,
      cpu_model_name: 'Ryzen 9 9950X',
      family: 'Ryzen 9',
      cpu_model: '9950X',
      codename: 'Granite Ridge',
      cores: 16,
      threads: 32,
      max_turbo_frequency_ghz: 5.7,
      l3_cache_mb: 64,
      tdp_watts: 170,
      launch_year: 2024,
      max_memory_tb: 0.192,
    })
  })

  it('falls back to row id when source_id is null', () => {
    expect(
      rowToCpuSpec({
        source_id: null,
        id: 7,
        model_name: 'Xeon Gold',
        family: 'Xeon',
        model: 'Gold',
        codename: 'Sapphire Rapids',
        cores: 24,
        threads: 48,
        boost_clock_ghz: 4,
        cache_l3_mb: 45,
        tdp_watts: 205,
        launch_year: 2023,
        max_memory_tb: 4,
      }).id
    ).toBe(7)
  })
})

describe('rowToGpuSpec', () => {
  it('maps a GPU row to the API GPU shape', () => {
    expect(
      rowToGpuSpec({
        source_id: 9,
        model_name: 'RTX 4090',
        vendor: 'NVIDIA',
        model: 'AD102',
        form_factor: 'Desktop',
        memory_gb: 24,
        memory_type: 'GDDR6X',
        tdp_watts: 450,
      })
    ).toEqual({
      id: 9,
      source_id: 9,
      model_name: 'RTX 4090',
      vendor: 'NVIDIA',
      model: 'AD102',
      form_factor: 'Desktop',
      memory_gb: 24,
      memory_type: 'GDDR6X',
      tdp_watts: 450,
    })
  })

  it('omits source_id when it is null', () => {
    expect(
      rowToGpuSpec({
        source_id: null,
        id: 13,
        model_name: 'Radeon RX 7900 XTX',
        vendor: 'AMD',
        model: 'Navi 31',
        form_factor: null,
        memory_gb: 24,
        memory_type: 'GDDR6',
        tdp_watts: 355,
      })
    ).toEqual({
      id: 13,
      source_id: undefined,
      model_name: 'Radeon RX 7900 XTX',
      vendor: 'AMD',
      model: 'Navi 31',
      form_factor: null,
      memory_gb: 24,
      memory_type: 'GDDR6',
      tdp_watts: 355,
    })
  })
})