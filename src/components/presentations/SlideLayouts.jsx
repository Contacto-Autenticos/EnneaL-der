import React from 'react';
import './SlideLayouts.css';

// Componente Base con pie de página y zona segura
const SlideBase = ({ children, editorMode = false }) => {
  return (
    <div className={`slide-container ${editorMode ? 'editor-mode' : ''}`}>
      {children}
      
      <div className="slide-footer">
        <div className="slide-footer-bar-dark">
          <span className="slide-footer-logo">AUTÉNTICOS</span>
        </div>
        <div className="slide-footer-bar-gold"></div>
      </div>

      <div className="camera-safe-zone"></div>
    </div>
  );
};

export const CoverSlide = ({ content, editorMode }) => {
  return (
    <SlideBase editorMode={editorMode}>
      <div className="slide-cover">
        <div className="slide-cover-content">
          <h1 className="slide-cover-title" dangerouslySetInnerHTML={{ __html: content.title }}></h1>
          {content.subtitle && <p className="slide-cover-subtitle">{content.subtitle}</p>}
        </div>
        {content.imageUrl && (
          <div 
            className="slide-cover-bg" 
            style={{ backgroundImage: `url(${content.imageUrl})` }}
          ></div>
        )}
      </div>
    </SlideBase>
  );
};

export const SplitSlide = ({ content, editorMode }) => {
  return (
    <SlideBase editorMode={editorMode}>
      <div className="slide-split">
        <div className="slide-split-text">
          {content.badge && <span className="slide-split-badge">{content.badge}</span>}
          <h2 className="slide-split-title" dangerouslySetInnerHTML={{ __html: content.title }}></h2>
          <p className="slide-split-desc">{content.text}</p>
        </div>
        <div 
          className="slide-split-image" 
          style={{ backgroundImage: `url(${content.imageUrl || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'})` }}
        ></div>
      </div>
    </SlideBase>
  );
};

export const TimelineSlide = ({ content, editorMode }) => {
  return (
    <SlideBase editorMode={editorMode}>
      <div className="slide-timeline">
        <h2 className="slide-timeline-title">{content.title}</h2>
        <div className="slide-timeline-track">
          <div className="slide-timeline-line"></div>
          {content.steps && content.steps.map((step, index) => (
            <div className="slide-timeline-step" key={index}>
              <div className="slide-timeline-number">{step.step || index + 1}</div>
              <div className="slide-timeline-label">{step.label}</div>
            </div>
          ))}
        </div>
      </div>
    </SlideBase>
  );
};

export const IconGridSlide = ({ content, editorMode }) => {
  return (
    <SlideBase editorMode={editorMode}>
      <div className="slide-icon-grid">
        <h2 className="slide-icon-grid-title">{content.title}</h2>
        <div className="slide-icon-grid-content">
          {content.items && content.items.map((item, index) => (
            <div className="slide-icon-item" key={index}>
              <div className="slide-icon-circle">
                {item.icon || '✨'}
              </div>
              <div className="slide-icon-label">{item.title}</div>
              {item.text && <div className="slide-icon-desc">{item.text}</div>}
            </div>
          ))}
        </div>
      </div>
    </SlideBase>
  );
};

// Mapa de componentes para renderizado dinámico
export const SlideRenderer = ({ slide, editorMode }) => {
  switch (slide.type) {
    case 'cover':
      return <CoverSlide content={slide.content} editorMode={editorMode} />;
    case 'split_image':
      return <SplitSlide content={slide.content} editorMode={editorMode} />;
    case 'timeline':
      return <TimelineSlide content={slide.content} editorMode={editorMode} />;
    case 'icon_grid':
      return <IconGridSlide content={slide.content} editorMode={editorMode} />;
    default:
      return <div style={{padding: '50px'}}>Tipo de slide desconocido: {slide.type}</div>;
  }
};
