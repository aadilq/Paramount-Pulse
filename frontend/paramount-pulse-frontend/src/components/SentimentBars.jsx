import { useEffect, useState } from "react"

const LABELS = ["POSITIVE", "NEUTRAL", "NEGATIVE"]
const COLORS = {
    POSITIVE: '#4ade80',
    NEUTRAL:  '#94a3b8',
    NEGATIVE: '#f87171',
}
const BAR_CHARS = 24

function AsciiBar({ pct, color }) {
    const filled = Math.round((pct / 100) * BAR_CHARS)
    const empty = BAR_CHARS - filled
    return (
        <span>
            <span style={{ color }}>{'█'.repeat(filled)}</span>
            <span style={{ color: '#1e2d4a' }}>{'░'.repeat(empty)}</span>
        </span>
    )
}

function SentimentBars({ release, source, gte }) {
    const [counts, setCounts] = useState(null)

    useEffect(() => {
        let cancelled = false
        const params = new URLSearchParams()
        if (release) params.set("release", release)
        if (source) params.set("source", source)
        if (gte) params.set("gte", gte)

        fetch(`https://api.paramountpulse.fyi/events/aggregates?${params}`)
            .then(res => res.json())
            .then(data => { if (!cancelled) setCounts(data) })
            .catch(err => console.error("[AGGREGATES] Error:", err))

        return () => { cancelled = true }
    }, [release, source, gte])

    if (counts === null) return (
        <p style={{ color: '#334155', fontSize: '13px' }}>_ fetching sentiment data...</p>
    )

    const total = Object.values(counts).reduce((sum, n) => sum + n, 0)

    return (
        <div style={{ fontFamily: "'Space Mono', monospace" }}>
            {LABELS.map(label => {
                const count = counts[label] || 0
                const pct = total > 0 ? Math.round((count / total) * 100) : 0
                const color = COLORS[label]
                return (
                    <div key={label} style={{ marginBottom: '20px', fontSize: '13px', color: '#64748b' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <span style={{ color, width: '76px', flexShrink: 0 }}>{label}</span>
                            <span>[<AsciiBar pct={pct} color={color} />]</span>
                            <span style={{ color: '#64748b', width: '36px', textAlign: 'right' }}>{pct}%</span>
                            <span style={{ color: '#64748b' }}>({count})</span>
                        </div>
                    </div>
                )
            })}
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>
                total: {total} events
            </p>
        </div>
    )
}

export default SentimentBars
