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
      rotation: { x: 0, y: 0 },
      up: { x: 0, y: 1, z: 0 },
      position: { addScaledVector: () => undefined },
      getWorldDirection: (vector: { set: (x: number, y: number, z: number) => void }) => {
        vector.set(0, 0, -1)
        return vector
      },
    },
  }),
}))

vi.mock('@react-three/drei', () => ({
  Center: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  FirstPersonControls: () => null,
  OrbitControls: () => null,
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
  it('renders key explorer controls', () => {
    render(<PCBExplorer />)

    expect(screen.getByRole('heading', { name: /pcb explorer/i })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /board model/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /simple motherboard/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /motherboard components/i })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: /rog strix x370-f motherboard/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /board view/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /component room/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /first-person/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /third-person/i })).toBeInTheDocument()
  })

  it('starts in board view', () => {
    render(<PCBExplorer />)

    expect(screen.getByRole('button', { name: /board view/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /component room/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /third-person/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /first-person/i })).toBeEnabled()
  })

  it('switches from board view to component room and back', async () => {
    const user = userEvent.setup()
    render(<PCBExplorer />)

    const boardButton = screen.getByRole('button', { name: /board view/i })
    const roomButton = screen.getByRole('button', { name: /component room/i })

    await user.click(roomButton)

    expect(boardButton).toBeEnabled()
    expect(roomButton).toBeDisabled()

    await user.click(boardButton)

    expect(boardButton).toBeDisabled()
    expect(roomButton).toBeEnabled()
  })

  it('shows no selected component by default', () => {
    render(<PCBExplorer />)

    expect(screen.getByText(/selected:/i)).toBeInTheDocument()
    expect(screen.getByText('None')).toBeInTheDocument()
  })

  it('switches from third-person to first-person navigation and back', async () => {
    const user = userEvent.setup()
    render(<PCBExplorer />)

    const firstPersonButton = screen.getByRole('button', { name: /first-person/i })
    const thirdPersonButton = screen.getByRole('button', { name: /third-person/i })

    await user.click(firstPersonButton)

    expect(firstPersonButton).toBeDisabled()
    expect(thirdPersonButton).toBeEnabled()
    expect(screen.getByText(/first-person controls:/i)).toBeInTheDocument()

    await user.click(thirdPersonButton)

    expect(firstPersonButton).toBeEnabled()
    expect(thirdPersonButton).toBeDisabled()
    expect(screen.getByText(/third-person controls:/i)).toBeInTheDocument()
  })
})