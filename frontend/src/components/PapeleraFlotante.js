import React, { useState, useEffect, useRef, useCallback } from 'react';
import './PapeleraFlotante.css';

const PapeleraFlotante = ({ darkMode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const modalRef = useRef();

    // URL ÚNICA DE PRODUCCIÓN
    const API_BASE_URL = 'https://sistema-planificaciones-educativas.vercel.app';

    // 1. Fetch de la papelera con la URL correcta
    const fetchPapelera = useCallback(async () => {
        const uId = localStorage.getItem('userId'); 
        if (!uId) return; 

        setLoading(true);
        try {
            // Cambio de localhost a API_BASE_URL
            const res = await fetch(`${API_BASE_URL}/api/papelera?userId=${uId}`);
            if (!res.ok) throw new Error("Error en la respuesta del servidor");
            const data = await res.json();
            setItems(Array.isArray(data) ? data : []); 
        } catch (error) {
            console.error("Error cargando papelera:", error);
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    // 2. Efecto para carga inicial y polling
    useEffect(() => {
        fetchPapelera();
        
        const interval = setInterval(() => {
            fetchPapelera();
        }, 10000);

        return () => clearInterval(interval);
    }, [fetchPapelera]);

    const restaurar = async (id) => {
        if (!window.confirm("¿Deseas restaurar este elemento?")) return;
        try {
            // Cambio de localhost a API_BASE_URL
            await fetch(`${API_BASE_URL}/api/papelera/restaurar/${id}`, { 
                method: 'PATCH' 
            });
            fetchPapelera();
        } catch (error) {
            console.error("Error al restaurar:", error);
        }
    };

    const eliminarPermanente = async (id) => {
        if (!window.confirm("⚠️ ¿Eliminar permanentemente? Esta acción no se puede deshacer.")) return;
        try {
            // Cambio de localhost a API_BASE_URL
            await fetch(`${API_BASE_URL}/api/papelera/permanente/${id}`, { 
                method: 'DELETE' 
            });
            fetchPapelera();
        } catch (error) {
            console.error("Error al eliminar:", error);
        }
    };

    return (
        <div className={`papelera-global-container ${darkMode ? 'dark-mode' : ''}`}>
            <div className={`fab-button ${items.length > 0 ? 'active' : ''}`} onClick={() => setIsOpen(true)}>
                <span className="fab-icon">🗑️</span>
                {items.length > 0 && <span className="fab-badge">{items.length}</span>}
            </div>

            {isOpen && (
                <div className="modal-overlay"> 
                    <div className="papelera-modal-window" ref={modalRef}>
                        <div className="papelera-header">
                            <div className="header-title">
                                <span className="icon">🗑️</span>
                                <h4>Papelera de Reciclaje</h4>
                            </div>
                            <button className="close-btn" onClick={() => setIsOpen(false)}>&times;</button>
                        </div>
                        
                        <div className="papelera-body">
                            {loading && items.length === 0 ? (
                                <div className="loader-container">
                                    <p className="status-msg">Cargando...</p>
                                </div>
                            ) : items.length === 0 ? (
                                <div className="empty-state">
                                    <p className="status-msg">La papelera está vacía</p>
                                </div>
                            ) : (
                                <div className="papelera-grid">
                                    {items.map(item => (
                                        <div key={item._id} className="papelera-card">
                                            <div className="card-info">
                                                <span className="card-tag">{item.origen || "General"}</span>
                                                <p className="card-title">{item.titulo || item.tema || "Sin título"}</p>
                                                <small className="card-meta">{item.materia} {item.grado ? `• ${item.grado}` : ''}</small>
                                            </div>
                                            <div className="card-actions">
                                                <button className="btn-restore" onClick={() => restaurar(item._id)}>Restaurar</button>
                                                <button className="btn-delete" onClick={() => eliminarPermanente(item._id)}>Eliminar</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="papelera-footer">
                            <p>Total: {items.length}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PapeleraFlotante;