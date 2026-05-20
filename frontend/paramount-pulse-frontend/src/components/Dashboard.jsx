import { useState } from "react"
import SentimentBars from "./SentimentBars"
import LiveFeed from "./LiveFeed"

const RELEASES = [
    "Mission: Impossible - The Final Reckoning",
    "Sonic the Hedgehog",
    "Transformers One",
    "Top Gun Maverick",
]

const SOURCES = [
    { label: "All", value: "" },
    { label: "Reddit", value: "reddit" },
    { label: "YouTube", value: "youtube" },
]

const DATE_RANGES = [
    { label: "Last 24 hours", value: "now-24h" },
    { label: "Last 7 days", value: "now-7d" },
    { label: "Last 30 days", value: "now-30d" },
]

function Dashboard({ events }) {
    const [release, setRelease] = useState(RELEASES[0])
    const [source, setSource] = useState("")
    const [gte, setGte] = useState("now-7d")

    const filteredEvents = events.filter(e => {
        if (e.release !== release) return false
        if (source && e.source !== source) return false
        return true
    })

    return (
        <div>
            <div>
                <label>Release: </label>
                <select value={release} onChange={e => setRelease(e.target.value)}>
                    {RELEASES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>

            <div>
                <label>Source: </label>
                <select value={source} onChange={e => setSource(e.target.value)}>
                    {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>

                <label style={{ marginLeft: "16px" }}>Date: </label>
                <select value={gte} onChange={e => setGte(e.target.value)}>
                    {DATE_RANGES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
            </div>

            <SentimentBars release={release} source={source} gte={gte} />
            <LiveFeed events={filteredEvents} />
        </div>
    )
}

export default Dashboard
