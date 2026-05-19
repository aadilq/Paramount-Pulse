import { useWebSocket } from "./hooks/useWebSocket"
import LiveFeed from "./components/LiveFeed"

function App() {
  const { events, connected } = useWebSocket('ws://localhost:8000/ws')

  return (
    <div>
      <p>Status: {connected ? 'Connected' : 'Disconnected'}</p>
      <LiveFeed events={events} />
    </div>
  )
}

export default App