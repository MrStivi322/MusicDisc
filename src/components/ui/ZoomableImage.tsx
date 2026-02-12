"use client"

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import styles from '@/styles/components/ZoomableImage.module.css'

interface ZoomableImageProps {
    src: string
    alt: string
}

export function ZoomableImage({ src, alt }: ZoomableImageProps) {
    const [scale, setScale] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

    // Refs for performance and state tracking without re-renders
    const viewportRef = useRef<HTMLDivElement>(null)
    const imageRef = useRef<HTMLImageElement>(null)
    const boundsRef = useRef({ maxX: 0, maxY: 0 })
    const lastTapRef = useRef(0)
    const rafRef = useRef<number | null>(null)

    // Calculate bounds based on current scale and viewport
    const updateBounds = useCallback((currentScale: number) => {
        if (!viewportRef.current || !imageRef.current) return

        const viewport = viewportRef.current.getBoundingClientRect()
        const scaledWidth = viewport.width * currentScale
        const scaledHeight = viewport.height * currentScale

        boundsRef.current = {
            maxX: Math.max(0, (scaledWidth - viewport.width) / 2),
            maxY: Math.max(0, (scaledHeight - viewport.height) / 2)
        }
    }, [])

    // Constrain position using cached bounds (no DOM reads)
    const constrainPosition = useCallback((x: number, y: number) => {
        const { maxX, maxY } = boundsRef.current
        return {
            x: Math.min(Math.max(x, -maxX), maxX),
            y: Math.min(Math.max(y, -maxY), maxY)
        }
    }, [])

    const reset = useCallback(() => {
        setScale(1)
        setPosition({ x: 0, y: 0 })
    }, [])

    const handleWheel = (e: React.WheelEvent) => {
        if (!viewportRef.current) return

        const delta = e.deltaY > 0 ? -0.2 : 0.2
        const nextScale = Math.min(Math.max(1, scale + delta), 5)

        if (nextScale !== scale) {
            updateBounds(nextScale)
            setScale(nextScale)
            if (nextScale === 1) {
                setPosition({ x: 0, y: 0 })
            } else {
                const constrained = constrainPosition(position.x, position.y)
                setPosition(constrained)
            }
        }
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        if (scale > 1) {
            setIsDragging(true)
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
            updateBounds(scale) // Ensure bounds are fresh
        }
    }

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging && scale > 1) {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)

            rafRef.current = requestAnimationFrame(() => {
                const newX = e.clientX - dragStart.x
                const newY = e.clientY - dragStart.y
                const constrained = constrainPosition(newX, newY)
                setPosition(constrained)
            })
        }
    }, [isDragging, scale, dragStart, constrainPosition])

    const handleMouseUp = useCallback(() => {
        setIsDragging(false)
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = null
        }
    }, [])

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
        } else {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [isDragging, handleMouseMove, handleMouseUp])

    // Touch support for mobile pinch and pan
    const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null)

    const handleTouchStart = (e: React.TouchEvent) => {
        const now = Date.now()

        // Double tap detection logic
        if (e.touches.length === 1) {
            if (now - lastTapRef.current < 300) {
                reset()
                lastTapRef.current = 0
                return
            }
            lastTapRef.current = now

            if (scale > 1) {
                setIsDragging(true)
                setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y })
                updateBounds(scale)
            }
        }
        else if (e.touches.length === 2) {
            setIsDragging(false)
            const distance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            )
            setLastTouchDistance(distance)
        }
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        // Prevent default to disable browser behaviors like scroll/refresh
        // e.preventDefault() // React synthetic event, but handled via CSS touch-action usually

        if (e.touches.length === 1 && isDragging && scale > 1) {
            const newX = e.touches[0].clientX - dragStart.x
            const newY = e.touches[0].clientY - dragStart.y

            // Allow direct updates for touch to minimize latency feels, or use RAF if still laggy
            // Using RAF here too for consistency
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
            rafRef.current = requestAnimationFrame(() => {
                const constrained = constrainPosition(newX, newY)
                setPosition(constrained)
            })

        } else if (e.touches.length === 2 && lastTouchDistance !== null) {
            const distance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            )
            const ratio = distance / lastTouchDistance
            const nextScale = Math.min(Math.max(1, scale * ratio), 5)

            updateBounds(nextScale)
            setScale(nextScale)
            setLastTouchDistance(distance)

            if (nextScale === 1) {
                setPosition({ x: 0, y: 0 })
            } else {
                const constrained = constrainPosition(position.x, position.y)
                setPosition(constrained)
            }
        }
    }

    const handleTouchEnd = () => {
        setIsDragging(false)
        setLastTouchDistance(null)
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = null
        }
    }

    const handleDoubleClick = () => {
        reset()
    }

    return (
        <div className={styles.container}>
            <div
                ref={viewportRef}
                className={styles.viewport}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onDoubleClick={handleDoubleClick}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            >
                <div
                    className={styles.wrapper}
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
                    }}
                >
                    <Image
                        ref={imageRef}
                        src={src}
                        alt={alt}
                        width={1920}
                        height={1080}
                        className={styles.image}
                        priority
                        unoptimized
                    />
                </div>
            </div>

            {scale > 1 && (
                <div className={styles.zoom_info}>
                    Zoom: {Math.round(scale * 100)}%
                </div>
            )}
        </div>
    )
}
