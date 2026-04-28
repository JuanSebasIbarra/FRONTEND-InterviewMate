import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'

// ── Animation constants ────────────────────────────────────────────────────
const BLINK_CLOSE_SPEED = 20
const BLINK_OPEN_SPEED  = 12
const EYE_OPEN_SCALE_Y  = 1.0
const EYE_LERP          = 0.045
const MOUTH_OPEN_SPEED  = 2.2
const MOUTH_CLOSE_SPEED = 1.8
const MAX_MOUTH_OPEN    = 0.65

type BlinkState = 'open' | 'closing' | 'opening'

type AvatarProps = {
  skinColor?:  string
  clothColor?: string
  hairColor?:  string
  isSpeaking?: boolean
  animateJaw?: (setJawAngle: (angle: number) => void) => void
}

/**
 * Animal Crossing–style 3D avatar closely matching the reference image:
 * large round head, flat-top orange bowl-cut hair, big teal eyes with lashes,
 * coral triangular nose, rosy cheeks, small smile, gray jacket.
 */
export function InterviewerAvatar({
  skinColor  = '#F5DCCA',
  clothColor = '#7A7A7A',
  hairColor  = '#F0A030',
  isSpeaking = false,
}: AvatarProps) {
  const rootRef       = useRef<Group>(null)
  const eyeLGroupRef  = useRef<Group>(null)
  const eyeRGroupRef  = useRef<Group>(null)
  const irisLGroupRef = useRef<Group>(null)
  const irisRGroupRef = useRef<Group>(null)
  const mouthOpenRef  = useRef<Mesh>(null)

  // Blink state
  const blinkProgress  = useRef(0)
  const blinkState     = useRef<BlinkState>('open')
  const blinkTimer     = useRef(0)
  const nextBlinkDelay = useRef(3 + Math.random() * 3)

  // Eye saccade
  const eyeTarget   = useRef({ x: 0, y: 0 })
  const eyeCurrent  = useRef({ x: 0, y: 0 })
  const eyeTimer    = useRef(0)
  const nextEyeMove = useRef(2 + Math.random() * 2)

  // Mouth
  const mouthScaleY  = useRef(0)
  const mouthOpening = useRef(true)

  const speakingRef = useRef(isSpeaking)
  speakingRef.current = isSpeaking

  useFrame((state, delta) => {
    const t  = state.clock.elapsedTime
    const dt = Math.min(delta, 0.05)

    // 1. Idle float
    if (rootRef.current) {
      rootRef.current.position.y = Math.sin(t * 0.85) * 0.018
      rootRef.current.rotation.y = Math.sin(t * 0.38) * 0.018
    }

    // 2. Blink
    blinkTimer.current += dt
    if (blinkState.current === 'open' && blinkTimer.current >= nextBlinkDelay.current) {
      blinkState.current = 'closing'
    }
    if (blinkState.current === 'closing') {
      blinkProgress.current = Math.min(blinkProgress.current + dt * BLINK_CLOSE_SPEED, 1)
      if (blinkProgress.current >= 1) blinkState.current = 'opening'
    }
    if (blinkState.current === 'opening') {
      blinkProgress.current = Math.max(blinkProgress.current - dt * BLINK_OPEN_SPEED, 0)
      if (blinkProgress.current <= 0) {
        blinkState.current     = 'open'
        blinkTimer.current     = 0
        nextBlinkDelay.current = 2.5 + Math.random() * 3.5
      }
    }
    const eyelidSY = EYE_OPEN_SCALE_Y * (1 - blinkProgress.current * 0.96)
    if (eyeLGroupRef.current) eyeLGroupRef.current.scale.y = eyelidSY
    if (eyeRGroupRef.current) eyeRGroupRef.current.scale.y = eyelidSY

    // 3. Eye movement
    eyeTimer.current += dt
    if (eyeTimer.current >= nextEyeMove.current) {
      eyeTarget.current.x = (Math.random() - 0.5) * 0.06
      eyeTarget.current.y = (Math.random() - 0.5) * 0.03
      eyeTimer.current    = 0
      nextEyeMove.current = 1.5 + Math.random() * 2.8
    }
    eyeCurrent.current.x += (eyeTarget.current.x - eyeCurrent.current.x) * EYE_LERP
    eyeCurrent.current.y += (eyeTarget.current.y - eyeCurrent.current.y) * EYE_LERP
    if (irisLGroupRef.current) {
      irisLGroupRef.current.position.x = eyeCurrent.current.x
      irisLGroupRef.current.position.y = eyeCurrent.current.y
    }
    if (irisRGroupRef.current) {
      irisRGroupRef.current.position.x = eyeCurrent.current.x
      irisRGroupRef.current.position.y = eyeCurrent.current.y
    }

    // 4. Mouth / vocalization
    if (speakingRef.current) {
      if (mouthOpening.current) {
        mouthScaleY.current = Math.min(mouthScaleY.current + dt * MOUTH_OPEN_SPEED, MAX_MOUTH_OPEN)
        if (mouthScaleY.current >= MAX_MOUTH_OPEN) mouthOpening.current = false
      } else {
        mouthScaleY.current = Math.max(mouthScaleY.current - dt * MOUTH_CLOSE_SPEED, 0)
        if (mouthScaleY.current <= 0) mouthOpening.current = true
      }
    } else {
      mouthScaleY.current = Math.max(mouthScaleY.current - dt * MOUTH_CLOSE_SPEED, 0)
    }
    if (mouthOpenRef.current) {
      mouthOpenRef.current.scale.y = mouthScaleY.current
    }
  })

  // Derived hair color (slightly darker for side/back pieces)
  const hairDark = '#D8881C'

  return (
    <group ref={rootRef}>

      {/* ═══════════════════════════════════════════════════════════════
          JACKET / BODY
      ═══════════════════════════════════════════════════════════════ */}

      {/* Main jacket torso */}
      <mesh position={[0, -1.05, 0]}>
        <boxGeometry args={[0.72, 0.46, 0.32]} />
        <meshStandardMaterial color={clothColor} roughness={0.85} />
      </mesh>

      {/* Left shoulder sphere */}
      <mesh position={[-0.38, -0.90, 0]}>
        <sphereGeometry args={[0.148, 14, 14]} />
        <meshStandardMaterial color={clothColor} roughness={0.85} />
      </mesh>
      {/* Right shoulder sphere */}
      <mesh position={[0.38, -0.90, 0]}>
        <sphereGeometry args={[0.148, 14, 14]} />
        <meshStandardMaterial color={clothColor} roughness={0.85} />
      </mesh>

      {/* White shirt collar / undershirt visible strip */}
      <mesh position={[0, -0.87, 0.158]}>
        <boxGeometry args={[0.22, 0.28, 0.02]} />
        <meshStandardMaterial color="#f2f0ec" roughness={0.9} />
      </mesh>

      {/* Left jacket lapel */}
      <mesh position={[-0.10, -0.875, 0.156]} rotation={[0, 0, 0.32]}>
        <boxGeometry args={[0.12, 0.26, 0.022]} />
        <meshStandardMaterial color={clothColor} roughness={0.85} />
      </mesh>
      {/* Right jacket lapel */}
      <mesh position={[0.10, -0.875, 0.156]} rotation={[0, 0, -0.32]}>
        <boxGeometry args={[0.12, 0.26, 0.022]} />
        <meshStandardMaterial color={clothColor} roughness={0.85} />
      </mesh>

      {/* ═══════════════════════════════════════════════════════════════
          NECK
      ═══════════════════════════════════════════════════════════════ */}
      <mesh position={[0, -0.57, 0]}>
        <cylinderGeometry args={[0.108, 0.128, 0.22, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.65} />
      </mesh>

      {/* ═══════════════════════════════════════════════════════════════
          HEAD — large, slightly wide, slightly flat (AC style)
      ═══════════════════════════════════════════════════════════════ */}
      <mesh scale={[1.08, 1.0, 0.94]}>
        <sphereGeometry args={[0.53, 32, 32]} />
        <meshStandardMaterial color={skinColor} roughness={0.55} />
      </mesh>

      {/* Ears — small, flush with head sides */}
      <mesh position={[-0.545, 0.02, 0.02]}>
        <sphereGeometry args={[0.098, 14, 14]} />
        <meshStandardMaterial color={skinColor} roughness={0.60} />
      </mesh>
      <mesh position={[0.545, 0.02, 0.02]}>
        <sphereGeometry args={[0.098, 14, 14]} />
        <meshStandardMaterial color={skinColor} roughness={0.60} />
      </mesh>

      {/* ═══════════════════════════════════════════════════════════════
          HAIR — flat-top "bowl cut" in orange/golden
          Reference: flat cap on top, rounded sides, small front tuft
      ═══════════════════════════════════════════════════════════════ */}

      {/* Main bowl — flattened sphere, sits on top of head */}
      <mesh position={[0, 0.32, -0.02]} scale={[1.12, 0.52, 1.05]}>
        <sphereGeometry args={[0.555, 26, 26]} />
        <meshStandardMaterial color={hairColor} roughness={0.82} />
      </mesh>

      {/* Flat top cap — fills in the flat surface */}
      <mesh position={[0, 0.52, -0.02]} scale={[1.0, 1.0, 0.92]}>
        <cylinderGeometry args={[0.415, 0.435, 0.08, 24]} />
        <meshStandardMaterial color={hairColor} roughness={0.82} />
      </mesh>

      {/* Front fringe / side volume — left */}
      <mesh position={[-0.30, 0.20, 0.16]} scale={[0.56, 0.48, 0.70]}>
        <sphereGeometry args={[0.30, 14, 14]} />
        <meshStandardMaterial color={hairDark} roughness={0.88} />
      </mesh>
      {/* Front fringe / side volume — right */}
      <mesh position={[0.30, 0.20, 0.16]} scale={[0.56, 0.48, 0.70]}>
        <sphereGeometry args={[0.30, 14, 14]} />
        <meshStandardMaterial color={hairDark} roughness={0.88} />
      </mesh>

      {/* Nape / back volume */}
      <mesh position={[0, 0.08, -0.42]} scale={[0.88, 0.60, 0.55]}>
        <sphereGeometry args={[0.40, 16, 16]} />
        <meshStandardMaterial color={hairColor} roughness={0.84} />
      </mesh>

      {/* ═══════════════════════════════════════════════════════════════
          EYES — large teal with dark outline, oval shape
          AC style: outline circle > sclera > teal iris > dark pupil > highlights
          The eye GROUP is scaled in Y for the oval shape and blink animation
      ═══════════════════════════════════════════════════════════════ */}

      {/* LEFT EYE */}
      <group ref={eyeLGroupRef} position={[-0.205, 0.06, 0.462]} scale={[1, 1.45, 1]}>
        {/* Outer dark border */}
        <mesh position={[0, 0, -0.003]}>
          <circleGeometry args={[0.128, 26]} />
          <meshBasicMaterial color="#1a1014" />
        </mesh>
        {/* Sclera (white) */}
        <mesh>
          <circleGeometry args={[0.118, 26]} />
          <meshBasicMaterial color="#f6f4ef" />
        </mesh>
        {/* Iris + pupil + specular highlights — move together for saccade */}
        <group ref={irisLGroupRef}>
          {/* Teal iris */}
          <mesh position={[0, 0, 0.001]}>
            <circleGeometry args={[0.090, 24]} />
            <meshBasicMaterial color="#3DBCB0" />
          </mesh>
          {/* Pupil */}
          <mesh position={[0, 0, 0.002]}>
            <circleGeometry args={[0.042, 18]} />
            <meshBasicMaterial color="#14101a" />
          </mesh>
          {/* Main specular */}
          <mesh position={[-0.030, 0.035, 0.003]}>
            <circleGeometry args={[0.024, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* Secondary specular */}
          <mesh position={[0.026, -0.018, 0.003]}>
            <circleGeometry args={[0.012, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.60} />
          </mesh>
        </group>

        {/* Eyelash — thin dark strip along top of eye */}
        <mesh position={[0, 0.096, 0.002]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.250, 0.026, 0.004]} />
          <meshBasicMaterial color="#1a1014" />
        </mesh>
        {/* Outer corner lash flick */}
        <mesh position={[-0.095, 0.078, 0.002]} rotation={[0, 0, -0.55]}>
          <boxGeometry args={[0.062, 0.018, 0.004]} />
          <meshBasicMaterial color="#1a1014" />
        </mesh>
      </group>

      {/* RIGHT EYE */}
      <group ref={eyeRGroupRef} position={[0.205, 0.06, 0.462]} scale={[1, 1.45, 1]}>
        <mesh position={[0, 0, -0.003]}>
          <circleGeometry args={[0.128, 26]} />
          <meshBasicMaterial color="#1a1014" />
        </mesh>
        <mesh>
          <circleGeometry args={[0.118, 26]} />
          <meshBasicMaterial color="#f6f4ef" />
        </mesh>
        <group ref={irisRGroupRef}>
          <mesh position={[0, 0, 0.001]}>
            <circleGeometry args={[0.090, 24]} />
            <meshBasicMaterial color="#3DBCB0" />
          </mesh>
          <mesh position={[0, 0, 0.002]}>
            <circleGeometry args={[0.042, 18]} />
            <meshBasicMaterial color="#14101a" />
          </mesh>
          <mesh position={[-0.030, 0.035, 0.003]}>
            <circleGeometry args={[0.024, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.026, -0.018, 0.003]}>
            <circleGeometry args={[0.012, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.60} />
          </mesh>
        </group>
        {/* Eyelash */}
        <mesh position={[0, 0.096, 0.002]}>
          <boxGeometry args={[0.250, 0.026, 0.004]} />
          <meshBasicMaterial color="#1a1014" />
        </mesh>
        {/* Outer corner lash flick */}
        <mesh position={[0.095, 0.078, 0.002]} rotation={[0, 0, 0.55]}>
          <boxGeometry args={[0.062, 0.018, 0.004]} />
          <meshBasicMaterial color="#1a1014" />
        </mesh>
      </group>

      {/* ═══════════════════════════════════════════════════════════════
          NOSE — triangular coral pyramid, pointing toward camera
          Rotated so the flat base faces forward (AC-style)
      ═══════════════════════════════════════════════════════════════ */}
      <mesh position={[0, -0.065, 0.476]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, 1]}>
        <coneGeometry args={[0.048, 0.110, 3]} />
        <meshStandardMaterial color="#E8705A" roughness={0.65} />
      </mesh>

      {/* ═══════════════════════════════════════════════════════════════
          CHEEKS — soft rosy blush
      ═══════════════════════════════════════════════════════════════ */}
      <mesh position={[-0.265, -0.032, 0.425]} scale={[1.35, 0.68, 0.25]}>
        <sphereGeometry args={[0.095, 14, 14]} />
        <meshStandardMaterial color="#F4A090" roughness={1} transparent opacity={0.40} />
      </mesh>
      <mesh position={[0.265, -0.032, 0.425]} scale={[1.35, 0.68, 0.25]}>
        <sphereGeometry args={[0.095, 14, 14]} />
        <meshStandardMaterial color="#F4A090" roughness={1} transparent opacity={0.40} />
      </mesh>

      {/* ═══════════════════════════════════════════════════════════════
          MOUTH — small clean smile arc
      ═══════════════════════════════════════════════════════════════ */}
      {/* Smile arc — torus rotated π = upward curve */}
      <mesh position={[0, -0.240, 0.442]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.060, 0.011, 8, 24, Math.PI]} />
        <meshBasicMaterial color="#25140e" />
      </mesh>

      {/* Mouth opening disk (animates on speaking) */}
      <mesh ref={mouthOpenRef} position={[0, -0.240, 0.444]} scale={[1, 0, 1]}>
        <circleGeometry args={[0.058, 16]} />
        <meshBasicMaterial color="#1e0808" />
      </mesh>

      {/* Lower lip hint */}
      <mesh position={[0, -0.302, 0.438]}>
        <torusGeometry args={[0.034, 0.008, 8, 16, Math.PI]} />
        <meshBasicMaterial color={skinColor} />
      </mesh>

    </group>
  )
}

export default InterviewerAvatar