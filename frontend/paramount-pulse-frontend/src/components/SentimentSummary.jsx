import { useEffect, useState } from "react"

function SentimentSummary({ release }) {
    const [summary, setSummary] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setError(false)

        fetch(`https://api.paramountpulse.fyi/summary?release=${encodeURIComponent(release)}`)
            .then(res => {
                if (!res.ok) throw new Error("summary request failed")
                return res.json()
            })
            .then(data => {
                if (!cancelled) setSummary(data.summary)
            })
            .catch(() => {
                if (!cancelled) setError(true)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => { cancelled = true }
    }, [release])

    return (
        <div style={{ width: '100%', maxWidth: '760px' }}>
            <label style={{
                display: 'block',
                fontSize: '11px',
                letterSpacing: '0.2em',
                color: '#6a7e9d',
                marginBottom: '12px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
            }}>
                // what people are saying
            </label>

            {loading && (
                <p style={{ color: '#334155', fontSize: '13px' }}>_ generating summary...</p>
            )}

            {!loading && error && (
                <p style={{ color: '#f87171', fontSize: '13px' }}>_ couldn't load a summary right now.</p>
            )}

            {!loading && !error && (
                <p style={{
                    fontFamily: "'Titillium Web', sans-serif",
                    fontSize: '16px',
                    color: '#f1f5f9',
                    lineHeight: '1.7',
                }}>
                    {summary}
                </p>
            )}
        </div>
    )
}

export default SentimentSummary
