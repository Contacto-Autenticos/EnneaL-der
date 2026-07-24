import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { extractTextFromPPTX } from '../utils/pptxParser';
import './Presentations.css';

const PresentationsDashboard = () => {
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTopic, setNewTopic] = useState('');
  const [pptxFile, setPptxFile] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPresentations();
  }, []);

  const fetchPresentations = async () => {
    setLoading(true);
    const savedAuth = localStorage.getItem('adminAuth');
    if (savedAuth !== 'true') {
      setError("Debes iniciar sesión en /admin para usar este módulo.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('presentations')
      .select('id, title, created_at')
      .order('created_at', { ascending: false });

    if (error) setError(error.message);
    else setPresentations(data || []);
    
    setLoading(false);
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!newTopic.trim() && !pptxFile) return;
    
    setIsCreating(true);
    setError(null);

    try {
      const savedAuth = localStorage.getItem('adminAuth');
      if (savedAuth !== 'true') throw new Error("Debes iniciar sesión en /admin para generar presentaciones.");

      let requestBody = { topic: newTopic };

      if (pptxFile) {
        // Extraer texto del PPTX
        const extractedText = await extractTextFromPPTX(pptxFile);
        requestBody = { 
          topic: pptxFile.name,
          pptxText: extractedText 
        };
      }

      // 1. Llamar a la Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('generate-presentation', {
        body: requestBody
      });

      if (functionError) throw functionError;
      if (data.error) throw new Error(data.error);

      // 2. Guardar en la Base de Datos
      const { data: insertData, error: insertError } = await supabase
        .from('presentations')
        .insert([{
          title: pptxFile ? pptxFile.name : newTopic,
          slides: data.presentation.slides
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      // 3. Redirigir al editor
      navigate(`/presentaciones/editor/${insertData.id}`);

    } catch (err) {
      setError(err.message || "Error al generar presentación");
      setIsCreating(false);
    }
  };

  return (
    <div className="presentations-layout">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Mis Presentaciones</h1>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <div className="create-box">
          <h2>Generar Nueva Presentación con IA</h2>
          <form onSubmit={handleGenerate} className="create-form">
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input 
                type="text"
                className="create-input"
                placeholder="Ej: Charla de 45 mins sobre Liderazgo Consciente y Eneagrama"
                value={newTopic}
                onChange={(e) => {
                  setNewTopic(e.target.value);
                  if (pptxFile) setPptxFile(null);
                }}
                disabled={isCreating || pptxFile !== null}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#6b7280' }}>
                <span>O sube un PPTX antiguo:</span>
                <input 
                  type="file" 
                  accept=".pptx"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setPptxFile(file || null);
                    if (file) setNewTopic('');
                  }}
                  disabled={isCreating}
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="btn-primary"
              style={{ alignSelf: 'flex-start' }}
              disabled={isCreating || (!newTopic.trim() && !pptxFile)}
            >
              {isCreating ? 'Generando (toma unos segundos)...' : '✨ Generar con IA'}
            </button>
          </form>
        </div>

        <h2 className="dashboard-title" style={{fontSize: '20px', marginBottom: '16px'}}>Presentaciones Guardadas</h2>
        {loading ? (
          <p style={{color: '#6b7280'}}>Cargando...</p>
        ) : presentations.length === 0 ? (
          <div className="empty-state">Aún no has creado ninguna presentación. Escribe un tema arriba para empezar.</div>
        ) : (
          <div className="presentations-grid">
            {presentations.map((pres) => (
              <div key={pres.id} className="presentation-card" onClick={() => navigate(`/presentaciones/editor/${pres.id}`)}>
                <h3>{pres.title}</h3>
                <p>Creado el: {new Date(pres.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PresentationsDashboard;
