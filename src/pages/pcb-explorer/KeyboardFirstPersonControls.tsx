import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Raycaster, Vector3 } from 'three'
import type { Mesh } from 'three'

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
  }, [camera])

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

export default KeyboardFirstPersonControls