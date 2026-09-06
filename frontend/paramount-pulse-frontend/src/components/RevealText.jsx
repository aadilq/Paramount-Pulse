import { useEffect, useRef, useState } from "react"

function RevealText({ text, className, style, wordDelayMs = 60 }) {
    const ref = useRef(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        if (!ref.current) return
        const observer = new IntersectionObserver(
            ([entry]) => setVisible(entry.isIntersecting),
            { threshold: 0.3 }
        )
        observer.observe(ref.current)
        return () => observer.disconnect()
    }, [])

    const words = text.split(" ")

    return (
        <p ref={ref} className={`reveal-text${className ? ` ${className}` : ""}`} style={style}>
            {words.map((word, i) => (
                <span
                    key={i}
                    className={`reveal-word${visible ? " reveal-word-visible" : ""}`}
                    style={{ transitionDelay: `${i * wordDelayMs}ms` }}
                >
                    {word}
                </span>
            ))}
        </p>
    )
}

export default RevealText
