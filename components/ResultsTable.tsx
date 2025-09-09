import React from 'react';
import type { QueryResult, QueryError } from '../types';

interface ResultsTableProps {
    result: QueryResult | null;
    error: QueryError | null;

    isLoading: boolean;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ result, error, isLoading }) => {
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="flex flex-col items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-2 text-slate-400">Executing query...</p>
                    </div>
                </div>
            );
        }
        
        if (error) {
            return (
                <div className="p-4">
                    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Query Error:</strong>
                        <span className="block sm:inline ml-2 font-mono">{error.message}</span>
                    </div>
                </div>
            );
        }

        if (!result) {
            return (
                <div className="flex items-center justify-center h-full">
                    <p className="text-slate-500">Run a query to see the results here.</p>
                </div>
            );
        }
        
        if (result.values.length === 0) {
            return (
                 <div className="flex items-center justify-center h-full">
                    <p className="text-slate-500">Query executed successfully. No rows returned.</p>
                </div>
            );
        }

        return (
            <div className="overflow-auto h-full">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-slate-800 sticky top-0">
                        <tr>
                            {result.columns.map((col) => (
                                <th key={col} scope="col" className="px-4 py-2 font-semibold text-slate-300 border-b border-slate-700">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {result.values.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-slate-800/50">
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex} className="px-4 py-2 whitespace-nowrap text-slate-400 font-mono">
                                        {cell === null ? <span className="text-slate-600 italic">NULL</span> : String(cell)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="h-2/5 flex flex-col bg-slate-900">
            <div className="flex-shrink-0 p-2 border-b border-slate-700 bg-slate-800/50">
                <h3 className="text-sm font-semibold text-slate-300">Results</h3>
            </div>
            <div className="flex-grow overflow-hidden relative">
                {renderContent()}
            </div>
        </div>
    );
};

export default ResultsTable;