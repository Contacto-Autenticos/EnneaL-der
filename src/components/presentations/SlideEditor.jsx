import React from 'react';

const SlideEditor = ({ slide, onUpdate }) => {
  if (!slide || !slide.content) return null;

  const handleChange = (field, value) => {
    onUpdate({
      ...slide,
      content: {
        ...slide.content,
        [field]: value
      }
    });
  };

  return (
    <div>
      <h3 className="prop-editor-title">Editar Diapositiva</h3>
      <div className="prop-group">
        <label className="prop-label">Tipo de Layout</label>
        <span className="prop-tag">{slide.type}</span>
      </div>

      {/* Editor dinámico basado en las propiedades que existan */}
      {slide.content.title !== undefined && (
        <div className="prop-group">
          <label className="prop-label">Título</label>
          <textarea 
            className="prop-input"
            rows="2"
            value={slide.content.title}
            onChange={(e) => handleChange('title', e.target.value)}
          />
        </div>
      )}

      {slide.content.subtitle !== undefined && (
        <div className="prop-group">
          <label className="prop-label">Subtítulo</label>
          <textarea 
            className="prop-input"
            rows="2"
            value={slide.content.subtitle}
            onChange={(e) => handleChange('subtitle', e.target.value)}
          />
        </div>
      )}

      {slide.content.text !== undefined && (
        <div className="prop-group">
          <label className="prop-label">Texto Principal</label>
          <textarea 
            className="prop-input"
            rows="4"
            value={slide.content.text}
            onChange={(e) => handleChange('text', e.target.value)}
          />
        </div>
      )}
      
      <p className="prop-hint">
        * Cualquier cambio se refleja instantáneamente en la previsualización.
      </p>
    </div>
  );
};

export default SlideEditor;
