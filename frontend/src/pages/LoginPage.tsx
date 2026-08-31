import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
} from 'lucide-react'
import hero from '../assets/images/login-hero-placeholder.svg'
import { Brand } from '../components/ui/Brand'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Spinner } from '../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'
import { demoProfiles } from '../config/demoProfiles'
import { brand } from '../config/brand'

export function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  if (isAuthenticated) return <Navigate to="/chat" replace />
  if (isLoading)
    return (
      <div className="full-loading">
        <Brand />
        <Spinner label="Verificando sessão" />
      </div>
    )
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError('Preencha seu usuário e sua senha para continuar.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await login({ username: username.trim(), password })
      setPassword('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível entrar.')
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <main className="login-page">
      <section className="login-hero" aria-label={`Bem-vindo à ${brand.displayName}`}>
        <div className="hero-top">
          <Brand />
        </div>
        <div className="hero-copy">
          <h1>
            O próximo nível
            <br />
            das suas compras
            <br />
            <span>começa aqui.</span>
          </h1>
          <p>
            Feito por Álvaro Kayc e Kauan Pedreira
            <br className="desktop-break" /> Projeto Compass UOL
          </p>
        </div>
        <img
          className="hero-art"
          src={hero}
          alt="Arte original de um controle gamer preto, com detalhes laranja e órbitas geométricas"
        />
        <div className="hero-art-label">
          <span className="tiny-cross">+</span>
          <span>
            FEITO PARA VOCÊ
            <br />
            <strong>FELLOWSHIP</strong>
          </span>
          <span className="art-line" />
        </div>
        <div className="hero-corner" aria-hidden="true" />
      </section>
      <section className="login-side">
        <div className="login-content animate-in">
          <div className="login-heading">
            <span className="eyebrow">BEM-VINDO À {brand.name}</span>
            <h2>
              Entre no jogo<span>.</span>
            </h2>
            <p>Catálogo inteligente de periféricos e pagamentos instantâneos com aprovação em tempo real.</p>
          </div>
          <form onSubmit={submit} noValidate aria-busy={submitting}>
            <Input
              id="username"
              label="Usuário"
              icon={<UserRound size={17} />}
              placeholder="Seu nome de usuário"
              autoComplete="username"
              value={username}
              disabled={submitting}
              onChange={(e) => setUsername(e.target.value)}
              aria-invalid={!!error}
              aria-describedby={error ? 'login-error' : undefined}
            />
            <Input
              id="password"
              label="Senha"
              icon={<LockKeyhole size={17} />}
              placeholder="Sua senha"
              type={visible ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              disabled={submitting}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!error}
              aria-describedby={error ? 'login-error' : undefined}
              suffix={
                <button
                  className="icon-button"
                  type="button"
                  aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
                  aria-pressed={visible}
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              }
            />
            {error && (
              <p id="login-error" className="inline-error" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" className="login-submit" loading={submitting}>
              {submitting ? 'ENTRANDO...' : `ENTRAR NA ${brand.name}`}
              {!submitting && <ArrowRight size={19} />}
            </Button>
          </form>
          <div className="demo-divider">
            <span />
            EXPLORE A EXPERIÊNCIA
            <span />
          </div>
          <div className="demo-heading">
            <h3>Perfis rápidos para demonstração</h3>
            <span>
              Selecione para preencher <ChevronRight size={12} />
            </span>
          </div>
          <div className="demo-profiles">
            {demoProfiles.map((profile) => (
              <button
                className={`demo-profile ${username === profile.username ? 'selected' : ''}`}
                type="button"
                key={profile.username}
                disabled={submitting}
                onClick={() => {
                  setUsername(profile.username)
                  setPassword(profile.password)
                  setError('')
                }}
                aria-label={`Usar perfil ${profile.name}`}
              >
                <span className={`demo-avatar ${profile.label === 'VIP' ? 'vip' : ''}`}>
                  {profile.name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')}
                </span>
                <span className="demo-profile-info">
                  <strong>{profile.name}</strong>
                  <span>{profile.label}</span>
                </span>
                <span className="demo-profile-limit">
                  R$ {profile.limit.toLocaleString('pt-BR')}
                  {username === profile.username ? <Check size={14} /> : <ArrowUpRight size={14} />}
                </span>
              </button>
            ))}
          </div>
        </div>
        <footer className="login-footer">
          <span>
            © {new Date().getFullYear()} {brand.name} {brand.suffix}
          </span>
        </footer>
      </section>
    </main>
  )
}
