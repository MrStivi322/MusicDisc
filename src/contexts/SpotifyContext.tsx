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

            // Load existing tokens from localStorage
            let _token = window.localStorage.getItem("musicdisc_spotify_token")
            const _refreshToken = window.localStorage.getItem("musicdisc_spotify_refresh_token")
            const _expiresAt = window.localStorage.getItem("musicdisc_spotify_expires_at")

            // Priority 1: If we have a code in URL, exchange it for tokens (first login)
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
            // Priority 2: If we have a token and it's expired, refresh it
            else if (_token && _expiresAt && _refreshToken && Date.now() > parseInt(_expiresAt)) {
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
            // Priority 3: If we have a valid token in localStorage, use it
            if (_token) {
                setToken(_token)
            }
        }

        checkAuth()
    }, [])

    // Auto-refresh token 5 minutes before expiration
    useEffect(() => {
        if (!token) return

        const _expiresAt = window.localStorage.getItem("musicdisc_spotify_expires_at")
        const _refreshToken = window.localStorage.getItem("musicdisc_spotify_refresh_token")

        if (!_expiresAt || !_refreshToken) return

        const expiresAt = parseInt(_expiresAt)
        const now = Date.now()
        const timeUntilExpiry = expiresAt - now
        const refreshTime = timeUntilExpiry - (5 * 60 * 1000) // 5 minutes before expiry

        if (refreshTime <= 0) {
            // Token expires in less than 5 minutes, refresh immediately
            const refreshNow = async () => {
                try {
                    console.log("Auto-refreshing token...");
                    const data = await import('@/lib/spotifyAuth').then(m => m.refreshAccessToken(_refreshToken));

                    if (data.access_token) {
                        const newToken = data.access_token
                        const expiresIn = data.expires_in || 3600
                        const newExpiresAt = Date.now() + (expiresIn * 1000)

                        window.localStorage.setItem("musicdisc_spotify_token", newToken)
                        window.localStorage.setItem("musicdisc_spotify_expires_at", newExpiresAt.toString())

                        if (data.refresh_token) {
                            window.localStorage.setItem("musicdisc_spotify_refresh_token", data.refresh_token)
                        }

                        setToken(newToken)
                    } else {
                        console.error("Auto-refresh failed", data);
                        logout()
                    }
                } catch (error) {
                    console.error("Error auto-refreshing token:", error)
                    logout()
                }
            }
            refreshNow()
            return
        }

        // Set timer to refresh before expiry
        const timer = setTimeout(async () => {
            try {
                console.log("Auto-refreshing token...");
                const data = await import('@/lib/spotifyAuth').then(m => m.refreshAccessToken(_refreshToken));

                if (data.access_token) {
                    const newToken = data.access_token
                    const expiresIn = data.expires_in || 3600
                    const newExpiresAt = Date.now() + (expiresIn * 1000)

                    window.localStorage.setItem("musicdisc_spotify_token", newToken)
                    window.localStorage.setItem("musicdisc_spotify_expires_at", newExpiresAt.toString())

                    if (data.refresh_token) {
                        window.localStorage.setItem("musicdisc_spotify_refresh_token", data.refresh_token)
                    }

                    setToken(newToken)
                } else {
                    console.error("Auto-refresh failed", data);
                    logout()
                }
            } catch (error) {
                console.error("Error auto-refreshing token:", error)
                logout()
            }
        }, refreshTime)

        return () => clearTimeout(timer)
    }, [token])

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
