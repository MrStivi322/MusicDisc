"use client"

import { useState, useCallback, useRef, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import { Point, Area } from 'react-easy-crop'
import styles from '@/styles/components/ImageCropper.module.css'
import { useLanguage } from "@/contexts/LanguageContext"

interface ImageCropperProps {
    imageSrc: string
    onCropComplete: (croppedImage: Blob) => void
    onCancel: () => void
}

export function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
    const { t } = useLanguage()
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel()
                return
            }

            if (e.key === 'Tab') {
                const focusableElements = containerRef.current?.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                )

                if (!focusableElements || focusableElements.length === 0) return

                const firstElement = focusableElements[0] as HTMLElement
                const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault()
                        lastElement.focus()
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault()
                        firstElement.focus()
                    }
                }
            }
        }

        document.addEventListener('keydown', handleKeyDown)

        // Focus first interactive element on mount
        const timer = setTimeout(() => {
            const firstInput = containerRef.current?.querySelector('input')
            if (firstInput) firstInput.focus()
        }, 100)

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            clearTimeout(timer)
        }
    }, [onCancel])

    const onCropChange = (crop: Point) => {
        setCrop(crop)
    }

    const onZoomChange = (zoom: number) => {
        setZoom(zoom)
    }

    const onCropAreaChange = (croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }

    const createImage = (url: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
            const image = new Image()
            image.addEventListener('load', () => resolve(image))
            image.addEventListener('error', (error) => reject(error))
            image.setAttribute('crossOrigin', 'anonymous')
            image.src = url
        })

    const getCroppedImg = async (
        imageSrc: string,
        pixelCrop: Area
    ): Promise<Blob> => {
        const image = await createImage(imageSrc)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
            throw new Error('No 2d context')
        }

        canvas.width = pixelCrop.width
        canvas.height = pixelCrop.height

        ctx.drawImage(
            image,
            pixelCrop.x,
            pixelCrop.y,
            pixelCrop.width,
            pixelCrop.height,
            0,
            0,
            pixelCrop.width,
            pixelCrop.height
        )

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error('Canvas is empty'))
                    return
                }
                resolve(blob)
            }, 'image/jpeg')
        })
    }

    const handleSave = async () => {
        if (croppedAreaPixels) {
            try {
                const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
                onCropComplete(croppedImage)
            } catch (e) {
                console.error(e)
            }
        }
    }

    return (
        <div
            className={styles.cropper_container}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cropper-title"
            ref={containerRef}
        >
            <h2 id="cropper-title" className="sr-only">{t('settings.avatar.change')}</h2>
            <div className={styles.cropper_wrapper}>
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={onCropChange}
                    onCropComplete={onCropAreaChange}
                    onZoomChange={onZoomChange}
                />
            </div>
            <div className={styles.controls}>
                <div className={styles.slider_container}>
                    <label htmlFor="zoom-slider" className={styles.slider_label}>Zoom</label>
                    <input
                        id="zoom-slider"
                        type="range"
                        value={zoom}
                        min={1}
                        max={3}
                        step={0.1}
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className={styles.slider}
                    />
                </div>
                <div className={styles.buttons}>
                    <button onClick={onCancel} className={styles.btn_cancel}>
                        {t('settings.cancel')}
                    </button>
                    <button onClick={handleSave} className={styles.btn_save}>
                        {t('settings.form.save')}
                    </button>
                </div>
            </div>
        </div>
    )
}
