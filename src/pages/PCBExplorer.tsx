import { useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Center, OrbitControls, useGLTF } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'

import boardGlbUrl from '../data/simple_motherboard/simple_motherboard.glb?url'
import boardGltfUrl from '../data/simple_motherboard/simple_motherboard/scene.gltf?url'

type ModelKind = 'glb' | 'gltf'
type ExplorerMode = 'board' | 'component-room'

function BoardModel({ url, onSelect }: { url: string; onSelect: (name: string) => void }) {
  const { scene } = useGLTF(url)
  const cloned = useMemo(() => scene.clone(true), [scene])

  const handlePick = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation()
    const pickedName = event.object.name?.trim() || 'Unnamed component'
    onSelect(pickedName)
  }

  return (
    <Center>
      <primitive object={cloned} onPointerDown={handlePick} />
    </Center>
  )
}

function ComponentRoom() {
  return (
    <>
      <mesh position={[0, -1.1, 0]} receiveShadow>
        <boxGeometry args={[12, 0.2, 12]} />
        <meshStandardMaterial color="#0f1d12" />
      </mesh>
      <mesh position={[0, 1.8, -5.9]} receiveShadow>
        <boxGeometry args={[12, 6, 0.2]} />
        <meshStandardMaterial color="#26372a" />
      </mesh>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 1.3, 1.3]} />
        <meshStandardMaterial color="#8ee58e" emissive="#3f9d3f" emissiveIntensity={0.45} />
      </mesh>
      <mesh position={[0, 2.2, 0]} castShadow>
        <boxGeometry args={[1.8, 0.25, 0.25]} />
        <meshStandardMaterial color="#d2f7d2" />
      </mesh>
    </>
  )
}

function PCBExplorer() {
  const [modelKind, setModelKind] = useState<ModelKind>('glb')
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [mode, setMode] = useState<ExplorerMode>('board')

  const modelUrl = modelKind === 'glb' ? boardGlbUrl : boardGltfUrl

  return (
    <div>
      <h1>PCB Explorer (3D)</h1>
      <p>
        Walkthrough starter for your explorer idea. GLB is used by default because it is a single packed asset.
        Click a component mesh to select it, then enter a conceptual room view.
      </p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <button type="button" onClick={() => setModelKind('glb')} disabled={modelKind === 'glb'}>
          Use GLB (recommended)
        </button>
        <button type="button" onClick={() => setModelKind('gltf')} disabled={modelKind === 'gltf'}>
          Use GLTF bundle
        </button>
        <button
          type="button"
          onClick={() => setMode('board')}
          disabled={mode === 'board'}
        >
          Board view
        </button>
        <button
          type="button"
          onClick={() => setMode('component-room')}
          disabled={mode === 'component-room'}
        >
          Component room
        </button>
      </div>

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
        <Canvas camera={{ position: [0, 4, 9], fov: 55 }} shadows>
          <color attach="background" args={[mode === 'component-room' ? '#11180f' : '#153126']} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[6, 8, 4]} intensity={1.3} castShadow />

          {mode === 'board' && (
            <>
              <mesh position={[0, -1.2, 0]} receiveShadow>
                <planeGeometry args={[35, 35]} />
                <meshStandardMaterial color="#1f5f35" />
              </mesh>
              <BoardModel url={modelUrl} onSelect={setSelectedComponent} />
            </>
          )}

          {mode === 'component-room' && <ComponentRoom />}

          <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
        </Canvas>
      </div>

      <div style={{ marginTop: 12, padding: '8px 12px', border: '1px solid #8f7f68', borderRadius: 6, background: '#e4dac7' }}>
        <strong>Selected:</strong> {selectedComponent ?? 'None'}
      </div>
    </div>
  )
}

useGLTF.preload(boardGlbUrl)
useGLTF.preload(boardGltfUrl)

export default PCBExplorer