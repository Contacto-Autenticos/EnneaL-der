import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResultVideoIntro.css';

const ResultVideoIntro = ({ type }) => {
    const navigate = useNavigate();
    const playerRef = useRef(null);
    const containerRef = useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [videoError, setVideoError] = useState(false);
    const [isFading, setIsFading] = useState(false);
    const [ytReady, setYtReady] = useState(false);

    const youtubeLinks = {
        '1': { desktop: '805ziDZnQak', mobile: 'aYU-Sc51xLA' },
        '2': { desktop: '9hZbPuxmAsM', mobile: 'Rxvtz3a1PKE' },
        '3': { desktop: 'VRK97R6wxhw', mobile: '9f4qh5byOm0' },
        '4': { desktop: 'gh6SX3BBs7U', mobile: 'JgOj_JunHuE' },
        '5': { desktop: 'LGdOi0z-A-0', mobile: 'rf2cMOtB7mc' },
        '6': { desktop: 'qDek2lQ9Maw', mobile: 'sLbIbbnfyuQ' },
        '7': { desktop: '6UF8EAD7hYY', mobile: 'YLquL5TYOoY' },
        '8': { desktop: 'hh2QKvlgLcU', mobile: 'elcerA-Kyok' },
        '9': { desktop: '9ebvZRaYz9o', mobile: 'YxBCc-2G6pA' }
    };

    const cleanType = String(type).trim();
    const youtubeId = youtubeLinks[cleanType]?.[isMobile ? 'mobile' : 'desktop'];

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load YouTube API
    useEffect(() => {
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            
            window.onYouTubeIframeAPIReady = () => {
                setYtReady(true);
            };
        } else {
            setYtReady(true);
        }
    }, []);

    const handleSkip = () => {
        setIsFading(true);
        setTimeout(() => {
            navigate('/eneagrama-advanced-analysis-result');
        }, 400);
    };

    // Initialize YouTube Player
    useEffect(() => {
        if (ytReady && youtubeId && containerRef.current && !playerRef.current) {
            playerRef.current = new window.YT.Player(containerRef.current, {
                videoId: youtubeId,
                playerVars: {
                    autoplay: 1,
                    mute: 1, // Required for autoplay
                    controls: 0,
                    disablekb: 1,
                    fs: 0,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    playsinline: 1
                },
                events: {
                    onReady: (event) => {
                        event.target.playVideo();
                    },
                    onStateChange: (event) => {
                        if (event.data === window.YT.PlayerState.ENDED) {
                            setIsFading(true);
                            setTimeout(() => {
                                navigate('/eneagrama-advanced-analysis-result');
                            }, 800);
                        }
                    },
                    onError: (event) => {
                        console.error('YouTube Player Error', event);
                        setVideoError(true);
                    }
                }
            });
        }
        
        // Cleanup when component unmounts or ID changes
        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [ytReady, youtubeId, navigate]);

    if (!type || !youtubeId) {
        return (
            <div className="video-intro-page">
                <div style={{ color: 'white', textAlign: 'center' }}>
                    <p>Cargando información del resultado...</p>
                    <button className="al-btn-main" onClick={handleSkip} style={{ marginTop: '20px' }}>
                        VER RESULTADO
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`video-intro-page ${isFading ? 'fade-out-active' : ''}`}>
            <div className="video-fade-overlay"></div>

            <div className="video-controls-overlay">
                {!isFading && (
                    <button className="skip-video-btn" onClick={handleSkip} style={{ zIndex: 100 }}>
                        {videoError ? 'IR AL RESULTADO' : 'SALTAR'}
                    </button>
                )}
            </div>

            <div className="youtube-player-container" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none' // Prevent user from interacting with video
            }}>
                <div ref={containerRef} style={{ width: '100%', height: '100%' }}></div>
            </div>

            {videoError && (
                <div className="error-overlay">
                    <p>Ocurrió un problema reproduciendo la introducción.</p>
                    <button className="al-btn-main" onClick={handleSkip} style={{ marginTop: '20px', padding: '12px 30px' }}>
                        CONTINUAR AL RESULTADO
                    </button>
                </div>
            )}
        </div>
    );
};

export default ResultVideoIntro;
