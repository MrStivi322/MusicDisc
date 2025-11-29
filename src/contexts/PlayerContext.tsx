"use client"

import React, { createContext, useContext, useState } from 'react'

interface PlayerContextType {
    currentSpotifyId: string | null
    playTrack: (spotifyId: string) => void
    closePlayer: () => void
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export function PlayerProvider({ children }: { children: React.ReactNode }) {
    const [currentSpotifyId, setCurrentSpotifyId] = useState<string | null>(null)

    const playTrack = (spotifyId: string) => {
        setCurrentSpotifyId(spotifyId)
    }

    const closePlayer = () => {
        setCurrentSpotifyId(null)
    }

    return (
        <PlayerContext.Provider value={{ currentSpotifyId, playTrack, closePlayer }}>
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
