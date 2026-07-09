import { useMemo } from 'react'
import { Center, useGLTF } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { FrontSide } from 'three'
import type { Material, Mesh } from 'three'

import type { RotationTuple } from './models'

type BoardModelProps = {
  url: string
  onSelect: (name: string) => void
  rotation?: RotationTuple
}

function BoardModel({ url, onSelect, rotation = [0, 0, 0] }: BoardModelProps) {
  const { scene } = useGLTF(url)
  const cloned = useMemo(() => {
    const clone = scene.clone(true)

    clone.traverse((object) => {
      if ((object as Mesh).isMesh) {
        const mesh = object as Mesh
        mesh.userData.collidable = true
        const materialList = Array.isArray(mesh.material) ? mesh.material : [mesh.material]

        materialList.forEach((material) => {
          const typed = material as Material & {
            transparent?: boolean
            depthWrite?: boolean
            depthTest?: boolean
            side?: number
            needsUpdate?: boolean
          }

          typed.transparent = false
          typed.depthWrite = true
          typed.depthTest = true
          typed.side = FrontSide
          typed.needsUpdate = true
        })
      }
    })

    return clone
  }, [scene])

  const handlePick = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    const pickedName = event.object.name?.trim() || 'Unnamed component'
    onSelect(pickedName)
  }

  return (
    <Center>
      <primitive object={cloned} rotation={rotation} onPointerDown={handlePick} />
    </Center>
  )
}

export default BoardModel