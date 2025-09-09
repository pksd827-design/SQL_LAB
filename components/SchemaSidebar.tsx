
import React from 'react';
import type { Schema } from '../types';

interface SchemaSidebarProps {
    schema: Schema;
}

const SchemaSidebar: React.FC<SchemaSidebarProps> = ({ schema }) => {
    const tables = Object.values(schema);

    return (
        <aside className="w-64 bg-slate-800/50 border-r border-slate-700 p-4 flex-shrink-0 overflow-y-auto">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Schema</h2>
            {tables.length === 0 ? (
                <p className="text-slate-500 text-sm">No tables found.</p>
            ) : (
                <ul className="space-y-4">
                    {tables.map((table) => (
                        <li key={table.name}>
                            <div className="flex items-center gap-2 text-sky-400 font-semibold">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                                  <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 0 1 3.5 2h9A1.5 1.5 0 0 1 14 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 12.5v-9ZM3.5 3a.5.5 0 0 0-.5.5v9a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5v-9a.5.5 0 0 0-.5-.5h-9ZM9 6a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2h-2a1 1 0 0 1-1-1Zm-5 0a1 1 0 0 1 1-1h2a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Zm1 4a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2H5Z" clipRule="evenodd" />
                                </svg>
                                <span>{table.name}</span>
                            </div>
                            <ul className="mt-2 pl-4 border-l border-slate-700">
                                {table.columns.map((column) => (
                                    <li key={column.name} className="text-sm text-slate-400 py-1 flex justify-between">
                                        <span>{column.name}</span>
                                        <span className="text-slate-500">{column.type}</span>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}
                </ul>
            )}
        </aside>
    );
};

export default SchemaSidebar;
