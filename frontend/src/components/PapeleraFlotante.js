import React, { useState, useEffect, useRef } from 'react';
import './PapeleraFlotante.css';

const PapeleraFlotante = ({ darkMode }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const modalRef = useRef();

    // Cargar ítems de la papelera
    const fetchPapelera = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/papelera');
            const data = await res.json();
            setItems(data);
        } catch (error) {
            console.error("Error cargando papelera:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPapelera();
        // Polling suave para mantener el contador actualizado
        const interval = setInterval(fetchPapelera, 10000);
        return () => clearInterval(interval);
    }, []);

    const restaurar = async (id) => {
        if (!window.confirm("¿Deseas restaurar este elemento?")) return;
        await fetch(`http://localhost:5000/api/papelera/restaurar/${id}`, { method: 'PATCH' });
        fetchPapelera();
    };

    const eliminarPermanente = async (id) => {
        if (!window.confirm("⚠️ ¿Eliminar permanentemente? Esta acción no se puede deshacer.")) return;
        await fetch(`http://localhost:5000/api/papelera/permanente/${id}`, { method: 'DELETE' });
        fetchPapelera();
    };

    return (
        <div className={`papelera-global-container ${darkMode ? 'dark-mode' : ''}`}>
            {/* Botón Flotante (FAB) - Se mantiene para abrir el modal */}
            <div className={`fab-button ${items.length > 0 ? 'active' : ''}`} onClick={() => setIsOpen(true)}>
                <span className="fab-icon">🗑️</span>
                {items.length > 0 && <span className="fab-badge">{items.length}</span>}
            </div>

            {/* Ventana Emergente (MODAL) */}
            {isOpen && (
                <div className="modal-overlay"> 
                    <div className="papelera-modal-window" ref={modalRef}>
                        <div className="papelera-header">
                            <div className="header-title">
                                <span className="icon">🗑️</span>
                                <h4>Papelera de Reciclaje Global</h4>
                            </div>
                            <button className="close-btn" onClick={() => setIsOpen(false)}>&times;</button>
                        </div>
                        
                        <div className="papelera-body">
                            {loading ? (
                                <div className="loader-container">
                                    <p className="status-msg">Actualizando archivos...</p>
                                </div>
                            ) : items.length === 0 ? (
                                <div className="empty-state">
                                    <p className="status-msg">La papelera está vacía</p>
                                    <span>No hay elementos para restaurar en este momento.</span>
                                </div>
                            ) : (
                                <div className="papelera-grid">
                                    {items.map(item => (
                                        <div key={item._id} className="papelera-card">
                                            <div className="card-info">
                                                <span className="card-tag">{item.origen || "General"}</span>
                                                <p className="card-title">{item.titulo || item.tema || "Documento sin título"}</p>
                                                <small className="card-meta">{item.materia} {item.grado ? `• ${item.grado}` : ''}</small>
                                            </div>
                                            <div className="card-actions">
                                                <button className="btn-restore" onClick={() => restaurar(item._id)} title="Restaurar elemento">
                                                    Restaurar
                                                </button>
                                                <button className="btn-delete" onClick={() => eliminarPermanente(item._id)} title="Eliminar definitivamente">
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        <div className="papelera-footer">
                            <p>Total de elementos: {items.length}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PapeleraFlotante;