import { useEffect, useState } from "react"

const LABELS = ["POSITIVE", "NEUTRAL", "NEGATIVE"]

function SentimentBars({ release, source, gte }) {
    const [counts, setCounts] = useState({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const params = new URLSearchParams()
        if (release) params.set("release", release)
        if (source) params.set("source", source)
        if (gte) params.set("gte", gte)

        fetch(`http://localhost:8000/events/aggregates?${params}`)
            .then(res => res.json())
            .then(data => {
                setCounts(data)
                setLoading(false)
            })
            .catch(err => console.error("[AGGREGATES] Error:", err))
    }, [release, source, gte])

    if (loading) return <p>Loading sentiment...</p>

    const total = Object.values(counts).reduce((sum, n) => sum + n, 0)

    return (
        <div>
            {LABELS.map(label => {
                const count = counts[label] || 0
                const pct = total > 0 ? Math.round((count / total) * 100) : 0
                return (
                    <div key={label} style={{ marginBottom: "12px" }}>
                        <span>{label} {pct}% ({count})</span>
                        <div style={{ background: "#ddd", height: "12px", width: "100%", marginTop: "4px" }}>
                            <div style={{ background: "#333", height: "100%", width: `${pct}%` }} />
                        </div>
                    </div>
                )
            })}
            <p style={{ fontSize: "12px" }}>Total: {total} events</p>
        </div>
    )
}

export default SentimentBars
