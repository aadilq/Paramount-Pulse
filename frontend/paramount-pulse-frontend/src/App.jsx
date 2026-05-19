import { useWebSocket } from "./hooks/useWebSocket";

function App(){
  const {events, connected} = useWebSocket('ws://localhost:8000/ws')

  return(
    <div>
      <p>Status: {connected ? 'Connected': 'Disconnected'}</p>
      <ul>
        {events.map((e, i) => (
          <li key={i}>
            [{e.sentiment}] {e.source} | {e.release} | {e.title?.slice(0, 60)}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App