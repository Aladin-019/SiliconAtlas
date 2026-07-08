import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import PCBExplorer from '../../pages/PCBExplorer'

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: ReactNode }) => <div data-testid="mock-canvas">{children}</div>,
}))

vi.mock('@react-three/drei', () => ({
  Center: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  OrbitControls: () => null,
  useGLTF: Object.assign(
    () => ({
      scene: {
        clone: () => ({}),
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
    expect(screen.getByRole('button', { name: /use glb/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /use gltf bundle/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /board view/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /component room/i })).toBeInTheDocument()
  })

  it('starts in board view', () => {
    render(<PCBExplorer />)

    expect(screen.getByRole('button', { name: /board view/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /component room/i })).toBeEnabled()
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
})