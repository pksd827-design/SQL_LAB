import React, { useState, useCallback, useEffect } from 'react';

interface PasteDataModalProps {
    onClose: () => void;
    onGenerate: (sqlStatements: string[]) => void;
}

type ColumnDefinition = {
    name: string;
    type: string;
};
type DataType = 'TEXT' | 'INTEGER' | 'REAL' | 'BOOLEAN' | 'DATE';
const DATA_TYPES: DataType[] = ['TEXT', 'INTEGER', 'REAL', 'BOOLEAN', 'DATE'];

const sanitizeName = (name: string) => {
    return name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
};

const inferDataType = (value: string): DataType => {
    if (value === null || value.trim() === '' || value.toLowerCase() === 'null') return 'TEXT';
    const num = Number(value);
    if (!isNaN(num) && value.trim() !== '') {
        return Number.isInteger(num) ? 'INTEGER' : 'REAL';
    }
    if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') return 'BOOLEAN';
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'DATE';
    return 'TEXT';
};

const PasteDataModal: React.FC<PasteDataModalProps> = ({ onClose, onGenerate }) => {
    const [pastedText, setPastedText] = useState('');
    const [tableName, setTableName] = useState('new_table');
    const [columns, setColumns] = useState<ColumnDefinition[]>([]);
    const [dataRows, setDataRows] = useState<string[][]>([]);
    const [generatedSql, setGeneratedSql] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyzeData = useCallback(() => {
        setError(null);
        setColumns([]);
        setDataRows([]);
        if (!pastedText.trim()) {
            setError("Pasted data cannot be empty.");
            return;
        }

        const lines = pastedText.trim().split(/\r?\n/).filter(line => line.trim() !== '');
        if (lines.length < 2) {
            setError("Data must have at least a header row and one data row.");
            return;
        }

        const header = lines[0];
        const delimiter = header.includes('\t') ? '\t' : ',';
        const headers = header.split(delimiter).map((h, i) => sanitizeName(h) || `column_${i + 1}`);
        const parsedDataRows = lines.slice(1).map(line => line.split(delimiter));
        setDataRows(parsedDataRows);

        const inferredColumns: ColumnDefinition[] = headers.map((colName, colIndex) => {
            let columnType: DataType = 'TEXT';
            const sampleData = parsedDataRows.slice(0, 50).map(row => row[colIndex]).filter(val => val !== undefined && val !== null && val.trim() !== '');
            if(sampleData.length === 0) return { name: colName, type: 'TEXT'};

            const typeCounts = sampleData.map(inferDataType).reduce((acc, type) => {
                acc[type] = (acc[type] || 0) + 1;
                return acc;
            }, {} as Record<DataType, number>);
            
            const majorityType = Object.keys(typeCounts).reduce((a, b) => typeCounts[a as DataType] > typeCounts[b as DataType] ? a : b) as DataType;
            columnType = majorityType;
            
            return { name: colName, type: columnType };
        });

        setColumns(inferredColumns);
    }, [pastedText]);

    useEffect(() => {
        if (columns.length === 0) {
            setGeneratedSql([]);
            return;
        }

        const finalTableName = sanitizeName(tableName) || 'my_table';
        const createTableSql = `CREATE TABLE ${finalTableName} (\n  ${columns.map(c => `"${c.name}" ${c.type}`).join(',\n  ')}\n);`;
        
        const insertStatements = dataRows.map(row => {
            const values = row.map((val, i) => {
                if (i >= columns.length) return 'NULL'; // handle ragged rows
                const type = columns[i].type;
                if (val === undefined || val === null || val.toLowerCase() === 'null' || val.trim() === '') return 'NULL';
                if (type === 'TEXT' || type === 'DATE') return `'${val.replace(/'/g, "''")}'`;
                if (type === 'BOOLEAN') return val.toLowerCase() === 'true' ? '1' : '0';
                return val;
            }).join(', ');
            return `INSERT INTO ${finalTableName} (${columns.map(c => `"${c.name}"`).join(', ')}) VALUES (${values});`;
        });
        
        setGeneratedSql([createTableSql, ...insertStatements]);

    }, [columns, dataRows, tableName]);

    const handleCreateTable = () => {
        if (generatedSql.length > 0) {
            onGenerate(generatedSql);
        }
    };
    
    const handleTypeChange = (index: number, newType: DataType) => {
        const newColumns = [...columns];
        newColumns[index].type = newType;
        setColumns(newColumns);
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <header className="p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 id="modal-title" className="text-lg font-semibold text-slate-200">Create Table from Pasted Data</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none" aria-label="Close modal">&times;</button>
                </header>
                <main className="p-4 flex-grow overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-4">
                         <div>
                            <label htmlFor="table-name" className="block text-sm font-medium text-slate-400 mb-1">Table Name</label>
                            <input
                                id="table-name"
                                type="text"
                                value={tableName}
                                onChange={(e) => setTableName(e.target.value)}
                                className="w-full bg-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                        </div>
                        <div className="flex flex-col flex-grow">
                            <label htmlFor="pasted-data" className="block text-sm font-medium text-slate-400 mb-1">Paste your data (CSV or TSV)</label>
                            <textarea
                                id="pasted-data"
                                value={pastedText}
                                onChange={(e) => setPastedText(e.target.value)}
                                className="w-full flex-grow p-2 bg-slate-900 text-slate-200 font-mono text-sm resize-y rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 min-h-[250px]"
                                placeholder="id,name,email&#10;1,John Doe,john@example.com&#10;2,Jane Smith,jane@example.com"
                                aria-label="Paste data here"
                            />
                        </div>
                         {error && <div className="text-red-400 text-sm p-2 bg-red-900/50 rounded-md" role="alert">{error}</div>}
                         {columns.length > 0 && (
                            <div className="flex flex-col">
                                <h3 className="text-sm font-medium text-slate-400 mb-2">Schema Preview</h3>
                                <div className="bg-slate-900/50 p-2 rounded-md max-h-48 overflow-y-auto space-y-2">
                                    {columns.map((col, index) => (
                                        <div key={index} className="grid grid-cols-2 gap-2 items-center">
                                            <span className="text-sm font-mono text-slate-300 truncate" title={col.name}>{col.name}</span>
                                            <select
                                                value={col.type}
                                                onChange={(e) => handleTypeChange(index, e.target.value as DataType)}
                                                className="bg-slate-700 text-slate-200 text-sm rounded-md p-1 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                            >
                                                {DATA_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            </div>
                         )}
                    </div>

                    <div className="flex flex-col">
                        <label className="block text-sm font-medium text-slate-400 mb-1">Generated SQL Preview</label>
                        <div className="flex-grow p-2 bg-slate-900 rounded-md overflow-auto" aria-live="polite">
                           {generatedSql.length > 0 ? (
                               <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                                   {`${generatedSql[0]}\n\n-- Plus ${generatedSql.length - 1} INSERT statements...`}
                               </pre>
                           ) : (
                               <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                                   <p>Paste data and click "Analyze Data" to see a preview.</p>
                               </div>
                           )}
                        </div>
                    </div>
                </main>
                <footer className="p-4 border-t border-slate-700 flex justify-end gap-3">
                    <button onClick={handleAnalyzeData} className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-500 transition-colors duration-200 text-sm font-semibold">
                        Analyze Data
                    </button>
                    <button
                        onClick={handleCreateTable}
                        disabled={generatedSql.length === 0}
                        className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-500 transition-colors duration-200 text-sm font-semibold disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        Create Table
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default PasteDataModal;