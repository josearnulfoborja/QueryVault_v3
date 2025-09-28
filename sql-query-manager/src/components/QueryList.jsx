import React from 'react';

const QueryList = ({ queries, onTitleClick }) => {
    return (
        <div className="query-list">
            <h2>Saved Queries</h2>
            <ul>
                {queries.map((query, index) => (
                    <li key={index} onClick={() => onTitleClick(query)}>
                        {query.title}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default QueryList;