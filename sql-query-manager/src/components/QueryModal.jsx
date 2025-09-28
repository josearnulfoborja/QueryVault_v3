import React, { useState } from 'react';
import PropTypes from 'prop-types';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const QueryModal = ({ query, onClose }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copied, setCopied] = useState(false);
    
    if (!query) return null;

    // Determinar si el script es largo (más de 10 líneas)
    const sqlLines = query.content.split('\n');
    const isLongScript = sqlLines.length > 10;
    const displayContent = !isExpanded && isLongScript 
        ? sqlLines.slice(0, 10).join('\n') + '\n-- ...'
        : query.content;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(query.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Error copiando al clipboard:', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="sql-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="sql-modal-header">
                    <div className="modal-title-section">
                        <h2>{query.title}</h2>
                        {query.author && <span className="author-tag">por {query.author}</span>}
                        {query.created_at && <span className="date-tag">{formatDate(query.created_at)}</span>}
                    </div>
                    <button className="close-button" onClick={onClose}>×</button>
                </div>

                {query.description && (
                    <div className="sql-modal-description">
                        <p>{query.description}</p>
                    </div>
                )}

                {query.tags && query.tags.length > 0 && (
                    <div className="sql-modal-tags">
                        {query.tags.map((tag, index) => (
                            <span key={index} className="tag-badge">{tag}</span>
                        ))}
                    </div>
                )}

                <div className="sql-modal-body">
                    <div className="sql-header">
                        <span className="sql-title">Consulta SQL</span>
                        <div className="sql-actions">
                            {isLongScript && (
                                <button 
                                    className="btn btn-expand"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                >
                                    {isExpanded ? 'Ver menos' : `Ver más (${sqlLines.length} líneas)`}
                                </button>
                            )}
                            <button 
                                className={`btn btn-copy ${copied ? 'copied' : ''}`}
                                onClick={handleCopy}
                            >
                                {copied ? '✓ Copiado' : '📋 Copiar'}
                            </button>
                        </div>
                    </div>
                    
                    <div className="sql-container">
                        <SyntaxHighlighter 
                            language="sql" 
                            style={atomOneDark}
                            customStyle={{
                                borderRadius: '8px',
                                margin: '0',
                                fontSize: '14px',
                                lineHeight: '1.5',
                                maxHeight: isExpanded ? 'none' : '400px',
                                overflow: isExpanded ? 'visible' : 'auto'
                            }}
                            showLineNumbers={true}
                            wrapLines={true}
                        >
                            {displayContent}
                        </SyntaxHighlighter>
                    </div>
                </div>

                <div className="sql-modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

QueryModal.propTypes = {
    query: PropTypes.shape({
        title: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        description: PropTypes.string,
        author: PropTypes.string,
        tags: PropTypes.arrayOf(PropTypes.string),
        created_at: PropTypes.string,
        favorite: PropTypes.bool
    }),
    onClose: PropTypes.func.isRequired,
};

export default QueryModal;