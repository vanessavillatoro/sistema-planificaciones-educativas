import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const NavDropdown = () => {
  const [show, setShow] = useState(false);
  const dropdownRef = useRef(null);

  const handleItemClick = () => setShow(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShow(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`nav-dropdown ${show ? 'active' : ''}`} ref={dropdownRef}>
      <button className="nav-dropbtn" onClick={() => setShow(!show)}>
        Herramientas <span className="arrow-small"></span>
      </button>
      
      {show && (
        <div className="nav-dropdown-content">
          <Link to="/planificaciones" onClick={handleItemClick}>
            Generador de planificaciones
          </Link>
          <Link to="/recursos" onClick={handleItemClick}>
            Generador de recursos
          </Link>
          {/* Único cambio: la ruta debe ser /gestion para que cargue el componente */}
          <Link to="/gestion" onClick={handleItemClick}>
            Gestor de recursos y planificaciones
          </Link>
        </div>
      )}
    </div>
  );
};

export default NavDropdown;