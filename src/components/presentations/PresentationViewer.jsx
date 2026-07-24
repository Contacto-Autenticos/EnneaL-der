import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SlideRenderer } from './SlideLayouts';
import './PresentationViewer.css';

const PresentationViewer = ({ presentation, onClose }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const containerRef = useRef(null);
  
  const slides = presentation?.slides || [];
  const totalSlides = slides.length;

  // Manejar navegación con teclado
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowRight' || e.key === 'Space' || e.key === 'Enter' || e.key === 'PageDown') {
      setCurrentSlideIndex((prev) => Math.min(prev + 1, totalSlides - 1));
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      setCurrentSlideIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Escape') {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
      if (onClose) onClose();
    }
  }, [totalSlides, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Pantalla completa
  const toggleFullScreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error al intentar activar pantalla completa: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  if (totalSlides === 0) {
    return <div className="p-10 text-center text-white bg-gray-900">No hay diapositivas en esta presentación.</div>;
  }

  const currentSlide = slides[currentSlideIndex];

  return (
    <div className="presentation-viewer-wrapper" ref={containerRef}>
      {/* Botones de control (visibles solo cuando se mueve el mouse, o siempre en una barra superior) */}
      <div className="presentation-controls">
        <button className="bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 mr-2" onClick={toggleFullScreen}>
          ⛶ Pantalla Completa
        </button>
        {onClose && (
          <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700" onClick={onClose}>
            ✕ Cerrar Visor
          </button>
        )}
        <div className="ml-auto bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
          {currentSlideIndex + 1} / {totalSlides}
        </div>
      </div>

      <div className="presentation-viewport">
        {/* Aquí se inyecta la diapositiva actual */}
        <div className="slide-scale-wrapper">
           <SlideRenderer slide={currentSlide} editorMode={false} />
        </div>
      </div>
      
      {/* Botones de navegación móviles / mouse */}
      <button 
        className="nav-btn prev-btn" 
        onClick={() => setCurrentSlideIndex((prev) => Math.max(prev - 1, 0))}
        disabled={currentSlideIndex === 0}
      >
        &#10094;
      </button>
      <button 
        className="nav-btn next-btn" 
        onClick={() => setCurrentSlideIndex((prev) => Math.min(prev + 1, totalSlides - 1))}
        disabled={currentSlideIndex === totalSlides - 1}
      >
        &#10095;
      </button>
    </div>
  );
};

export default PresentationViewer;
