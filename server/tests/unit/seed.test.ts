import { EventEmitter } from 'node:events'
import type { IncomingMessage } from 'http'
import { describe, expect, it } from 'vitest'

import { adaptCpu, adaptGpu, fetchJson } from '../../seed.js'

type MockClient = {
  get: (url: string, cb: (res: IncomingMessage) => void) => { on: (event: 'error', handler: (err: Error) => void) => unknown }
}

function makeMockClient(responseChunks: string[], requestError?: Error): MockClient {
  return {
    get: (_url, cb) => {
      const request = {
        on: (event: 'error', handler: (err: Error) => void) => {
          if (event === 'error' && requestError) {
            queueMicrotask(() => handler(requestError))
          }
          return request
        },
      }

      if (!requestError) {
        const res = new EventEmitter() as IncomingMessage
        cb(res)
        queueMicrotask(() => {
          for (const chunk of responseChunks) {
            res.emit('data', chunk)
          }
          res.emit('end')
        })
      }

      return request
    },
  }
}

describe('adaptCpu', () => {
  it('maps source CPU fields to database shape', () => {
    const raw = {
      id: 10,
      cpu_model_name: 'Ryzen 7 7700X',
      family: 'Ryzen 7',
      cpu_model: '7700X',
      codename: 'Raphael',
      cores: 8,
      threads: 16,
      max_turbo_frequency_ghz: 5.4,
      l3_cache_mb: 32,
      tdp_watts: 105,
      launch_year: 2022,
      max_memory_tb: 0.128,
    }

    expect(adaptCpu(raw)).toEqual({
      source_id: 10,
      model_name: 'Ryzen 7 7700X',
      family: 'Ryzen 7',
      model: '7700X',
      codename: 'Raphael',
      cores: 8,
      threads: 16,
      boost_clock_ghz: 5.4,
      cache_l3_mb: 32,
      tdp_watts: 105,
      launch_year: 2022,
      max_memory_tb: 0.128,
    })
  })
})

describe('adaptGpu', () => {
  it('normalizes optional values to null', () => {
    const raw = {
      id: 22,
      gpu_model_name: 'RTX 4080',
      vendor: 'NVIDIA',
      gpu_model: 'AD103',
      form_factor: undefined,
      memory_gb: undefined,
      memory_type: null,
      tdp_watts: undefined,
    }

    expect(adaptGpu(raw)).toEqual({
      source_id: 22,
      model_name: 'RTX 4080',
      vendor: 'NVIDIA',
      model: 'AD103',
      form_factor: null,
      memory_gb: null,
      memory_type: null,
      tdp_watts: null,
    })
  })
})

describe('fetchJson', () => {
  it('parses chunked JSON data from https client', async () => {
    const client = makeMockClient(['{"ok":', 'true,"count":2}'])

    await expect(fetchJson('https://example.test/api', client)).resolves.toEqual({ ok: true, count: 2 })
  })

  it('rejects when response is invalid JSON', async () => {
    const client = makeMockClient(['{invalid'])

    await expect(fetchJson('https://example.test/api', client)).rejects.toBeInstanceOf(SyntaxError)
  })

  it('rejects when request emits an error', async () => {
    const client = makeMockClient([], new Error('network down'))

    await expect(fetchJson('https://example.test/api', client)).rejects.toThrow('network down')
  })
})