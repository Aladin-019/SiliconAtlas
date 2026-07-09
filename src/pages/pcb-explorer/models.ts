import simpleBoardGlbUrl from '../../data/pcb_data/simple_motherboard.glb?url'
import componentBoardGlbUrl from '../../data/pcb_data/motherboard__components.glb?url'
import rogStrixBoardGlbUrl from '../../data/pcb_data/rog_strix_x370-f_motherboard.glb?url'

export type BoardModelKey = 'simple-motherboard' | 'component-motherboard' | 'rog-strix-x370-f'
export type RotationTuple = [number, number, number]

export type BoardModelOption = {
  key: BoardModelKey
  label: string
  url: string
  rotation?: RotationTuple
  ambientIntensity?: number
  directionalIntensity?: number
}

export const boardModelOptions: BoardModelOption[] = [
  { key: 'simple-motherboard', label: 'Simple motherboard', url: simpleBoardGlbUrl },
  {
    key: 'component-motherboard',
    label: 'Motherboard components',
    url: componentBoardGlbUrl,
    rotation: [-Math.PI / 2, 0, 0],
    ambientIntensity: 1,
    directionalIntensity: 2,
  },
  {
    key: 'rog-strix-x370-f',
    label: 'ROG Strix X370-F motherboard',
    url: rogStrixBoardGlbUrl,
    rotation: [-Math.PI / 2, 0, 0],
    ambientIntensity: 1,
    directionalIntensity: 2,
  },
]

export const defaultBoardModelKey: BoardModelKey = 'simple-motherboard'

export function getBoardModelByKey(modelKey: BoardModelKey): BoardModelOption {
  return boardModelOptions.find((option) => option.key === modelKey) ?? boardModelOptions[0]
}