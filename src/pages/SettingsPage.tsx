import { useEffect, useState } from 'react'
import { loadProfileData, saveProfileData } from '../controllers/settingsController'

function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [perfilProfesional, setPerfilProfesional] = useState('')

  useEffect(() => {
    void hydrate()
  }, [])

  const hydrate = async () => {
    setLoading(true)
    setError('')
    try {
      const profile = await loadProfileData()
      setUsername(profile.username)
      setEmail(profile.email)
      setPerfilProfesional(profile.perfilProfesional ?? '')
    } catch (loadError) {
      setError((loadError as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const onSave = async () => {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const profile = await saveProfileData(perfilProfesional)
      setPerfilProfesional(profile.perfilProfesional ?? '')
      setSuccess('Perfil actualizado correctamente.')
    } catch (saveError) {
      setError((saveError as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="settings-page card">
      <h2>Ajustes de usuario</h2>
      <p>Administra la información de tu perfil profesional.</p>

      {error && <p className="alert error">{error}</p>}
      {success && <p className="alert success">{success}</p>}

      {loading ? (
        <p>Cargando perfil...</p>
      ) : (
        <div className="stack">
          <label>
            Usuario
            <input value={username} disabled />
          </label>

          <label>
            Email
            <input value={email} disabled />
          </label>

          <label>
            Perfil profesional
            <textarea
              rows={8}
              value={perfilProfesional}
              onChange={(event) => setPerfilProfesional(event.target.value)}
              placeholder="Describe tu experiencia, stack y objetivos profesionales"
            />
          </label>

          <button type="button" onClick={onSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      )}
    </section>
  )
}

export default SettingsPage
