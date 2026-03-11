import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Analytics = () => {
    const location = useLocation();

    useEffect(() => {
        // Enviar evento de vista de página para Google Analytics 4
        if (typeof window.gtag === 'function') {
            window.gtag('config', 'G-8GMEDNBSZP', {
                page_path: location.pathname + location.search,
                page_title: document.title,
            });
        }

        // Enviar evento custom "pageview" a Google Tag Manager
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            event: 'pageview',
            page_path: location.pathname + location.search,
            page_title: document.title,
        });
    }, [location]);

    return null;
};

export default Analytics;
