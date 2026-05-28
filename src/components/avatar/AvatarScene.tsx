import { Suspense } from 'react'
import { Environment, Html } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { AvatarGLB, type AvatarState } from '../AvatarGLB'
import avatarBg from '../../assets/avatar-background.png'

export type AvatarSceneProps = {
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
        camera={{ position: [0, 1.0, 1.8], fov: 45, near: 0.1, far: 100 }}
        shadows
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 0.85, 0)
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
            position={[0, -0.4, 0]}
            avatarState={avatarState}
          />
        </Suspense>
      </Canvas>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/75 to-transparent px-4 py-3"
        aria-hidden
      >
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 shrink-0 rounded-full transition-colors ${
              isTalking
                ? 'bg-[#f0a766] shadow-[0_0_10px_rgba(240,167,102,0.85)]'
                : 'bg-[#4ade80] shadow-[0_0_6px_rgba(74,222,128,0.55)]'
            }`}
          />
          <span className="text-[0.88rem] font-semibold tracking-wide text-white">{interviewerName}</span>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-widest ${
            isTalking ? 'bg-[rgba(240,167,102,0.2)] text-[#f0a766]' : 'bg-white/10 text-white/55'
          }`}
        >
          {avatarState}
        </span>
      </div>
    </div>
  )
}

export default AvatarScene
