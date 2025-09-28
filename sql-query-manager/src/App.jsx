import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import QueryList from './components/QueryList';
import QueryModal from './components/QueryModal';
import TagFilter from './components/TagFilter';
import AddQueryModal from './components/AddQueryModal';
import {getAllQueries, saveQuery} from './components/Storage';

const App = () => {
    const [queries, setQueries] = useState([]);
    const [filteredQueries, setFilteredQueries] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedQuery, setSelectedQuery] = useState(null);
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        async function fetchQueries() {
            try {
                const storedQueries = await getAllQueries();
                setQueries(storedQueries);
                setFilteredQueries(storedQueries);
                
                // Extraer tags únicos de las consultas
                const allTags = [...new Set(storedQueries.flatMap(q => q.tags || []))];
                setTags(allTags);
            } catch (error) {
                console.error('Error cargando consultas:', error);
            }
        }
        
        fetchQueries();
    }, []);

    const handleSaveQuery = async (nuevaConsulta) => {
        try {
            const consultaGuardada = await saveQuery(nuevaConsulta);
            const updatedQueries = [...queries, consultaGuardada];
            setQueries(updatedQueries);
            setFilteredQueries(updatedQueries);
            
            // Actualizar tags
            const allTags = [...new Set(updatedQueries.flatMap(q => q.tags || []))];
            setTags(allTags);
        } catch (error) {
            console.error('Error guardando consulta:', error);
            alert('Error al guardar la consulta. Intenta nuevamente.');
        }
    };

    const handleSearch = async (term) => {
        setSearchTerm(term);
        
        if (term.trim() === '') {
            // Si no hay término de búsqueda, mostrar todas las consultas
            setFilteredQueries(queries);
        } else {
            // Detectar búsquedas especiales
            let filtered = queries;
            
            if (term.startsWith('#')) {
                // Búsqueda por tag
                const tag = term.substring(1);
                filtered = queries.filter(query => 
                    query.tags && query.tags.some(t => 
                        t.toLowerCase().includes(tag.toLowerCase())
                    )
                );
            } else if (term.startsWith('@')) {
                // Búsqueda por autor
                const author = term.substring(1);
                filtered = queries.filter(query => 
                    query.author && query.author.toLowerCase().includes(author.toLowerCase())
                );
            } else {
                // Búsqueda general por título y contenido
                filtered = queries.filter(query => {
                    const matchesTitle = query.title.toLowerCase().includes(term.toLowerCase());
                    const matchesContent = query.content.toLowerCase().includes(term.toLowerCase());
                    const matchesDescription = query.description && 
                        query.description.toLowerCase().includes(term.toLowerCase());
                    const matchesTag = selectedTag ? query.tags.includes(selectedTag) : true;
                    return (matchesTitle || matchesContent || matchesDescription) && matchesTag;
                });
            }
            
            setFilteredQueries(filtered);
        }
    };

    const handleTagSelect = (tag) => {
        setSelectedTag(tag);
        
        // Aplicar filtro de tag y búsqueda
        const filtered = queries.filter(query => {
            const matchesSearch = searchTerm === '' || 
                query.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                query.content.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTag = tag === '' || query.tags.includes(tag);
            return matchesSearch && matchesTag;
        });
        
        setFilteredQueries(filtered);
    };

    const handleQueryClick = (query) => {
        setSelectedQuery(query);
    };

    const closeModal = () => {
        setSelectedQuery(null);
    };

    return (
        <div className="app">
            <div className="app-header">
                <h1>SQL Query Manager</h1>
                <button 
                    className="btn btn-primary add-query-btn"
                    onClick={() => setShowAddModal(true)}
                >
                    + Agregar Consulta
                </button>
            </div>
            
            <SearchBar 
                searchTerm={searchTerm}
                onSearchChange={handleSearch}
                queries={queries}
            />
            <TagFilter tags={tags} onTagSelect={handleTagSelect} />
            <QueryList 
                queries={filteredQueries} 
                onTitleClick={handleQueryClick} 
            />
            
            {selectedQuery && (
                <QueryModal query={selectedQuery} onClose={closeModal} />
            )}
            
            <AddQueryModal 
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSave={handleSaveQuery}
            />
        </div>
    );
};

export default App;