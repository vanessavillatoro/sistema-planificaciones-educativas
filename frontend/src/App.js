import React from 'react';
// importación de estilos opcional
// import './App.css'; 

function App() {
  
  /**
   * Función Asíncrona para llamar al endpoint de prueba del Backend.
   */
  const probarApi = async () => {
    
    console.log('Intentando llamar a http://localhost:5000/api/test...');
    
    try {
      // 1. Ejecutar el fetch (la solicitud GET)
      const response = await fetch('http://localhost:5000/api/test'); 
      
      // 2. Esperar y parsear la respuesta JSON
      const data = await response.json(); 

      // 3. Verificar si la respuesta fue exitosa (código 200-299)
      if (response.ok) {
        console.log('Respuesta de la API:', data);
        alert(`API funcionando. Mensaje: ${data.message}`);
      } else {
        // Manejar códigos de error del servidor (ej. 404, 500)
        console.error('Error del servidor:', data);
        alert(`Error en la API. Código: ${response.status}. Mensaje: ${data.message || 'Error desconocido.'}`);
      }

    } catch (error) {
      // Manejar errores de red (ej. CORS, o el backend no está corriendo)
      console.error('Error de conexión de red/CORS:', error);
      alert(`Error de Conexión.  el backend debe correr en localhost:5000 y que CORS esté configurado.`);
    }
  };

  return (
    <div className="App">
      <header className="App-header" style={{ textAlign: 'center', padding: '50px' }}>
        
        <h1>Sistema de Planificaciones</h1>
        
        {/* Botón que ejecuta la función fetch al hacer click */}
        <button 
          onClick={probarApi} 
          style={{ 
            padding: '12px 25px', 
            fontSize: '18px', 
            cursor: 'pointer',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            marginTop: '30px'
          }}
        >
          Probar API
        </button>

      </header>
    </div>
  );
}

export default App;
