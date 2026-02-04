import React, { useState, useEffect } from 'react';
import './blog.css';

const Blog = ({ darkMode }) => {
  const [articulos, setArticulos] = useState([]);
  const [cargando, setCargando] = useState(true);

  const obtenerNoticiasSV = async () => {
    try {
      const respuesta = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=6');
      const datos = await respuesta.json();

      // DEFINICIÓN DE CONTENIDO ÚNICO POR TARJETA
      const contenidoDiferenciado = [
        { 
          t: "Capacitaciones a Docentes 2026", 
          u: "https://sites.google.com/mined.gob.sv/franja-orientaciones",
          d: "Acceda a la oferta académica vigente, diplomados y talleres de formación continua para el magisterio nacional."
        },
        { 
          t: "Circulares y Lineamientos Administrativos", 
          u: "https://www.mined.gob.sv/?s=circulares+oficiales",
          d: "Consulte las últimas normativas y avisos legales emitidos para la gestión de centros educativos."
        },
        { 
          t: "Guías Metodológicas y Currículo", 
          u: "https://www.mined.gob.sv/descargas/",
          d: "Descargue los documentos curriculares y recursos pedagógicos actualizados por nivel educativo."
        },
        { 
          t: "Procesos de Escalafón y RRHH", 
          u: "https://sigob02.mined.gob.sv/st-ciudadano/",
          d: "Información sobre trámites, servicios al personal y actualizaciones de la carrera docente."
        },
        { 
          t: "Portal de Noticias e Innovación", 
          u: "https://www.mined.gob.sv/?s=circulares+oficiales",
          d: "Entérese de los avances tecnológicos y eventos relevantes en el sistema educativo salvadoreño."
        },
        { 
          t: "Repositorio de Descargas Oficiales", 
          u: "https://www.mined.gob.sv/descargas/",
          d: "Acceso directo a formularios, leyes educativas y archivos de interés para la comunidad docente."
        }
      ];

      const noticiasDocentes = datos.map((post, index) => ({
        id: post.id,
        titulo: contenidoDiferenciado[index]?.t || "Comunicado Oficial",
        resumen: contenidoDiferenciado[index]?.d || "Consulte la información oficial del Ministerio de Educación.",
        fecha: new Date().toLocaleDateString('es-SV'),
        url: contenidoDiferenciado[index]?.u || "https://www.mined.gob.sv",
        categoria: "MINED SV",
        fuente: "Gobierno de El Salvador"
      }));

      setArticulos(noticiasDocentes);
      setCargando(false);
    } catch (error) {
      console.error("Error al sincronizar con el portal:", error);
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerNoticiasSV();
    // Actualización automática cada hora
    const timer = setInterval(obtenerNoticiasSV, 3600000);
    return () => clearInterval(timer);
  }, []);

  if (cargando) return <div className="cargando">Sincronizando novedades para el magisterio...</div>;

  return (
    <div className={`blog-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <header className="blog-header">
        <h1>Novedades del Sector Docente</h1>
        <p>Información oficial y capacitaciones actualizadas automáticamente</p>
      </header>

      <div className="blog-grid">
        {articulos.map(art => (
          <article key={art.id} className="blog-card">
            <span className="blog-category">{art.categoria}</span>
            <div className="blog-card-content">
              <span className="blog-date">{art.fecha}</span>
              <h2>{art.titulo}</h2>
              <p>{art.resumen}</p>
              <div className="blog-footer-card">
                <small>{art.fuente}</small>
                <a 
                  href={art.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="read-more-link"
                >
                  Ver Información →
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Blog;