import { useWebSocket } from "./hooks/useWebSocket"
import Dashboard from "./components/Dashboard"

function App() {
  const { events, connected } = useWebSocket('ws://localhost:8000/ws')

  return (
    <div style={{ background: '#1A1F37', minHeight: '100vh' }}>
      <section style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        textAlign: 'center',
        borderBottom: '1px solid #1e2d4a',
      }}>
        <h1 style={{
          fontFamily: "'Abel', sans-serif",
          fontSize: 'clamp(42px, 8vw, 96px)',
          letterSpacing: '0.25em',
          color: '#f1f5f9',
          textTransform: 'uppercase',
          marginBottom: '32px',
        }}>
          Paramount Pulse
        </h1>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '13px',
          color: '#6a7e9d',
          maxWidth: '520px',
          lineHeight: '2',
          marginBottom: '72px',
        }}>
          Select a Paramount release and see what the collective<br />
          reviews have been so far on platforms such as Reddit and YouTube.
        </p>
        <p style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: '12px',
          color: '#f1f5f9',
          letterSpacing: '0.15em',
        }}>
          scroll to explore
        </p>
        <p style={{
          fontWeight: 'bold',
          fontFamily: "'Space Mono', monospace",
          fontSize: '12px',
          color: '#f1f5f9',
          marginTop: '8px',
        }}>
          |
        </p>
      </section>

      <section style={{ maxWidth: '860px', margin: '0 auto', padding: '80px 24px 120px' }}>
        <Dashboard events={events} connected={connected} />
      </section>
    </div>
  )
}

export default App