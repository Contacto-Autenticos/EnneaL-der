import React, { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';
import './FloatingScrollToTop.css';

const FloatingScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Hide on specific pages where it overlaps with other buttons
    const excludedPages = ['/dominios-landing', '/eneagrama-landing'];
    if (excludedPages.includes(window.location.pathname)) {
        return null;
    }

    // Show button when page is scrolled down
    const checkScroll = () => {
        const scrollY = window.scrollY || (document.documentElement && document.documentElement.scrollTop) || 0;
        let maxScroll = scrollY;

        // Also check all known scrollable containers
        const containers = document.querySelectorAll('.advanced-result-page, .advanced-landing-container, .result-page, #root > div, main, .App');

        containers.forEach(c => {
            if (c && typeof c.scrollTop === 'number' && c.scrollTop > maxScroll) {
                maxScroll = c.scrollTop;
            }
        });

        if (maxScroll > 150) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    // Set the top cordinate to 0
    // make scrolling smooth
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        // Scroll any matching full-page scrollable containers
        const scrollContainers = document.querySelectorAll('.advanced-result-page, .advanced-landing-container, .result-page, #root > div');
        scrollContainers.forEach(container => {
            if (container && typeof container.scrollTo === 'function' && typeof container.scrollTop === 'number' && container.scrollTop > 0) {
                try {
                    container.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });
                } catch (e) {
                    console.warn("Scroll to top failed for container:", e);
                }
            }
        });
    };

    useEffect(() => {
        // Use capture phase to catch scroll events from embedded scroll containers
        window.addEventListener("scroll", checkScroll, true);

        // Initial check
        checkScroll();

        return () => window.removeEventListener("scroll", checkScroll, true);
    }, []);

    return (
        <div className="floating-scroll-to-top">
            {isVisible && (
                <button
                    onClick={scrollToTop}
                    className="scroll-btn"
                    aria-label="Volver arriba"
                >
                    <ChevronUp size={28} className="scroll-icon" />
                </button>
            )}
        </div>
    );
};

export default FloatingScrollToTop;
