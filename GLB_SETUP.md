# Avatar System - GLB Configuration

## Current State
- ✅ **Primitives Avatar (AC-style)** - Currently active
  - 3D avatar made with Three.js primitives
  - Includes: blinking, eye movement, mouth vocalization
  - No external files needed

## To Use Your GLB Avatar

When you have `avatar.glb` file ready (Mixamo rig with 75 bones):

### Step 1: Copy the file
```bash
cp /home/sebastian/Descargas/avatar_1776746364480.glb public/models/avatar.glb
```

Ensure the directory exists:
```bash
mkdir -p public/models
```

### Step 2: Enable GLB in AvatarScene.tsx
Edit: `src/components/avatar/AvatarScene.tsx`

Change line ~40:
```typescript
const [useGLB] = useState(false) // Set to true when avatar.glb is ready
```

To:
```typescript
const [useGLB] = useState(true) // Enable GLB avatar
```

### Step 3: Build and verify
```bash
npm run build
```

## Features
- **Primitives Avatar**: Works immediately, no setup needed
- **GLB Avatar**: 
  - Auto-loads model with Mixamo rig
  - Auto-animates jaw for speaking
  - Supports isSpeaking prop for mouth animation
  - Fallback to primitives if GLB missing

## File Structure
```
public/
  models/
    avatar.glb         ← Drop your Mixamo GLB here

src/
  components/
    AvatarGLB.tsx      ← GLB loader with jaw animation
    avatar/
      AvatarScene.tsx  ← Main scene (primitives OR GLB)
      InterviewerAvatar.tsx  ← AC-style primitives avatar
```

## Notes
- GLB must have Mixamo rig (mixamorig* bones)
- Jaw bone must be named "jaw" or "lowerjaw"
- No animation files needed - jaw is controlled via rotation
- isSpeaking prop controls mouth opening
