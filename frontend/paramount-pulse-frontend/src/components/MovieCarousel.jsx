import { POSTERS } from "../constants/posters"

const arrowButtonStyle = {
    background: 'none',
    border: '1px solid #1e2d4a',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    color: '#f1f5f9',
    fontSize: '16px',
    cursor: 'pointer',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}

function MovieCarousel({ releases, selected, onSelect }) {
    const currentIndex = releases.indexOf(selected)
    const posterPath = POSTERS[selected]

    const goTo = (offset) => {
        const nextIndex = (currentIndex + offset + releases.length) % releases.length
        onSelect(releases[nextIndex])
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button aria-label="Previous release" onClick={() => goTo(-1)} style={arrowButtonStyle}>
                &#8592;
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                    width: '220px',
                    height: '320px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    background: '#0f1829',
                    border: '2px solid #38bdf8',
                    boxShadow: '0 0 12px rgba(56, 189, 248, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    {posterPath ? (
                        <img
                            src={posterPath}
                            alt={selected}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <span style={{ fontSize: '11px', color: '#6a7e9d', padding: '8px', textAlign: 'center' }}>
                            {selected}
                        </span>
                    )}
                </div>
                <p style={{
                    marginTop: '8px',
                    fontSize: '13px',
                    color: '#f1f5f9',
                    fontFamily: "'Titillium Web', sans-serif",
                    textAlign: 'center',
                }}>
                    {selected}
                </p>
            </div>

            <button aria-label="Next release" onClick={() => goTo(1)} style={arrowButtonStyle}>
                &#8594;
            </button>
        </div>
    )
}

export default MovieCarousel
