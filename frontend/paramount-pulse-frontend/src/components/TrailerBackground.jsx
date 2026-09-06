import { useEffect, useRef, useState } from "react"
import { TRAILER_CLIPS } from "../constants/trailerClips"

let apiPromise = null

function loadYouTubeApi() {
    if (window.YT?.Player) return Promise.resolve(window.YT)
    if (apiPromise) return apiPromise

    apiPromise = new Promise((resolve) => {
        const prevCallback = window.onYouTubeIframeAPIReady
        window.onYouTubeIframeAPIReady = () => {
            prevCallback?.()
            resolve(window.YT)
        }
        const tag = document.createElement("script")
        tag.src = "https://www.youtube.com/iframe_api"
        document.head.appendChild(tag)
    })

    return apiPromise
}

const POLL_MS = 200
const SWITCH_LEAD_S = 1.5 // start pre-loaded clip this many seconds before the current one ends
const PLAYING_WAIT_STEP_MS = 40
const PLAYING_WAIT_MAX_MS = 500
const PLAY_ICON_SETTLE_MS = 450 // let YouTube's own play-icon animation finish while still hidden
const CROSSFADE_MS = 600

function TrailerBackground({ onReady }) {
    const wrapRef = useRef(null)
    const mountRefA = useRef(null)
    const mountRefB = useRef(null)
    const playerARef = useRef(null)
    const playerBRef = useRef(null)
    const slotClipIndexRef = useRef([0, 1 % TRAILER_CLIPS.length])
    const activeSlotRef = useRef(0)
    const playingFlagsRef = useRef([false, false])
    const switchingRef = useRef(false)
    const readyFiredRef = useRef(false)
    const [activeSlot, setActiveSlot] = useState(0)
    const [revealed, setRevealed] = useState(false)

    const fireReady = () => {
        if (readyFiredRef.current) return
        readyFiredRef.current = true
        setRevealed(true)
        onReady?.()
    }

    useEffect(() => {
        if (TRAILER_CLIPS.length === 0) {
            fireReady()
            return
        }
        let cancelled = false
        let pollTimer = null

        const playerRefs = [playerARef, playerBRef]

        const waitUntilPlaying = (slot) =>
            new Promise((resolve) => {
                let waited = 0
                const check = () => {
                    if (cancelled || playingFlagsRef.current[slot] || waited >= PLAYING_WAIT_MAX_MS) {
                        resolve()
                        return
                    }
                    waited += PLAYING_WAIT_STEP_MS
                    setTimeout(check, PLAYING_WAIT_STEP_MS)
                }
                check()
            })

        const beginSwitch = async () => {
            if (switchingRef.current) return
            switchingRef.current = true

            const from = activeSlotRef.current
            const to = from === 0 ? 1 : 0
            const toPlayer = playerRefs[to].current

            playingFlagsRef.current[to] = false
            toPlayer?.playVideo()
            await waitUntilPlaying(to)
            if (cancelled) return
            await new Promise((r) => setTimeout(r, PLAY_ICON_SETTLE_MS))
            if (cancelled) return

            activeSlotRef.current = to
            setActiveSlot(to)

            setTimeout(() => {
                if (cancelled) return
                playerRefs[from].current?.pauseVideo()

                const upcomingIndex = (slotClipIndexRef.current[to] + 1) % TRAILER_CLIPS.length
                slotClipIndexRef.current[from] = upcomingIndex
                const upcomingClip = TRAILER_CLIPS[upcomingIndex]
                playerRefs[from].current?.cueVideoById({
                    videoId: upcomingClip.videoId,
                    startSeconds: upcomingClip.start,
                })
                switchingRef.current = false
            }, CROSSFADE_MS)
        }

        const startPolling = () => {
            pollTimer = setInterval(() => {
                if (switchingRef.current) return
                const active = activeSlotRef.current
                const player = playerRefs[active].current
                if (!player?.getCurrentTime) return
                const clip = TRAILER_CLIPS[slotClipIndexRef.current[active]]
                if (player.getCurrentTime() >= clip.end - SWITCH_LEAD_S) {
                    beginSwitch()
                }
            }, POLL_MS)
        }

        loadYouTubeApi().then((YT) => {
            if (cancelled || !mountRefA.current || !mountRefB.current) return

            const clipA = TRAILER_CLIPS[slotClipIndexRef.current[0]]
            const clipB = TRAILER_CLIPS[slotClipIndexRef.current[1]]

            const makePlayer = (mountEl, clip, slot, autoplay) =>
                new YT.Player(mountEl, {
                    videoId: clip.videoId,
                    playerVars: {
                        autoplay: autoplay ? 1 : 0,
                        mute: 1,
                        controls: 0,
                        disablekb: 1,
                        fs: 0,
                        iv_load_policy: 3,
                        modestbranding: 1,
                        playsinline: 1,
                        rel: 0,
                        start: clip.start,
                    },
                    events: {
                        onReady: (e) => {
                            e.target.mute()
                            if (autoplay) e.target.playVideo()
                            else e.target.cueVideoById({
                                videoId: clip.videoId,
                                startSeconds: clip.start,
                            })
                        },
                        onStateChange: (e) => {
                            playingFlagsRef.current[slot] = e.data === YT.PlayerState.PLAYING
                            if (slot === 0 && e.data === YT.PlayerState.PLAYING) {
                                setTimeout(fireReady, PLAY_ICON_SETTLE_MS)
                            }
                        },
                    },
                })

            playerARef.current = makePlayer(mountRefA.current, clipA, 0, true)
            playerBRef.current = makePlayer(mountRefB.current, clipB, 1, false)
            startPolling()
        })

        return () => {
            cancelled = true
            if (pollTimer) clearInterval(pollTimer)
            playerARef.current?.destroy?.()
            playerBRef.current?.destroy?.()
            playerARef.current = null
            playerBRef.current = null
        }
    }, [])

    useEffect(() => {
        if (!wrapRef.current) return
        const observer = new IntersectionObserver(
            ([entry]) => {
                const player = [playerARef, playerBRef][activeSlotRef.current].current
                if (!player?.pauseVideo) return
                if (entry.isIntersecting) player.playVideo()
                else player.pauseVideo()
            },
            { threshold: 0.1 }
        )
        observer.observe(wrapRef.current)
        return () => observer.disconnect()
    }, [])

    if (TRAILER_CLIPS.length === 0) return null

    return (
        <div className="trailer-bg" ref={wrapRef}>
            <div className={`trailer-bg-frame${activeSlot === 0 ? " trailer-bg-frame-active" : ""}`}>
                <div ref={mountRefA} />
            </div>
            <div className={`trailer-bg-frame${activeSlot === 1 ? " trailer-bg-frame-active" : ""}`}>
                <div ref={mountRefB} />
            </div>
            <div className="trailer-bg-overlay" />
            <div className={`trailer-bg-cover${revealed ? " trailer-bg-cover-hidden" : ""}`} />
        </div>
    )
}

export default TrailerBackground
