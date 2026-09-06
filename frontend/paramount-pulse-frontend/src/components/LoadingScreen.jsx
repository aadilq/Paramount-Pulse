import { useEffect, useState } from "react"

const BAR_DURATION_MS = 2000
const HOLD_MS = 150
const FADE_MS = 400
const READY_FALLBACK_MS = 6000

function LoadingScreen({ ready, onComplete }) {
    const [barDone, setBarDone] = useState(false)
    const [timedOut, setTimedOut] = useState(false)
    const [hiding, setHiding] = useState(false)

    useEffect(() => {
        const barTimer = setTimeout(() => setBarDone(true), BAR_DURATION_MS + HOLD_MS)
        const fallbackTimer = setTimeout(() => setTimedOut(true), READY_FALLBACK_MS)
        return () => {
            clearTimeout(barTimer)
            clearTimeout(fallbackTimer)
        }
    }, [])

    useEffect(() => {
        if (hiding || !barDone || !(ready || timedOut)) return
        setHiding(true)
    }, [barDone, ready, timedOut, hiding])

    useEffect(() => {
        if (!hiding) return
        const completeTimer = setTimeout(() => onComplete(), FADE_MS)
        return () => clearTimeout(completeTimer)
    }, [hiding, onComplete])

    return (
        <div className={`loading-screen${hiding ? " loading-screen-hide" : ""}`}>
            <div className="loading-bar-track">
                <div className="loading-bar-fill" />
                <span className="loading-bar-text">LOADING...</span>
            </div>
        </div>
    )
}

export default LoadingScreen
