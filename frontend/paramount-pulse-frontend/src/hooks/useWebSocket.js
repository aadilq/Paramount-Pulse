import { useEffect, useRef, useState } from "react";

export function useWebSocket(url){
    const [events, setEvents] = useState([])
    const [connected, setConnected] = useState(false)
    const socketRef = useRef(null)

    useEffect(() => {
        const socket  = new WebSocket(url)
        socketRef.current = socket

        socket.onopen = () => {
            console.log('[WS] Connected')
            setConnected(true)

        }

        socket.onmessage = (e) =>{
            const event = JSON.parse(e.data)
            console.log('[WS] Event recieved:', event)
            setEvents(prev => [event, ...prev].slice(0, 100))
        }

        socket.onclose = () => {
            console.log('[WS] Disconnected')
            setConnected(false)
        }

        socket.onerror = (err) =>{
            console.error('[WS] Error:', err)
        }

        return () => socket.close()
    }, [url])

    return {events, connected}
}