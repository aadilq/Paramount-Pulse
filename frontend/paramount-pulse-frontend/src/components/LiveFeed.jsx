const COLORS = {
    POSITIVE: '#4ade80',
    NEUTRAL:  '#94a3b8',
    NEGATIVE: '#f87171',
}

function LiveFeed({ events }) {
    if (events.length === 0) {
        return (
            <p style={{ color: '#334155', fontSize: '13px' }}>_ waiting for events...</p>
        )
    }

    return (
        <ul style={{ listStyle: 'none', padding: 0, maxHeight: '480px', overflowY: 'auto' }}>
            {events.map((e, i) => {
                const color = COLORS[e.sentiment] || '#94a3b8'
                return (
                    <li key={i} style={{ padding: '16px 0', borderBottom: '1px solid #1e2d4a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', fontSize: '11px', flexWrap: 'wrap' }}>
                            <span style={{
                                color,
                                border: `1px solid ${color}`,
                                padding: '2px 8px',
                                letterSpacing: '0.1em',
                                flexShrink: 0,
                            }}>
                                {e.sentiment}
                            </span>
                            <span style={{ color: '#334155' }}>{e.sentiment_score?.toFixed(3)}</span>
                            <span style={{ color: '#1e2d4a' }}>|</span>
                            <span style={{ color: '#FFFFFF' }}>{e.source}</span>
                            <span style={{ color: '#1e2d4a' }}>|</span>
                            <span style={{ color: '#FFFFFF' }}>{e.release}</span>
                        </div>
                        <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6', paddingLeft: '2px' }}>
                            &gt; {e.title}
                        </p>
                    </li>
                )
            })}
        </ul>
    )
}

export default LiveFeed
