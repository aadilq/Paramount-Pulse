import { useEffect, useState } from "react"
import LiveFeed from "./LiveFeed"

const RELEASES = [
    "Mission: Impossible - The Final Reckoning",
    "Street Fighter",
    "Dutton Ranch",
    "Transformers One",
    "Top Gun Maverick",
    "Landman",
    "Gladiator II",
    "The Madison",
    "Roofman",
    "The Running Man",
]

const labelStyle = {
    display: 'block',
    fontSize: '12px',
    letterSpacing: '0.2em',
    color: '#6a7e9d',
    marginBottom: '8px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
}

function ReleaseFeed({ events, connected }) {
    const [release, setRelease] = useState(RELEASES[0])
    const [historicalEvents, setHistoricalEvents] = useState([])

    useEffect(() => {
        let cancelled = false
        const params = new URLSearchParams({ size: "100", release, gte: "now-7d" })

        fetch(`https://api.paramountpulse.fyi/events?${params}`)
            .then(res => res.json())
            .then(data => { if (!cancelled) setHistoricalEvents(data) })
            .catch(err => console.error("[EVENTS] Error:", err))

        return () => { cancelled = true }
    }, [release])

    const liveFiltered = events.filter(e => e.release === release)
    const seenIds = new Set(liveFiltered.map(e => e.id))
    const feedEvents = [
        ...liveFiltered,
        ...historicalEvents.filter(e => !seenIds.has(e.id)),
    ]

    return (
        <div style={{ width: '100%', maxWidth: '760px', marginTop: '64px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
                <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: connected ? '#4ade80' : '#f87171',
                    boxShadow: connected ? '0 0 8px #4ade80' : 'none',
                    flexShrink: 0,
                }} />
                <span style={{ fontSize: '11px', color: '#6a7e9d', letterSpacing: '0.15em' }}>
                    {connected ? 'LIVE' : 'DISCONNECTED'}
                </span>
            </div>

            <div style={{ marginBottom: '32px' }}>
                <label style={labelStyle}>// select release</label>
                <select value={release} onChange={e => setRelease(e.target.value)}>
                    {RELEASES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>

            <LiveFeed events={feedEvents} />
        </div>
    )
}

export default ReleaseFeed
