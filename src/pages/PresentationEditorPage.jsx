import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import PresentationViewer from '../components/presentations/PresentationViewer';
import SlideEditor from '../components/presentations/SlideEditor';
import { SlideRenderer } from '../components/presentations/SlideLayouts';
import './Presentations.css';

const PresentationEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [presentation, setPresentation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);

  useEffect(() => {
    fetchPresentation();
  }, [id]);

  const fetchPresentation = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('presentations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(error);
      navigate('/presentaciones');
    } else {
      setPresentation(data);
    }
    setLoading(false);
  };

  const handleUpdateSlide = (updatedSlide) => {
    const newSlides = [...presentation.slides];
    newSlides[currentSlideIndex] = updatedSlide;
    setPresentation({ ...presentation, slides: newSlides });
  };

  const savePresentation = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('presentations')
      .update({ slides: presentation.slides })
      .eq('id', id);
    
    if (error) console.error("Error guardando:", error);
    setSaving(false);
  };

  if (loading) return <div className="presentations-layout"><div style={{padding: '40px', textAlign: 'center'}}>Cargando presentación...</div></div>;
  if (!presentation) return <div className="presentations-layout"><div style={{padding: '40px', textAlign: 'center'}}>No se encontró la presentación.</div></div>;

  if (isPresenting) {
    return (
      <PresentationViewer 
        presentation={presentation} 
        onClose={() => setIsPresenting(false)} 
      />
    );
  }

  const currentSlide = presentation.slides[currentSlideIndex];

  return (
    <div className="editor-layout">
      {/* Barra superior de herramientas */}
      <div className="editor-toolbar">
        <div className="toolbar-group">
          <button onClick={() => navigate('/presentaciones')} className="btn-back">
            ← Volver
          </button>
          <h1>{presentation.title}</h1>
        </div>
        <div className="toolbar-group">
          <button 
            onClick={savePresentation}
            disabled={saving}
            className="btn-secondary"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button 
            onClick={() => setIsPresenting(true)}
            className="btn-gold"
          >
            ► Presentar
          </button>
        </div>
      </div>

      {/* Navegador de diapositivas (Izquierda) */}
      <div className="sidebar-left">
        <div className="sidebar-header">
          Diapositivas ({presentation.slides.length})
        </div>
        <div className="slide-list">
          {presentation.slides.map((slide, index) => (
            <div 
              key={index}
              onClick={() => setCurrentSlideIndex(index)}
              className={`slide-item ${currentSlideIndex === index ? 'active' : ''}`}
            >
              <div className="slide-item-label">Slide {index + 1}</div>
              <div className="slide-item-title">
                {slide.content?.title ? slide.content.title.replace(/<[^>]+>/g, '') : `[Sin título] - ${slide.type}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Área central de previsualización */}
      <div className="editor-center">
         {/* Simulador de aspecto 16:9 */}
         <div className="preview-container">
            <div style={{transform: 'scale(1)', transformOrigin: 'top left', width: '100%', height: '100%'}}>
               {currentSlide && <SlideRenderer slide={currentSlide} editorMode={true} />}
            </div>
         </div>
      </div>

      {/* Editor Lateral (Derecha) */}
      <div className="sidebar-right">
        <SlideEditor slide={currentSlide} onUpdate={handleUpdateSlide} />
      </div>
    </div>
  );
};

export default PresentationEditorPage;
