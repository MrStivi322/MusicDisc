"use client"

import React, { useEffect, useState } from 'react'
import SpotifyWebPlayer from 'react-spotify-web-playback'
import { useSpotify } from '@/contexts/SpotifyContext'
import { usePlayer } from '@/contexts/PlayerContext'
import styles from "@/styles/components/SpotifyPlayer.module.css"

export default function SpotifyPlayer() {
    const { token } = useSpotify()
    const { currentSpotifyId, queue } = usePlayer()
    const [play, setPlay] = useState(false)

    useEffect(() => {
        setPlay(true)
    }, [currentSpotifyId])

    if (!token) return null
    if (!currentSpotifyId) return null

    const uris = queue.length > 0
        ? queue.map(id => `spotify:track:${id}`)
        : [`spotify:track:${currentSpotifyId}`]

    const offset = queue.indexOf(currentSpotifyId)

    return (
        <div className={styles.player_container}>
            <div className={styles.player_wrapper}>
                <SpotifyWebPlayer
                    token={token}
                    showSaveIcon
                    callback={state => {
                        setPlay(state.isPlaying)
                    }}
                    play={play}
                    autoPlay={true}
                    uris={uris}
                    offset={offset !== -1 ? offset : 0}
                    styles={{
                        activeColor: '#F76B15',
                        bgColor: 'transparent',
                        color: '#ffffff',
                        loaderColor: '#F76B15',
                        sliderColor: '#F76B15',
                        height: 80,
                        sliderHandleColor: '#F76B15',
                        trackNameColor: '#ffffff',
                        trackArtistColor: '#a1a1aa',
                    }}
                    magnifySliderOnHover={true}
                    name="MusicDisc Player"
                />
            </div>
        </div>
    )
}
