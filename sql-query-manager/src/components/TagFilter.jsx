import React from 'react';

const TagFilter = ({ tags, onTagSelect }) => {
    return (
        <div className="tag-filter">
            <h3>Filtrar por Etiquetas</h3>
            <div className="tag-list">
                {tags.map((tag, index) => (
                    <button 
                        key={index} 
                        className="tag-button" 
                        onClick={() => onTagSelect(tag)}
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TagFilter;