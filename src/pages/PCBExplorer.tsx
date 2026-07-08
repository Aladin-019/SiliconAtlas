import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Center, OrbitControls, useGLTF } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { FrontSide, Raycaster, Vector3 } from 'three'
import type { Material, Mesh } from 'three'

import simpleBoardGlbUrl from '../data/pcb_data/simple_motherboard.glb?url'
import componentBoardGlbUrl from '../data/pcb_data/motherboard__components.glb?url'
import rogStrixBoardGlbUrl from '../data/pcb_data/rog_strix_x370-f_motherboard.glb?url'

type NavigationMode = 'first-person' | 'third-person'
type BoardModelKey = 'simple-motherboard' | 'component-motherboard' | 'rog-strix-x370-f'
type RotationTuple = [number, number, number]

type BoardModelOption = {
  key: BoardModelKey
  label: string
  url: string
  rotation?: RotationTuple
  ambientIntensity?: number
  directionalIntensity?: number
}

const boardModelOptions: BoardModelOption[] = [
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

function KeyboardFirstPersonControls() {
  const { camera, scene } = useThree()
  const pressedRef = useRef<Set<string>>(new Set())
  const yawRef = useRef<number>(0)
  const pitchRef = useRef<number>(0)
  const raycasterRef = useRef<Raycaster>(new Raycaster())
  const collisionDirectionRef = useRef<Vector3>(new Vector3())
  const movementStepRef = useRef<Vector3>(new Vector3())
  const collidableRef = useRef<Mesh[]>([])

  useEffect(() => {
    const collidableMeshes: Mesh[] = []
    scene.traverse((object) => {
      if ((object as Mesh).isMesh && (object as Mesh).userData?.collidable === true) {
        collidableMeshes.push(object as Mesh)
      }
    })
    collidableRef.current = collidableMeshes
  }, [scene])

  useEffect(() => {
    camera.rotation.order = 'YXZ'
    yawRef.current = camera.rotation.y
    pitchRef.current = camera.rotation.x

    const supportedKeys = new Set(['w', 'a', 's', 'd', 'r', 'f', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'])

    const normalizeKey = (key: string) => (key.length === 1 ? key.toLowerCase() : key)

    const onKeyDown = (event: KeyboardEvent) => {
      const key = normalizeKey(event.key)
      if (!supportedKeys.has(key)) {
        return
      }
      if (key.startsWith('Arrow')) {
        event.preventDefault()
      }
      pressedRef.current.add(key)
    }

    const onKeyUp = (event: KeyboardEvent) => {
      const key = normalizeKey(event.key)
      if (!supportedKeys.has(key)) {
        return
      }
      pressedRef.current.delete(key)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  useFrame((_, delta) => {
    const pressed = pressedRef.current
    if (pressed.size === 0) {
      return
    }

    const rotationSpeed = 1.35
    const movementSpeed = 0.2

    if (pressed.has('ArrowLeft')) {
      yawRef.current += rotationSpeed * delta
    }
    if (pressed.has('ArrowRight')) {
      yawRef.current -= rotationSpeed * delta
    }
    if (pressed.has('ArrowUp')) {
      pitchRef.current -= rotationSpeed * delta
    }
    if (pressed.has('ArrowDown')) {
      pitchRef.current += rotationSpeed * delta
    }

    const maxPitch = Math.PI / 2 - 0.05
    const minPitch = -maxPitch
    pitchRef.current = Math.max(minPitch, Math.min(maxPitch, pitchRef.current))

    camera.rotation.set(pitchRef.current, yawRef.current, 0)

    const forward = new Vector3()
    camera.getWorldDirection(forward)
    forward.y = 0
    if (forward.lengthSq() > 0) {
      forward.normalize()
    }

    const right = new Vector3().crossVectors(forward, camera.up)
    if (right.lengthSq() > 0) {
      right.normalize()
    }

    const movement = new Vector3()
    if (pressed.has('w')) {
      movement.add(forward)
    }
    if (pressed.has('s')) {
      movement.sub(forward)
    }
    if (pressed.has('d')) {
      movement.add(right)
    }
    if (pressed.has('a')) {
      movement.sub(right)
    }
    if (pressed.has('r')) {
      movement.y += 1
    }
    if (pressed.has('f')) {
      movement.y -= 1
    }

    if (movement.lengthSq() > 0) {
      movement.normalize()
      const movementStep = movementStepRef.current
      movementStep.copy(movement).multiplyScalar(movementSpeed * delta)

      const collisionDirection = collisionDirectionRef.current
      collisionDirection.copy(movementStep).normalize()

      const collisionDistance = 0.08
      raycasterRef.current.set(camera.position, collisionDirection)
      const hits = raycasterRef.current.intersectObjects(collidableRef.current, true)
      const blocked = hits.some((hit) => hit.distance <= collisionDistance)

      if (!blocked) {
        camera.position.add(movementStep)
      }
    }
  })

  return null
}

function BoardModel({
  url,
  onSelect,
  rotation = [0, 0, 0],
}: {
  url: string
  onSelect: (name: string) => void
  rotation?: RotationTuple
}) {
  const { scene } = useGLTF(url)
  const cloned = useMemo(() => {
    const clone = scene.clone(true)

    // Keep close-up first-person rendering from showing hollow/see-through faces.
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

function PCBExplorer() {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [navigationMode, setNavigationMode] = useState<NavigationMode>('third-person')
  const [activeModelKey, setActiveModelKey] = useState<BoardModelKey>('simple-motherboard')

  const activeModel = boardModelOptions.find((option) => option.key === activeModelKey) ?? boardModelOptions[0]

  const firstPersonCameraPosition: [number, number, number] = [0, 0.015, -0.08]
  const thirdPersonCameraPosition: [number, number, number] = [0, 4, 9]
  const cameraPosition: [number, number, number] =
    navigationMode === 'first-person' ? firstPersonCameraPosition : thirdPersonCameraPosition
  const firstPersonCameraRotation: [number, number, number] = [0, -1.5, 0]
  const thirdPersonCameraRotation: [number, number, number] = [0, 0, 0]
  const cameraRotation: [number, number, number] =
    navigationMode === 'first-person' ? firstPersonCameraRotation : thirdPersonCameraRotation
  const lightPosition: [number, number, number] = [6, 8, 4]
  const orbitTarget: [number, number, number] = [0, 0.6, 0]
  const nearGroundSize = 220
  const farGroundSize = 520
  const ambientIntensity = activeModel.ambientIntensity ?? 0.6
  const directionalIntensity = activeModel.directionalIntensity ?? 1.3
  const helpText =
    navigationMode === 'first-person'
      ? 'First-person controls: W/A/S/D to move, R/F to move up/down, and use arrow keys to rotate view. Movement is tuned very slow for precise tiny-on-board exploration.'
      : 'Third-person controls: drag to orbit, scroll to zoom, and right-click drag to pan.'

  return (
    <div>
      <h1>PCB Explorer (3D)</h1>
      <p>
        Walkthrough starter for your explorer idea. GLB is used because it is a single packed asset.
        Click a component mesh to select it.
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <label htmlFor="pcb-model-select" style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          Board model
          <select
            id="pcb-model-select"
            value={activeModel.key}
            onChange={(event) => {
              setSelectedComponent(null)
              setActiveModelKey(event.target.value as BoardModelKey)
            }}
          >
            {boardModelOptions.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => setNavigationMode('first-person')}
          disabled={navigationMode === 'first-person'}
        >
          First-person
        </button>
        <button
          type="button"
          onClick={() => setNavigationMode('third-person')}
          disabled={navigationMode === 'third-person'}
        >
          Third-person
        </button>
      </div>

      <p style={{ marginTop: 0, marginBottom: 12 }}>{helpText}</p>

      <div
        style={{
          border: '1px solid #8f7f68',
          borderRadius: 8,
          overflow: 'hidden',
          background: '#0e1b12',
          height: '72vh',
          minHeight: 460,
        }}
      >
        <Canvas
          key={`${navigationMode}-${activeModel.key}`}
          camera={{
            position: cameraPosition,
            fov: 55,
            rotation: cameraRotation,
            near: navigationMode === 'first-person' ? 0.01 : 0.1,
            far: 200,
          }}
          shadows
        >
          <color attach="background" args={['#153126']} />
          <ambientLight intensity={ambientIntensity} />
          <directionalLight position={lightPosition} intensity={directionalIntensity} castShadow />

          <mesh position={[0, -1.2, 0]} receiveShadow>
            <planeGeometry args={[nearGroundSize, nearGroundSize]} />
            <meshStandardMaterial color="#1f5f35" />
          </mesh>
          <mesh position={[0, -1.26, 0]} receiveShadow>
            <planeGeometry args={[farGroundSize, farGroundSize]} />
            <meshStandardMaterial color="#14412b" />
          </mesh>
          <BoardModel
            url={activeModel.url}
            rotation={activeModel.rotation}
            onSelect={setSelectedComponent}
          />

          {navigationMode === 'third-person' && (
            <OrbitControls
              makeDefault
              enableDamping
              dampingFactor={0.08}
              minDistance={2.5}
              maxDistance={25}
              target={orbitTarget}
            />
          )}
          {navigationMode === 'first-person' && <KeyboardFirstPersonControls />}
        </Canvas>
      </div>

      <div style={{ marginTop: 12, padding: '8px 12px', border: '1px solid #8f7f68', borderRadius: 6, background: '#e4dac7' }}>
        <strong>Selected:</strong> {selectedComponent ?? 'None'}
      </div>
    </div>
  )
}

useGLTF.preload(simpleBoardGlbUrl)
useGLTF.preload(componentBoardGlbUrl)
useGLTF.preload(rogStrixBoardGlbUrl)

export default PCBExplorer