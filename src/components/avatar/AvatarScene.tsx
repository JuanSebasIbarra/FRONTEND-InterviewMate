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
  const isTalking = avatarState === 'talking'

  return (
    <div
      className="relative h-full w-full"
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
              <div className="rounded-full border border-white/25 bg-[#0a101fb8] px-3 py-2 text-[0.82rem] text-[#d9dff2]">
                Cargando avatar...
              </div>
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

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/65 to-transparent px-3.5 py-2.5"
        aria-hidden
      >
        <div className="flex items-center gap-2 text-[0.84rem]">
          <span
            className={`h-2 w-2 rounded-full ${
              isTalking
                ? 'bg-[#f0a766] shadow-[0_0_10px_rgba(240,167,102,0.85)]'
                : 'bg-[#7c859e]'
            }`}
          />
          <span>{interviewerName}</span>
        </div>
        <span className="text-[0.72rem] uppercase tracking-[0.08em] text-[#c5ccdf]">{avatarState}</span>
      </div>
    </div>
  )
}

export default AvatarScene
