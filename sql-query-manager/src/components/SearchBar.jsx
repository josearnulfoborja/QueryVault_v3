import React, { useState, useEffect, useRef } from 'react';

const SearchBar = ({ searchTerm, onSearchChange, queries = [] }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    // Generar sugerencias basadas en el término de búsqueda
    useEffect(() => {
        if (searchTerm.length > 0) {
            const filteredSuggestions = [];
            
            // Buscar en títulos
            queries.forEach(query => {
                if (query.title.toLowerCase().includes(searchTerm.toLowerCase())) {
                    filteredSuggestions.push({
                        type: 'title',
                        text: query.title,
                        query: query,
                        highlight: searchTerm
                    });
                }
            });

            // Buscar en tags
            const uniqueTags = [...new Set(queries.flatMap(q => q.tags || []))];
            uniqueTags.forEach(tag => {
                if (tag.toLowerCase().includes(searchTerm.toLowerCase())) {
                    filteredSuggestions.push({
                        type: 'tag',
                        text: tag,
                        highlight: searchTerm
                    });
                }
            });

            // Buscar en autores
            const uniqueAuthors = [...new Set(queries.map(q => q.author).filter(Boolean))];
            uniqueAuthors.forEach(author => {
                if (author.toLowerCase().includes(searchTerm.toLowerCase())) {
                    filteredSuggestions.push({
                        type: 'author',
                        text: author,
                        highlight: searchTerm
                    });
                }
            });

            setSuggestions(filteredSuggestions.slice(0, 8)); // Limitar a 8 sugerencias
            setShowSuggestions(filteredSuggestions.length > 0);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
        setSelectedIndex(-1);
    }, [searchTerm, queries]);

    const handleInputChange = (event) => {
        onSearchChange(event.target.value);
    };

    const handleInputFocus = () => {
        setIsFocused(true);
        if (searchTerm.length > 0 && suggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    const handleInputBlur = () => {
        setIsFocused(false);
        // Delay para permitir clicks en sugerencias
        setTimeout(() => {
            setShowSuggestions(false);
        }, 200);
    };

    const handleKeyDown = (event) => {
        if (!showSuggestions) return;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                setSelectedIndex(prev => 
                    prev < suggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                event.preventDefault();
                setSelectedIndex(prev => 
                    prev > 0 ? prev - 1 : suggestions.length - 1
                );
                break;
            case 'Enter':
                event.preventDefault();
                if (selectedIndex >= 0) {
                    selectSuggestion(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSelectedIndex(-1);
                inputRef.current?.blur();
                break;
        }
    };

    const selectSuggestion = (suggestion) => {
        if (suggestion.type === 'title') {
            onSearchChange(suggestion.text);
        } else if (suggestion.type === 'tag') {
            onSearchChange(`#${suggestion.text}`);
        } else if (suggestion.type === 'author') {
            onSearchChange(`@${suggestion.text}`);
        }
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.focus();
    };

    const highlightText = (text, highlight) => {
        if (!highlight) return text;
        
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        return parts.map((part, index) => 
            part.toLowerCase() === highlight.toLowerCase() ? 
                <mark key={index} className="search-highlight">{part}</mark> : part
        );
    };

    const getSuggestionIcon = (type) => {
        switch (type) {
            case 'title': return '📄';
            case 'tag': return '🏷️';
            case 'author': return '👤';
            default: return '🔍';
        }
    };

    const clearSearch = () => {
        onSearchChange('');
        inputRef.current?.focus();
    };

    return (
        <div className={`workflowy-search ${isFocused ? 'focused' : ''}`}>
            <div className="search-container">
                <div className="search-icon">🔍</div>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Buscar consultas, tags (#), autores (@)..."
                    value={searchTerm}
                    onChange={handleInputChange}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                    onKeyDown={handleKeyDown}
                    className="search-input"
                />
                {searchTerm && (
                    <button 
                        className="clear-button"
                        onClick={clearSearch}
                        type="button"
                    >
                        ×
                    </button>
                )}
            </div>

            {showSuggestions && (
                <div ref={suggestionsRef} className="suggestions-dropdown">
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            className={`suggestion-item ${index === selectedIndex ? 'selected' : ''}`}
                            onClick={() => selectSuggestion(suggestion)}
                        >
                            <div className="suggestion-icon">
                                {getSuggestionIcon(suggestion.type)}
                            </div>
                            <div className="suggestion-content">
                                <div className="suggestion-text">
                                    {highlightText(suggestion.text, suggestion.highlight)}
                                </div>
                                <div className="suggestion-type">
                                    {suggestion.type === 'title' && 'Consulta'}
                                    {suggestion.type === 'tag' && 'Etiqueta'}
                                    {suggestion.type === 'author' && 'Autor'}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    {suggestions.length === 0 && searchTerm && (
                        <div className="no-suggestions">
                            <div className="suggestion-icon">💭</div>
                            <div className="suggestion-content">
                                <div className="suggestion-text">Sin resultados para "{searchTerm}"</div>
                                <div className="suggestion-type">Intenta con otro término</div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;