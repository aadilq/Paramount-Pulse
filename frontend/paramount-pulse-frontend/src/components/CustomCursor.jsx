import { useEffect, useRef } from "react"

const DOT_EASE = 0.18

function CustomCursor() {
    const ringRef = useRef(null)
    const dotRef = useRef(null)
    const mouse = useRef({ x: -100, y: -100 })
    const dot = useRef({ x: -100, y: -100 })
    const rafRef = useRef(null)

    useEffect(() => {
        if (window.matchMedia("(pointer: coarse)").matches) return

        document.body.classList.add("custom-cursor-active")

        const handleMove = (e) => {
            mouse.current.x = e.clientX
            mouse.current.y = e.clientY
            if (ringRef.current) {
                ringRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`
            }
        }

        const animate = () => {
            dot.current.x += (mouse.current.x - dot.current.x) * DOT_EASE
            dot.current.y += (mouse.current.y - dot.current.y) * DOT_EASE
            if (dotRef.current) {
                dotRef.current.style.transform = `translate3d(${dot.current.x}px, ${dot.current.y}px, 0) translate(-50%, -50%)`
            }
            rafRef.current = requestAnimationFrame(animate)
        }

        window.addEventListener("mousemove", handleMove)
        rafRef.current = requestAnimationFrame(animate)

        return () => {
            window.removeEventListener("mousemove", handleMove)
            cancelAnimationFrame(rafRef.current)
            document.body.classList.remove("custom-cursor-active")
        }
    }, [])

    return (
        <>
            <div className="cursor-ring" ref={ringRef} />
            <div className="cursor-dot" ref={dotRef} />
        </>
    )
}

export default CustomCursor
