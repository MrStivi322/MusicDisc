"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { redirectToSpotifyAuthorize, exchangeToken } from '@/lib/spotifyAuth'

interface SpotifyContextType {
    token: string | null
    login: () => void
    logout: () => void
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined)

export function SpotifyProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(null)

    useEffect(() => {
        const checkAuth = async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');

            // Check for existing token and expiration
            let _token = window.localStorage.getItem("musicdisc_spotify_token")
            const _refreshToken = window.localStorage.getItem("musicdisc_spotify_refresh_token")
            const _expiresAt = window.localStorage.getItem("musicdisc_spotify_expires_at")

            // If we have a code, exchange it (Priority 1)
            if (code) {
                try {
                    const data = await exchangeToken(code);
                    if (data.access_token) {
                        _token = data.access_token
                        const expiresIn = data.expires_in || 3600
                        const expiresAt = Date.now() + (expiresIn * 1000)

                        window.localStorage.setItem("musicdisc_spotify_token", _token!)
                        if (data.refresh_token) {
                            window.localStorage.setItem("musicdisc_spotify_refresh_token", data.refresh_token)
                        }
                        window.localStorage.setItem("musicdisc_spotify_expires_at", expiresAt.toString())

                        // Clear code from URL
                        window.history.replaceState({}, document.title, "/");
                    }
                } catch (error) {
                    console.error("Error exchanging token:", error)
                }
            }
            // If we have a token but it's expired, try to refresh (Priority 2)
            else if (_token && _expiresAt && Date.now() > parseInt(_expiresAt) && _refreshToken) {
                try {
                    console.log("Token expired, refreshing...");
                    const data = await import('@/lib/spotifyAuth').then(m => m.refreshAccessToken(_refreshToken));

                    if (data.access_token) {
                        _token = data.access_token
                        const expiresIn = data.expires_in || 3600
                        const expiresAt = Date.now() + (expiresIn * 1000)

                        window.localStorage.setItem("musicdisc_spotify_token", _token!)
                        window.localStorage.setItem("musicdisc_spotify_expires_at", expiresAt.toString())

                        // Update refresh token if a new one is returned
                        if (data.refresh_token) {
                            window.localStorage.setItem("musicdisc_spotify_refresh_token", data.refresh_token)
                        }
                    } else {
                        // Refresh failed, clear everything
                        console.error("Refresh failed", data);
                        logout()
                        return
                    }
                } catch (error) {
                    console.error("Error refreshing token:", error)
                    logout()
                    return
                }
            }

            if (_token) {
                setToken(_token)
            }
        }

        checkAuth()
    }, [])

    const login = async () => {
        await redirectToSpotifyAuthorize()
    }

    const logout = () => {
        setToken(null)
        window.localStorage.removeItem("musicdisc_spotify_token")
        window.localStorage.removeItem("musicdisc_spotify_refresh_token")
        window.localStorage.removeItem("musicdisc_spotify_expires_at")
    }

    return (
        <SpotifyContext.Provider value={{ token, login, logout }}>
            {children}
        </SpotifyContext.Provider>
    )
}

export function useSpotify() {
    const context = useContext(SpotifyContext)
    if (context === undefined) {
        throw new Error('useSpotify must be used within a SpotifyProvider')
    }
    return context
}
