import { Suspense } from 'react'
import { Environment, Html } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { AvatarGLB, type AvatarState } from '../AvatarGLB'
import avatarBg from '../../assets/avatar-background.png'

type AvatarSceneProps = {
  avatarState?: AvatarState
  interviewerName?: string
  modelUrl?: string
}

export function AvatarScene({
  avatarState = 'idle',
  interviewerName = 'Entrevistador IA',
  modelUrl = '/models/avatar_1776746364480.glb',
}: AvatarSceneProps) {
  return (
    <div
      className="avatar-stage-frame"
      style={{
        backgroundImage: `url(${avatarBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Canvas
        camera={{ position: [0, 1.6, 2.2], fov: 40, near: 0.1, far: 100 }}
        shadows
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 1.4, 0)
        }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
        <pointLight position={[0, 1.8, 1.6]} intensity={0.8} color="#f7dcc7" />
        <pointLight position={[0, 2.1, -1.8]} intensity={0.52} color="#87a5d6" />

        <Suspense
          fallback={(
            <Html center>
              <div className="avatar-loading">Cargando avatar...</div>
            </Html>
          )}
        >
          <Environment preset="studio" />

          <AvatarGLB
            url={modelUrl}
            scale={1}
            position={[0, -0.8, 0]}
            avatarState={avatarState}
          />
        </Suspense>
      </Canvas>

      <div className="avatar-stage-label" aria-hidden>
        <div className="avatar-label-left">
          <span
            className={`avatar-status-dot ${
              avatarState === 'talking' ? 'avatar-status-dot-active' : ''
            }`}
          />
          <span>{interviewerName}</span>
        </div>
        <span className="avatar-state-badge">{avatarState}</span>
      </div>
    </div>
  )
}

export default AvatarScene
