import React from 'react';

const BusinessReportTemplate = ({ data }) => {
  if (!data) return null;

  const goldColor = '#c39a22';
  const navyColor = '#002d44';

  const sectionHeaderStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: goldColor,
    borderBottom: `2px solid ${goldColor}`,
    paddingBottom: '5px',
    marginTop: '30px',
    marginBottom: '15px'
  };

  const labelStyle = {
    fontWeight: 'bold',
    color: navyColor,
    width: '200px',
    display: 'inline-block'
  };

  const rowStyle = {
    marginBottom: '8px',
    fontSize: '14px',
    lineHeight: '1.5'
  };

  return (
    <div className="pdf-page" style={{ padding: '40px', backgroundColor: '#fff', minHeight: '297mm', position: 'relative', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ margin: 0, color: navyColor, fontSize: '24px' }}>REPORTE DE DIAGNÓSTICO</h1>
          <h2 style={{ margin: 0, color: goldColor, fontSize: '20px' }}>Escaneo Empresarial</h2>
        </div>
        <img src="/logo-moneda.png" alt="Auténticos" style={{ height: '60px' }} />
      </div>

      <div style={{ fontSize: '12px', color: '#666', marginBottom: '20px' }}>
        Fecha de realización: {new Date(data.created_at).toLocaleString()}
      </div>

      {/* S1. Información General */}
      <div style={sectionHeaderStyle}>S1. INFORMACIÓN GENERAL</div>
      <div style={rowStyle}><span style={labelStyle}>Empresa:</span> {data.company_name}</div>
      <div style={rowStyle}><span style={labelStyle}>Industria:</span> {data.industry}</div>
      <div style={rowStyle}><span style={labelStyle}>Colaboradores:</span> {data.employee_count}</div>
      <div style={rowStyle}><span style={labelStyle}>Ubicación:</span> {data.location} ({data.coverage})</div>
      <div style={rowStyle}><span style={labelStyle}>Solicitante:</span> {data.resp_name}</div>
      <div style={rowStyle}><span style={labelStyle}>Cargo:</span> {data.resp_role}</div>
      <div style={rowStyle}><span style={labelStyle}>Email:</span> {data.email}</div>
      <div style={rowStyle}><span style={labelStyle}>Teléfono:</span> {data.phone}</div>
      <div style={rowStyle}><span style={labelStyle}>Área Intervención:</span> {data.intervention_area}</div>

      {/* S2. Contexto Estratégico */}
      <div style={sectionHeaderStyle}>S2. CONTEXTO ESTRATÉGICO</div>
      <div style={rowStyle}><span style={labelStyle}>Desafíos:</span> {data.challenges || 'No especificado'}</div>
      <div style={rowStyle}><span style={labelStyle}>Cambios:</span> {data.changes || 'No especificado'}</div>
      <div style={rowStyle}><span style={labelStyle}>Objetivos:</span> {data.goals || 'No especificado'}</div>
      <div style={rowStyle}><span style={labelStyle}>Prioridades:</span> {data.priorities ? data.priorities.join(', ') : 'Ninguna'}</div>
      <div style={rowStyle}><span style={labelStyle}>Resultados Esperados:</span> {data.expected_results || 'No especificado'}</div>

      {/* S3. Necesidades y Brechas */}
      <div style={sectionHeaderStyle}>S3. NECESIDADES Y BRECHAS</div>
      <div style={rowStyle}><span style={labelStyle}>Problemas Desempeño:</span> {data.performance_issues || 'No especificado'}</div>
      <div style={rowStyle}><span style={labelStyle}>Áreas con Brechas:</span> {data.area_breaches || 'No especificado'}</div>
      <div style={rowStyle}><span style={labelStyle}>Habilidades Faltantes:</span> {data.missing_skills || 'No especificado'}</div>
      <div style={rowStyle}><span style={labelStyle}>Urgencia:</span> {data.urgency}</div>
      <div style={rowStyle}><span style={labelStyle}>Consecuencias:</span> {data.consequences ? data.consequences.join(', ') : 'No especificado'}</div>
      
      <div style={{ marginTop: '15px' }}>
        <strong>Autoevaluación de Brechas (1-5):</strong>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginTop: '10px' }}>
          {data.breaches_scores && Object.entries(data.breaches_scores).map(([k, v]) => (
            <div key={k} style={{ fontSize: '13px' }}>
              <span style={{ textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}:</span> <strong>{v}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: '40px', left: '40px', right: '40px', borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'center' }}>
        <p style={{ color: navyColor, fontWeight: 'bold', margin: 0 }}>Auténticos - Consultoría de Liderazgo y Cultura</p>
        <p style={{ color: '#666', fontSize: '12px', margin: '5px 0 0' }}>www.autenticos.co</p>
      </div>
    </div>
  );
};

export default BusinessReportTemplate;
