"use client"

import React, { createContext, useContext, useState } from 'react'

interface PlayerContextType {
    currentSpotifyId: string | null
    queue: string[]
    playTrack: (spotifyId: string, newQueue?: string[]) => void
    nextTrack: () => void
    prevTrack: () => void
    closePlayer: () => void
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export function PlayerProvider({ children }: { children: React.ReactNode }) {
    const [currentSpotifyId, setCurrentSpotifyId] = useState<string | null>(null)
    const [queue, setQueue] = useState<string[]>([])

    const playTrack = (spotifyId: string, newQueue?: string[]) => {
        setCurrentSpotifyId(spotifyId)
        if (newQueue) {
            setQueue(newQueue)
        }
    }

    const nextTrack = () => {
        if (!currentSpotifyId || queue.length === 0) return
        const currentIndex = queue.indexOf(currentSpotifyId)
        if (currentIndex < queue.length - 1) {
            setCurrentSpotifyId(queue[currentIndex + 1])
        }
    }

    const prevTrack = () => {
        if (!currentSpotifyId || queue.length === 0) return
        const currentIndex = queue.indexOf(currentSpotifyId)
        if (currentIndex > 0) {
            setCurrentSpotifyId(queue[currentIndex - 1])
        }
    }

    const closePlayer = () => {
        setCurrentSpotifyId(null)
        setQueue([])
    }

    return (
        <PlayerContext.Provider value={{ currentSpotifyId, queue, playTrack, nextTrack, prevTrack, closePlayer }}>
            {children}
        </PlayerContext.Provider>
    )
}

export function usePlayer() {
    const context = useContext(PlayerContext)
    if (context === undefined) {
        throw new Error('usePlayer must be used within a PlayerProvider')
    }
    return context
}
