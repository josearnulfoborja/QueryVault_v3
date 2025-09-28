// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Función para obtener todas las consultas desde la API
export async function getAllQueries() {
    try {
        const response = await fetch(`${API_BASE_URL}/consultas`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const consultas = await response.json();
        
        // Convertir formato de la API al formato que espera el frontend
        return consultas.map(consulta => ({
            id: consulta.id,
            title: consulta.titulo,
            content: consulta.sql_codigo,
            description: consulta.descripcion,
            tags: consulta.etiquetas || [],
            author: consulta.autor,
            created_at: consulta.fecha_creacion,
            favorite: consulta.favorito
        }));
    } catch (error) {
        console.error('Error obteniendo consultas desde API:', error);
        // Fallback a localStorage si la API no está disponible
        const queries = localStorage.getItem(STORAGE_KEY);
        return queries ? JSON.parse(queries) : [];
    }
}

// Función para guardar consulta en la API
export const saveQuery = async (query) => {
    try {
        const consultaData = {
            titulo: query.titulo,
            descripcion: query.descripcion,
            sql_codigo: query.sql_codigo,
            etiquetas: query.etiquetas,
            autor: query.autor
        };

        const response = await fetch(`${API_BASE_URL}/consultas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(consultaData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        // Retornar en el formato que espera el frontend
        return {
            id: result.id,
            title: query.titulo,
            content: query.sql_codigo,
            description: query.descripcion,
            tags: query.etiquetas || [],
            author: query.autor,
            created_at: new Date().toISOString(),
            favorite: false
        };
    } catch (error) {
        console.error('Error guardando consulta en API:', error);
        // Fallback a localStorage si la API no está disponible
        return saveQueryLocal(query);
    }
};

// Funciones de localStorage como fallback
const STORAGE_KEY = 'sqlQueries';

const saveQueryLocal = (query) => {
    const queries = getQueries();
    const newQuery = {
        id: Date.now(),
        title: query.titulo,
        content: query.sql_codigo,
        description: query.descripcion,
        tags: query.etiquetas || [],
        author: query.autor,
        created_at: new Date().toISOString(),
        favorite: false
    };
    queries.push(newQuery);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queries));
    return newQuery;
};

export const getQueries = () => {
    const queries = localStorage.getItem(STORAGE_KEY);
    return queries ? JSON.parse(queries) : [];
};

export const isQueryValid = (title, content) => {
    return title.trim() !== '' && content.trim() !== '';
};

// Función para buscar consultas en la API
export async function searchQueries(searchTerm) {
    try {
        const response = await fetch(`${API_BASE_URL}/consultas?search=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const consultas = await response.json();
        
        // Convertir formato de la API al formato que espera el frontend
        return consultas.map(consulta => ({
            id: consulta.id,
            title: consulta.titulo,
            content: consulta.sql_codigo,
            description: consulta.descripcion,
            tags: consulta.etiquetas || [],
            author: consulta.autor,
            created_at: consulta.fecha_creacion,
            favorite: consulta.favorito
        }));
    } catch (error) {
        console.error('Error buscando consultas desde API:', error);
        return [];
    }
}