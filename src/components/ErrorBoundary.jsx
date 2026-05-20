import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (e) {
        console.error("Error in ErrorBoundary onError callback:", e);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{ 
          padding: '30px', 
          textAlign: 'center', 
          color: '#ffffff', 
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px dashed rgba(221, 190, 61, 0.3)',
          borderRadius: '16px',
          maxWidth: '500px',
          margin: '20px auto'
        }}>
          <h3 style={{ color: '#ddbe3d', fontSize: '18px', fontWeight: '800', marginBottom: '10px' }}>
            Vista previa no disponible
          </h3>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', lineHeight: '1.6' }}>
            Hubo un problema al cargar el visor interactivo. Puedes continuar explorando el resto de la página normalmente.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
