import React from 'react';
import './acerca.css';

const AcercaDeNosotros = ({ darkMode }) => {
  return (
    <div className={`acerca-container ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <header className="acerca-header">
        <h1>Acerca de Nosotros</h1>
        <h3>Complejo Educativo Félix Castillo</h3>
      </header>

      <section className="acerca-content">
        <p>
          Bienvenidos a la plataforma oficial del <strong>Complejo Educativo Félix Castillo</strong>. 
          Este sistema ha sido desarrollado por <strong>Villatoro's Solutions</strong> como una herramienta 
          estratégica para modernizar la gestión pedagógica y administrativa de nuestra institución durante el ciclo 2026.
        </p>

        <div className="table-wrapper">
  <table className="tabla-institucional-pro">
    <thead>
      <tr>
        <th>Categoría Institucional</th>
        <th>Información Detallada</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Institución</strong></td>
        <td>Complejo Educativo Félix Castillo</td>
      </tr>
      <tr>
        <td><strong>Desarrollador</strong></td>
        <td>Villatoro's Solutions</td>
      </tr>
      <tr>
        <td><strong>Propósito del Sistema</strong></td>
        <td>Generar recursos y planificaciones.</td>
      </tr>
      <tr>
        <td><strong>Versión y Formato</strong></td>
        <td>v1.0.0 — Estándar Módulo 1</td>
      </tr>
      <tr>
        <td><strong>Certificación PDF</strong></td>
        <td>Optimizado para visibilidad total de recursos.</td>
      </tr>
    </tbody>
  </table>
</div>

        <div className="acerca-footer-text">
          <p>
            Nuestro compromiso es la adaptabilidad. Entendemos que los <strong>objetivos e indicadores 
            no siempre serán los mismos</strong>, por lo que este sistema ofrece la flexibilidad necesaria 
            para cada nivel educativo sin alterar la estructura profesional de nuestros reportes.
          </p>
        </div>
      </section>
    </div>
  );
};

export default AcercaDeNosotros;