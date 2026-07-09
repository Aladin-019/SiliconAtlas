import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import PCBExplorer from '../../pages/PCBExplorer'

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: ReactNode }) => <div data-testid="mock-canvas">{children}</div>,
  useFrame: () => undefined,
  useThree: () => ({
    camera: {
      rotation: {
        x: 0,
        y: 0,
        order: 'XYZ',
        set: () => undefined,
      },
      up: { x: 0, y: 1, z: 0 },
      position: { add: () => undefined },
      getWorldDirection: (vector: { set: (x: number, y: number, z: number) => void }) => {
        vector.set(0, 0, -1)
        return vector
      },
    },
    scene: {
      traverse: () => undefined,
    },
  }),
}))

vi.mock('@react-three/drei', () => ({
  Center: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  useGLTF: Object.assign(
    () => ({
      scene: {
        clone: () => ({
          traverse: () => undefined,
        }),
      },
    }),
    {
      preload: vi.fn(),
    },
  ),
}))

afterEach(() => {
  cleanup()
})

describe('PCBExplorer', () => {
  it('renders the PCB selection screen first', () => {
    render(<PCBExplorer />)

    expect(screen.getByRole('heading', { name: /pcb explorer/i })).toBeInTheDocument()
    expect(screen.getByText(/select the pcb model you want to explore/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /pcb model/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start exploring/i })).toBeInTheDocument()
  })

  it('starts exploration in first-person mode for selected pcb', async () => {
    const user = userEvent.setup()
    render(<PCBExplorer />)

    const modelSelect = screen.getByRole('combobox', { name: /pcb model/i })
    await user.selectOptions(modelSelect, 'rog-strix-x370-f')
    await user.click(screen.getByRole('button', { name: /start exploring/i }))

    expect(screen.getByText(/exploring: rog strix x370-f motherboard/i)).toBeInTheDocument()
    expect(screen.getByText(/first-person controls:/i)).toBeInTheDocument()
  })

  it('can return to model selection from exploration', async () => {
    const user = userEvent.setup()
    render(<PCBExplorer />)

    await user.click(screen.getByRole('button', { name: /start exploring/i }))
    await user.click(screen.getByRole('button', { name: /choose another pcb/i }))

    expect(screen.getByText(/select the pcb model you want to explore/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start exploring/i })).toBeInTheDocument()
  })
})