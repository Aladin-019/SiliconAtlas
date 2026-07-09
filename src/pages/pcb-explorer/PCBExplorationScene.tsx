import { useState } from 'react'
import { Canvas } from '@react-three/fiber'

import BoardModel from './BoardModel'
import KeyboardFirstPersonControls from './KeyboardFirstPersonControls'
import type { BoardModelOption } from './models'

type PCBExplorationSceneProps = {
  model: BoardModelOption
  onChooseDifferentModel: () => void
}

function PCBExplorationScene({ model, onChooseDifferentModel }: PCBExplorationSceneProps) {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)

  const cameraPosition: [number, number, number] = [0, 0.015, -0.08]
  const cameraRotation: [number, number, number] = [0, -1.5, 0]
  const lightPosition: [number, number, number] = [6, 8, 4]
  const nearGroundSize = 220
  const farGroundSize = 520
  const ambientIntensity = model.ambientIntensity ?? 0.6
  const directionalIntensity = model.directionalIntensity ?? 1.3
  const helpText = 'First-person controls: W/A/S/D to move, R/F to move up/down, and use arrow keys to rotate view.'

  return (
    <div>
      <h1>PCB Explorer (3D)</h1>
      <p>Exploring: {model.label}</p>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <button type="button" onClick={onChooseDifferentModel}>
          Choose another PCB
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
          key={model.key}
          camera={{
            position: cameraPosition,
            fov: 55,
            rotation: cameraRotation,
            near: 0.01,
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
            url={model.url}
            rotation={model.rotation}
            onSelect={setSelectedComponent}
          />
          <KeyboardFirstPersonControls />
        </Canvas>
      </div>

      <div
        style={{
          marginTop: 12,
          padding: '8px 12px',
          border: '1px solid #8f7f68',
          borderRadius: 6,
          background: '#e4dac7',
        }}
      >
        <strong>Selected:</strong> {selectedComponent ?? 'None'}
      </div>
    </div>
  )
}

export default PCBExplorationScene