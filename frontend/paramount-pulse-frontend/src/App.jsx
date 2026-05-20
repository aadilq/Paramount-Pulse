import { useWebSocket } from "./hooks/useWebSocket"
import Dashboard from "./components/Dashboard"

function App() {
  const { events, connected } = useWebSocket('ws://localhost:8000/ws')

  return (
    <div>
      <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>
      <Dashboard events={events} />
    </div>
  )
}

export default App