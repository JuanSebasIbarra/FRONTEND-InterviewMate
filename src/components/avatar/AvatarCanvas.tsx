import { Component, Suspense } from 'react'
import type { ReactNode, ErrorInfo } from 'react'
import { Canvas } from '@react-three/fiber'
import { AvatarScene } from './AvatarScene'
import type { AvatarSceneProps } from './AvatarScene'
import avatarBg from '../../assets/avatar-background.png'

// ─── ErrorBoundary específico del Canvas ─────────────────────────────────────

type ErrorBoundaryState = { hasError: boolean; error: Error | null }

class AvatarErrorBoundary extends Component<
  { children: ReactNode; onError?: (error: Error) => void },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode; onError?: (error: Error) => void }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error)
    // eslint-disable-next-line no-console
    console.error('[AvatarCanvas] Error en el canvas 3D:', error, info)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center text-center text-[#a8afc3]">
          <p className="text-[0.9rem] px-4">
            No se pudo cargar el avatar. Recarga la página para intentarlo de nuevo.
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

// ─── Fallback Skeleton ────────────────────────────────────────────────────────

function AvatarSkeleton() {
  return (
    <div className="flex h-full w-full animate-pulse items-center justify-center">
      <div className="h-3/4 w-1/2 rounded-2xl bg-white/8" />
    </div>
  )
}

// ─── AvatarCanvas ─────────────────────────────────────────────────────────────

export type AvatarCanvasProps = AvatarSceneProps & {
  interviewerName?: string
}

export function AvatarCanvas({
  avatarState = 'idle',
  interviewerName = 'Entrevistador IA',
  modelUrl = '/models/avatar_1776746364480.glb',
}: AvatarCanvasProps) {
  const isActive = avatarState === 'talking'

  return (
    <div
      className="relative h-full w-full"
      role="img"
      aria-label="Avatar del entrevistador"
      style={{
        backgroundImage: `url(${avatarBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <AvatarErrorBoundary>
        <Suspense fallback={<AvatarSkeleton />}>
          <Canvas
            camera={{ position: [0, 1.2, 2.8], fov: 45, near: 0.1, far: 100 }}
            shadows
            gl={{ alpha: true, antialias: true }}
            style={{ background: 'transparent' }}
            onCreated={({ camera }) => {
              camera.lookAt(0, 0.9, 0)
            }}
          >
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
            <pointLight position={[0, 1.8, 1.6]} intensity={0.8} color="#f7dcc7" />
            <pointLight position={[0, 2.1, -1.8]} intensity={0.52} color="#87a5d6" />

            <AvatarScene
              avatarState={avatarState}
              interviewerName={interviewerName}
              modelUrl={modelUrl}
            />
          </Canvas>
        </Suspense>
      </AvatarErrorBoundary>

      {/* Barra inferior con nombre e indicador de estado */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/65 to-transparent px-3.5 py-2.5"
        aria-hidden
      >
        <div className="flex items-center gap-2 text-[0.84rem]">
          <span
            className={`h-2 w-2 rounded-full transition-colors duration-300 ${
              isActive
                ? 'bg-[#f0a766] shadow-[0_0_10px_rgba(240,167,102,0.85)]'
                : 'bg-[#7c859e]'
            }`}
          />
          <span>{interviewerName}</span>
        </div>
        <span className="text-[0.72rem] uppercase tracking-[0.08em] text-[#c5ccdf]">
          {avatarState}
        </span>
      </div>
    </div>
  )
}

export default AvatarCanvas
