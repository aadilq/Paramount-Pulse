import { useEffect, useState } from "react"
import CustomCursor from "./components/CustomCursor"
import LoadingScreen from "./components/LoadingScreen"
import RevealText from "./components/RevealText"
import TrailerBackground from "./components/TrailerBackground"
import MovieCarousel from "./components/MovieCarousel"
import SentimentSummary from "./components/SentimentSummary"


const FULL_TITLE = "Paramount Pulse"

const RELEASES = [
  "Heart of the Beast",
  "Ebenezer",
  "Mr. Irrelevant: The John Tuggle Story",
  "Street Fighter",
  "Mission: Impossible - The Final Reckoning",
  "Teenage Mutant Ninja Turtles: Mutant Mayhem",
  "Transformers One",
  "Top Gun Maverick",
  "Gladiator II",
  "A Quiet Place: Day One",
]

function App() {
  const [displayed, setDisplayed] = useState("")
  const [loading, setLoading] = useState(true)
  const [videoReady, setVideoReady] = useState(false)
  const [heroVisible, setHeroVisible] = useState(false)
  const [release, setRelease] = useState(RELEASES[0])

  useEffect(() => {
    if (loading) return
    const timeout = setTimeout(() => setHeroVisible(true), 50)
    return () => clearTimeout(timeout)
  }, [loading])

  useEffect(() => {
    if (loading) return
    if (displayed.length >= FULL_TITLE.length) return
    const timeout = setTimeout(() => {
      setDisplayed(FULL_TITLE.slice(0, displayed.length + 1))
    }, 100)
    return () => clearTimeout(timeout)
  }, [displayed, loading])

  return (
    <div style={{ background: '#DBD6F4', minHeight: '100vh' }}>
      <CustomCursor />
      {loading && <LoadingScreen ready={videoReady} onComplete={() => setLoading(false)} />}

      <section style={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
        textAlign: 'center',
        borderBottom: '1px solid #1e2d4a',
        overflow: 'hidden',
      }}>
        <TrailerBackground onReady={() => setVideoReady(true)} />

        <div className={`hero-content${heroVisible ? ' hero-content-visible' : ''}`}>
          <h1 style={{
            fontFamily: "'Abel', sans-serif",
            fontSize: 'clamp(42px, 8vw, 96px)',
            letterSpacing: '0.25em',
            color: '#f1f5f9',
            textTransform: 'uppercase',
            marginBottom: '32px',
          }}>
            {displayed}
          </h1>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '13px',
            color: '#6a7e9d',
            maxWidth: '520px',
            lineHeight: '2',
            marginBottom: '72px',
          }}>
          </p>
          <p style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            color: '#f1f5f9',
            letterSpacing: '0.15em',
            marginTop: '150px',
          }}>
            scroll to explore
          </p>
          <p style={{
            fontWeight: 'bold',
            fontFamily: "'Space Mono', monospace",
            fontSize: '12px',
            color: '#f1f5f9',
            marginTop: '8px',
          }}>
            |
          </p>
        </div>
      </section>

      <section style={{
        position: 'relative',
        minHeight: '100vh',
        background: '#082434',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '0 24px',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '900px', marginTop: '100px' }}>
          <RevealText
            text="Select a Paramount release below and see a live LLM generated summary of reviews coming in from various news articles and YouTube."
            style={{
              fontFamily: "'Titillium Web', sans-serif",
              fontSize: 'clamp(18px, 3vw, 28px)',
              color: '#f1f5f9',
              maxWidth: '1000px',
              textAlign: 'center',
              lineHeight: '1.6',
            }}
          />

          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '24px',
            width: '100%',
            marginTop: '25px',
          }}>
            <select
              value={release}
              onChange={e => setRelease(e.target.value)}
              style={{
                flexShrink: 0,
                width: '300px',
                borderRadius: '25px',
                fontWeight: 'bold',
                fontFamily: "'Titillium Web', sans-serif",
              }}
            >
              {RELEASES.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            <MovieCarousel releases={RELEASES} selected={release} onSelect={setRelease} />
          </div>

          <div style={{ marginTop: '40px', marginBottom: '140px', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <SentimentSummary release={release} />
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '24px', left: '5px', width: '300px', maxWidth: 'calc(100% - 48px)' }}>
          <iframe
            title="Spotify playlist"
            style={{ borderRadius: '12px' }}
            src="https://open.spotify.com/embed/playlist/0nIe8cZWhgGD9wExfX4hIV?utm_source=generator&autoplay=1"
            width="100%"
            height="80"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      </section>
    </div>
  )
}

export default App
