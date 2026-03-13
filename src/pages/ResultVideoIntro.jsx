import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResultVideoIntro.css';

const ResultVideoIntro = ({ type }) => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleVideoEnded = () => {
        navigate('/advanced-analysis-result');
    };

    const handleSkip = () => {
        navigate('/advanced-analysis-result');
    };

    const videoSrc = `/videos/Eneatipo-${type}-intro-${isMobile ? 'mobile' : 'desktop'}.mp4`;

    return (
        <div className="video-intro-page">
            <button className="skip-video-btn" onClick={handleSkip}>
                SALTAR
            </button>
            <video
                key={videoSrc}
                ref={videoRef}
                className="intro-video"
                autoPlay
                muted
                playsInline
                onEnded={handleVideoEnded}
            >
                <source 
                    src={videoSrc} 
                    type="video/mp4" 
                />
                Tu navegador no soporta videos.
            </video>
        </div>
    );
};

export default ResultVideoIntro;
