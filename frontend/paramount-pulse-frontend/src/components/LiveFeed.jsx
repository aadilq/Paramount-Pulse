function LiveFeed({ events }) {
    if (events.length === 0) {
        return <p>Waiting for events...</p>
    }

    return (
        <ul style={{ listStyle: 'none', padding: 0, maxHeight: '400px', overflowY: 'auto' }}>
            {events.map((e, i) => (
                <li key={i} style={{ padding: '8px 0', borderBottom: '1px solid #ccc' }}>
                    <span><strong>[{e.sentiment}]</strong> {e.sentiment_score}</span>
                    <span> | {e.source} | {e.release}</span>
                    <p style={{ margin: '4px 0 0' }}>{e.title}</p>
                </li>
            ))}
        </ul>
    )
}

export default LiveFeed
