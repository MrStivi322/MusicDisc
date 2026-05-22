"use client"

import { Component, ReactNode, useEffect, useState } from 'react';
import { Navbar } from "@/components/Navbar";
import { ScrollToTop } from "@/components/ScrollToTop";
import { usePathname } from "next/navigation";
import styles from "@/styles/components/ErrorBoundary.module.css";
import playerStyles from "@/styles/components/SpotifyPlayer.module.css";
import { useSpotify } from '@/contexts/SpotifyContext'
import { usePlayer } from '@/contexts/PlayerContext'
import Image from "next/image"

declare global {
    interface Window {
        onSpotifyWebPlaybackSDKReady: () => void
        Spotify: any
    }
}

function SpotifyPlayer() {
    const { token } = useSpotify()
    const { currentSpotifyId, queue } = usePlayer()
    const [player, setPlayer] = useState<any>(undefined)
    const [isPaused, setIsPaused] = useState(false)
    const [isActive, setIsActive] = useState(false)
    const [currentTrack, setCurrentTrack] = useState<any>(null)
    const [deviceId, setDeviceId] = useState<string>('')
    const [position, setPosition] = useState(0)
    const [duration, setDuration] = useState(0)
    const [status, setStatus] = useState<string>('Initializing...')

    useEffect(() => {
        if (!token) return

        if (!window.Spotify) {
            const script = document.createElement("script")
            script.src = "https://sdk.scdn.co/spotify-player.js"
            script.async = true
            document.body.appendChild(script)
        }

        window.onSpotifyWebPlaybackSDKReady = () => {
            const player = new window.Spotify.Player({
                name: 'MusicDisc Web Player',
                getOAuthToken: (cb: (token: string) => void) => { cb(token!) },
                volume: 0.5
            })

            setPlayer(player)

            player.addListener('ready', ({ device_id }: { device_id: string }) => {
                setDeviceId(device_id)
                setStatus('Ready')
            })

            player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
                setStatus('Device offline')
            })

            player.addListener('initialization_error', ({ message }: { message: string }) => {
                setStatus(`Error: ${message}`)
            })

            player.addListener('authentication_error', ({ message }: { message: string }) => {
                setStatus(`Auth Error: ${message}`)
            })

            player.addListener('account_error', ({ message }: { message: string }) => {
                setStatus(`Account Error: ${message} (Premium required)`)
            })

            player.addListener('player_state_changed', (state: any) => {
                if (!state) {
                    setIsActive(false)
                    return
                }
                setCurrentTrack(state.track_window.current_track)
                setIsPaused(state.paused)
                setPosition(state.position)
                setDuration(state.duration)

                player.getCurrentState().then((state: any) => {
                    !state ? setIsActive(false) : setIsActive(true)
                })
            })

            player.connect()
        }

    }, [token])

    useEffect(() => {
        if (!isPaused && isActive) {
            const interval = setInterval(() => {
                setPosition((p) => p + 1000)
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [isPaused, isActive])

    useEffect(() => {
        if (!deviceId || !currentSpotifyId || !token) return

        const playSong = async () => {
            try {
                setStatus('Playing...')
                const uris = queue.length > 0 && queue.includes(currentSpotifyId)
                    ? queue.map(id => `spotify:track:${id}`)
                    : [`spotify:track:${currentSpotifyId}`]

                const offset = queue.indexOf(currentSpotifyId)

                const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        uris: uris,
                        offset: offset !== -1 ? { position: offset } : undefined
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                })

                if (!response.ok) {
                    const error = await response.json()
                    console.error("Spotify API Error:", error)
                    setStatus(`Error: ${error.error?.message || 'Playback failed'}`)
                }
            } catch (e) {
                console.error("Playback error", e)
                setStatus('Playback failed')
            }
        }

        playSong()
    }, [currentSpotifyId, deviceId, token])

    const formatTime = (ms: number) => {
        const seconds = Math.floor((ms / 1000) % 60)
        const minutes = Math.floor((ms / 1000 / 60) % 60)
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    }

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!player || !duration) return
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const percentage = Math.max(0, Math.min(1, x / rect.width))
        const newPosition = percentage * duration
        player.seek(newPosition)
        setPosition(newPosition)
    }

    if (!currentSpotifyId && !currentTrack) return null

    if (!currentTrack) {
        return (
            <div className={playerStyles.player_container}>
                <div className={playerStyles.player_content}>
                    <div style={{ padding: '1rem', color: 'white', textAlign: 'center' }}>
                        {status}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={playerStyles.player_container}>
            <div className={playerStyles.player_content}>
                <div className={playerStyles.track_info}>
                    <div className={playerStyles.cover_image_wrapper}>
                        <Image
                            src={currentTrack.album.images[0].url}
                            alt={currentTrack.name}
                            width={56}
                            height={56}
                            className={playerStyles.cover_image}
                        />
                    </div>
                    <div className={playerStyles.track_details}>
                        <div className={playerStyles.track_name}>{currentTrack.name}</div>
                        <div className={playerStyles.artist_name}>{currentTrack.artists[0].name}</div>
                    </div>
                </div>

                <div className={playerStyles.controls}>
                    <button className={playerStyles.control_button} onClick={() => player.previousTrack()}>
                        <i className='bx bx-skip-previous'></i>
                    </button>
                    <button className={`${playerStyles.control_button} ${playerStyles.play_button}`} onClick={() => player.togglePlay()}>
                        <i className={`bx ${isPaused ? 'bx-play' : 'bx-pause'}`}></i>
                    </button>
                    <button className={playerStyles.control_button} onClick={() => player.nextTrack()}>
                        <i className='bx bx-skip-next'></i>
                    </button>
                </div>

                <div className={playerStyles.progress_container}>
                    <span>{formatTime(position)}</span>
                    <div className={playerStyles.progress_bar} onClick={handleSeek}>
                        <div
                            className={playerStyles.progress_fill}
                            style={{ width: `${(position / duration) * 100}%` }}
                        />
                    </div>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    )
}

function PageTransition({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const [displayChildren, setDisplayChildren] = useState(children)
    const [transitionStage, setTransitionStage] = useState("fadeIn")

    useEffect(() => {
        setTransitionStage("fadeOut")
    }, [pathname])

    useEffect(() => {
        if (transitionStage === "fadeOut") {
            const timeout = setTimeout(() => {
                setDisplayChildren(children)
                setTransitionStage("fadeIn")
            }, 150)
            return () => clearTimeout(timeout)
        }
    }, [transitionStage, children])

    return (
        <main
            style={{
                animation: `${transitionStage === "fadeOut" ? "fadeOut" : "fadeIn"} 0.15s ease-in-out`,
                opacity: transitionStage === "fadeOut" ? 0 : 1,
                outline: 'none',
            }}
        >
            {displayChildren}
        </main>
    )
}

export default function ClientLayoutContent({ children }: { children: React.ReactNode }) {
    return (
        <ErrorBoundary>
            <Navbar />
            <PageTransition>{children}</PageTransition>
            <ScrollToTop />
            <SpotifyPlayer />
        </ErrorBoundary>
    );
}

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: string;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Error Boundary caught an error:', error);
            console.error('Error Info:', errorInfo);
        }
        this.setState({
            errorInfo: errorInfo.componentStack || undefined
        });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className={styles.error_container}>
                    <div className={styles.error_card}>
                        <div className={styles.error_icon}>
                            <i className='bx bx-error-circle'></i>
                        </div>

                        <h1 className={styles.error_title}>Oops! Something went wrong</h1>

                        <p className={styles.error_message}>
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                            <details className={styles.error_details}>
                                <summary>Error Details (Development Only)</summary>
                                <pre className={styles.error_stack}>
                                    {this.state.error?.stack}
                                </pre>
                                <pre className={styles.error_stack}>
                                    {this.state.errorInfo}
                                </pre>
                            </details>
                        )}

                        <div className={styles.error_actions}>
                            <button
                                onClick={this.handleReset}
                                className={`${styles.btn} ${styles.btn_primary}`}
                            >
                                <i className='bx bx-refresh'></i>
                                Try Again
                            </button>

                            <button
                                onClick={this.handleReload}
                                className={`${styles.btn} ${styles.btn_secondary}`}
                            >
                                <i className='bx bx-home'></i>
                                Reload Page
                            </button>
                        </div>

                        <p className={styles.error_help}>
                            If this problem persists, please contact support or try again later.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
