import React from 'react';
import { questions } from '../data/questions';

const Admin = () => {
    return (
        <div className="container">
            <h1 style={{ marginBottom: '20px' }}>Panel de Administración</h1>
            <p style={{ marginBottom: '20px' }}>Gestión de preguntas y configuración (Versión V1)</p>

            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: 'var(--shadow-sm)' }}>
                <h2 style={{ marginBottom: '15px' }}>Preguntas Activas ({questions.length})</h2>
                <div style={{ display: 'grid', gap: '10px' }}>
                    {questions.map((q) => (
                        <div key={q.id} style={{
                            padding: '10px',
                            borderBottom: '1px solid #eee',
                            display: 'flex',
                            gap: '10px'
                        }}>
                            <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{q.id}.</span>
                            <span style={{ flex: 1 }}>{q.text}</span>
                            <span style={{
                                backgroundColor: '#f0f0f0',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.9rem'
                            }}>
                                Tipo {q.type}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Admin;
