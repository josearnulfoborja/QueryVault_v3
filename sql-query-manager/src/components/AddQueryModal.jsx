import React, { useState } from 'react';

const AddQueryModal = ({ isOpen, onClose, onSave }) => {
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [sqlCodigo, setSqlCodigo] = useState('');
    const [etiquetas, setEtiquetas] = useState('');
    const [autor, setAutor] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!titulo.trim() || !sqlCodigo.trim()) {
            alert('Título y código SQL son obligatorios');
            return;
        }

        const nuevaConsulta = {
            titulo: titulo.trim(),
            descripcion: descripcion.trim() || null,
            sql_codigo: sqlCodigo.trim(),
            etiquetas: etiquetas.trim() ? etiquetas.split(',').map(tag => tag.trim()) : [],
            autor: autor.trim() || null
        };

        onSave(nuevaConsulta);
        handleClose();
    };

    const handleClose = () => {
        setTitulo('');
        setDescripcion('');
        setSqlCodigo('');
        setEtiquetas('');
        setAutor('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content add-query-modal">
                <div className="modal-header">
                    <h2>Agregar Nueva Consulta SQL</h2>
                    <button className="close-button" onClick={handleClose}>×</button>
                </div>
                
                <form onSubmit={handleSubmit} className="add-query-form">
                    <div className="form-group">
                        <label htmlFor="titulo">Título *</label>
                        <input
                            type="text"
                            id="titulo"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="Ingresa un título descriptivo"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="descripcion">Descripción</label>
                        <textarea
                            id="descripcion"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Descripción opcional de la consulta"
                            rows="3"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="sqlCodigo">Código SQL *</label>
                        <textarea
                            id="sqlCodigo"
                            value={sqlCodigo}
                            onChange={(e) => setSqlCodigo(e.target.value)}
                            placeholder="SELECT * FROM tabla WHERE condicion = valor;"
                            rows="8"
                            required
                            style={{ fontFamily: 'monospace', fontSize: '14px' }}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="etiquetas">Etiquetas</label>
                        <input
                            type="text"
                            id="etiquetas"
                            value={etiquetas}
                            onChange={(e) => setEtiquetas(e.target.value)}
                            placeholder="SELECT, JOIN, REPORT (separadas por comas)"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="autor">Autor</label>
                        <input
                            type="text"
                            id="autor"
                            value={autor}
                            onChange={(e) => setAutor(e.target.value)}
                            placeholder="Tu nombre"
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={handleClose} className="btn btn-cancel">
                            Cancelar
                        </button>
                        <button type="submit" className="btn btn-save">
                            Guardar Consulta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddQueryModal;