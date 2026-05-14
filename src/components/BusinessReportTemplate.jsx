import React from 'react';

const BusinessReportTemplate = ({ data }) => {
  if (!data) return null;

  const goldColor = '#c39a22';
  const navyColor = '#002d44';

  const sectionHeaderStyle = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: goldColor,
    borderBottom: `1px solid ${goldColor}`,
    paddingBottom: '3px',
    marginTop: '20px',
    marginBottom: '10px'
  };

  const labelStyle = {
    fontWeight: 'bold',
    color: navyColor,
    width: '200px',
    display: 'inline-block',
    fontSize: '12px'
  };

  const rowStyle = {
    marginBottom: '5px',
    fontSize: '12px',
    lineHeight: '1.4'
  };

  return (
    <div className="pdf-page" style={{ padding: '30px', backgroundColor: '#fff', minHeight: '297mm', position: 'relative', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, color: navyColor, fontSize: '20px' }}>REPORTE DE DIAGNÓSTICO</h1>
          <h2 style={{ margin: 0, color: goldColor, fontSize: '16px' }}>Escaneo Empresarial</h2>
        </div>
        <img src="/logo-moneda.png" alt="Auténticos" style={{ height: '50px' }} />
      </div>

      <div style={{ fontSize: '10px', color: '#666', marginBottom: '15px' }}>
        Fecha de realización: {new Date(data.created_at).toLocaleString()}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          {/* S1. Información General */}
          <div style={sectionHeaderStyle}>S1. INFORMACIÓN GENERAL</div>
          <div style={rowStyle}><span style={labelStyle}>Empresa:</span> {data.company_name}</div>
          <div style={rowStyle}><span style={labelStyle}>Solicitante:</span> {data.resp_name} {data.resp_lastname}</div>
          <div style={rowStyle}><span style={labelStyle}>Cargo:</span> {data.resp_role}</div>
          <div style={rowStyle}><span style={labelStyle}>Área Intervención:</span> {data.intervention_area}</div>
          <div style={rowStyle}><span style={labelStyle}>Nivel Interés:</span> {data.org_level}</div>

          {/* S2. Contexto Estratégico */}
          <div style={sectionHeaderStyle}>S2. CONTEXTO ESTRATÉGICO</div>
          <div style={rowStyle}><span style={labelStyle}>Desafíos:</span> {data.challenges}</div>
          <div style={rowStyle}><span style={labelStyle}>Prioridades:</span> {data.priorities ? data.priorities.join(', ') : 'Ninguna'}</div>

          {/* S3. Necesidades y Brechas */}
          <div style={sectionHeaderStyle}>S3. NECESIDADES Y BRECHAS</div>
          <div style={rowStyle}><span style={labelStyle}>Urgencia:</span> {data.urgency}</div>
          <div style={rowStyle}><span style={labelStyle}>Consecuencias:</span> {data.consequences ? data.consequences.join(', ') : 'Ninguna'}</div>
          
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '12px', color: navyColor }}>Brechas (1-5):</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px', marginTop: '5px' }}>
              {data.breaches_scores && Object.entries(data.breaches_scores).map(([k, v]) => (
                <div key={k} style={{ fontSize: '10px' }}>
                  <span style={{ textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}:</span> <strong>{v}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          {/* S4. Cultura y Cambio */}
          <div style={sectionHeaderStyle}>S4. CULTURA Y CAMBIO</div>
          <div style={rowStyle}><span style={labelStyle}>Disposición Cambio:</span> {data.change_readiness}/5</div>
          <div style={rowStyle}><span style={labelStyle}>Compromiso Líderes:</span> {data.leadership_commitment}/5</div>

          {/* S5. Población Objetivo */}
          <div style={sectionHeaderStyle}>S5. POBLACIÓN OBJETIVO</div>
          <div style={rowStyle}><span style={labelStyle}>Público:</span> {data.target_public ? data.target_public.join(', ') : 'No especificado'}</div>
          <div style={rowStyle}><span style={labelStyle}>Participantes:</span> {data.participant_count}</div>

          {/* S6. Formato y Logística */}
          <div style={sectionHeaderStyle}>S6. FORMATO Y LOGÍSTICA</div>
          <div style={rowStyle}><span style={labelStyle}>Modalidad:</span> {data.preferred_modality}</div>
          <div style={rowStyle}><span style={labelStyle}>Duración:</span> {data.ideal_duration}</div>
          <div style={rowStyle}><span style={labelStyle}>Restricciones:</span> {data.logistics_restrictions ? data.logistics_restrictions.join(', ') : 'Ninguna'}</div>
          {data.logistics_description && (
            <div style={{ ...rowStyle, fontStyle: 'italic', color: '#555' }}>
              <strong>Detalles:</strong> {data.logistics_description}
            </div>
          )}

          {/* S7. Presupuesto y Decisión */}
          <div style={sectionHeaderStyle}>S7. PRESUPUESTO Y DECISIÓN</div>
          <div style={rowStyle}><span style={labelStyle}>Rango Inversión:</span> {data.investment_range}</div>
          <div style={rowStyle}><span style={labelStyle}>Factores Decisión:</span> {data.decision_factors || 'No especificado'}</div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: '30px', left: '30px', right: '30px', borderTop: '1px solid #eee', paddingTop: '15px', textAlign: 'center' }}>
        <p style={{ color: navyColor, fontWeight: 'bold', margin: 0, fontSize: '12px' }}>Auténticos - Consultoría de Liderazgo y Cultura</p>
        <p style={{ color: '#666', fontSize: '10px', margin: '3px 0 0' }}>www.autenticos.co</p>
      </div>
    </div>
  );
};

export default BusinessReportTemplate;
