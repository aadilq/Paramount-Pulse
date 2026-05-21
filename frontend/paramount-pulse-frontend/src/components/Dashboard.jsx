import { useState, useEffect } from "react"
import SentimentBars from "./SentimentBars"
import LiveFeed from "./LiveFeed"

const RELEASES = [
    "Mission: Impossible - The Final Reckoning",
    "Sonic the Hedgehog",
    "Transformers One",
    "Top Gun Maverick",
]

const SOURCES = [
    { label: "All Sources", value: "" },
    { label: "Reddit", value: "reddit" },
    { label: "YouTube", value: "youtube" },
]

const DATE_RANGES = [
    { label: "Last 24 hours", value: "now-24h" },
    { label: "Last 7 days", value: "now-7d" },
    { label: "Last 30 days", value: "now-30d" },
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

const sectionHeader = {
    fontSize: '12px',
    letterSpacing: '0.2em',
    color: '#38bdf8',
    marginBottom: '24px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
}

function Dashboard({ events, connected }) {
    const [release, setRelease] = useState(RELEASES[0])
    const [source, setSource] = useState("")
    const [gte, setGte] = useState("now-7d")
    const [historicalEvents, setHistoricalEvents] = useState([])

    useEffect(() => {
        let cancelled = false
        const params = new URLSearchParams({ size: "100" })
        if (release) params.set("release", release)
        if (source) params.set("source", source)
        if (gte) params.set("gte", gte)

        fetch(`http://localhost:8000/events?${params}`)
            .then(res => res.json())
            .then(data => { if (!cancelled) setHistoricalEvents(data) })
            .catch(err => console.error("[EVENTS] Error:", err))

        return () => { cancelled = true }
    }, [release, source, gte])

    const liveFiltered = events.filter(e => {
        if (e.release !== release) return false
        if (source && e.source !== source) return false
        return true
    })

    const seenIds = new Set(liveFiltered.map(e => e.id))
    const feedEvents = [
        ...liveFiltered,
        ...historicalEvents.filter(e => !seenIds.has(e.id)),
    ]

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '48px' }}>
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

            <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>// select release</label>
                <select value={release} onChange={e => setRelease(e.target.value)}>
                    {RELEASES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '64px' }}>
                <div>
                    <label style={labelStyle}>// source</label>
                    <select value={source} onChange={e => setSource(e.target.value)}>
                        {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </div>
                <div>
                    <label style={labelStyle}>// date range</label>
                    <select value={gte} onChange={e => setGte(e.target.value)}>
                        {DATE_RANGES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ marginBottom: '64px' }}>
                <p style={sectionHeader}>// sentiment breakdown</p>
                <SentimentBars release={release} source={source} gte={gte} />
            </div>

            <div>
                <p style={sectionHeader}>// live feed</p>
                <LiveFeed events={feedEvents} />
            </div>
        </div>
    )
}

export default Dashboard
