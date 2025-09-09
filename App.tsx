import React, { useState, useEffect, useCallback } from 'react';
import type { Database } from 'sql.js';
import Header from './components/Header';
import SchemaSidebar from './components/SchemaSidebar';
import SqlEditor from './components/SqlEditor';
import ResultsTable from './components/ResultsTable';
import PasteDataModal from './components/PasteDataModal';
import NameModal from './components/NameModal';
import Footer from './components/Footer';
import { initializeDb, getDbSchema, getDbSchemaSQL, saveDb } from './services/sqlService';
import type { Schema, QueryResult, QueryError } from './types';

const LoadingScreen: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="flex flex-col items-center">
            <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg text-slate-400">{message}</p>
        </div>
    </div>
);

const App: React.FC = () => {
    const [db, setDb] = useState<Database | null>(null);
    const [schema, setSchema] = useState<Schema>({});
    const [schemaSql, setSchemaSql] = useState<string>('');
    const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
    const [queryError, setQueryError] = useState<QueryError | null>(null);
    const [isDbLoading, setIsDbLoading] = useState<boolean>(true);
    const [isQueryRunning, setIsQueryRunning] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [userName, setUserName] = useState<string | null>(null);
    const [showNameModal, setShowNameModal] = useState<boolean>(false);

    const refreshSchema = useCallback(async (currentDb: Database) => {
        const newSchema = await getDbSchema(currentDb);
        const newSchemaSql = await getDbSchemaSQL(currentDb);
        setSchema(newSchema);
        setSchemaSql(newSchemaSql);
    }, []);
    
    // Check for user's name after the database has finished loading.
    useEffect(() => {
        if (isDbLoading) return; // Wait for the DB to be ready.

        const storedName = localStorage.getItem('sql-studio-user-name');
        if (storedName) {
            setUserName(storedName);
        } else {
            setShowNameModal(true); // If no name, show the modal.
        }
    }, [isDbLoading]);

    useEffect(() => {
        const init = async () => {
            setIsDbLoading(true);
            try {
                const newDb = await initializeDb();
                setDb(newDb);
                await refreshSchema(newDb);
            } catch (error) {
                console.error("Failed to initialize database:", error);
                setQueryError({ message: "Failed to initialize the in-browser database. Please refresh the page." });
            } finally {
                setIsDbLoading(false);
            }
        };

        init();
    }, [refreshSchema]);

    const runQuery = useCallback(async (sql: string) => {
        if (!db) return;

        setIsQueryRunning(true);
        setQueryResult(null);
        setQueryError(null);

        setTimeout(async () => {
            try {
                const results = db.exec(sql);
                const lastResult = results[results.length - 1];
                setQueryResult(lastResult || { columns: [], values: [] });
                
                const lowerSql = sql.toLowerCase().trim();
                const isDdlQuery = lowerSql.startsWith('create') || lowerSql.startsWith('alter') || lowerSql.startsWith('drop');
                const isDmlQuery = lowerSql.startsWith('insert') || lowerSql.startsWith('update') || lowerSql.startsWith('delete');

                if (isDdlQuery || isDmlQuery) {
                    if (isDdlQuery) {
                        await refreshSchema(db);
                    }
                    await saveDb(db);
                }
            } catch (err) {
                const error = err as Error;
                console.error("Query error:", error);
                setQueryError({ message: error.message });
            } finally {
                setIsQueryRunning(false);
            }
        }, 10);

    }, [db, refreshSchema]);

    const handleDataPasted = useCallback(async (sqlStatements: string[]) => {
        if (!db) return;
        setIsQueryRunning(true);
        setQueryError(null);
        
        try {
            for (const sql of sqlStatements) {
                db.run(sql);
            }
            await refreshSchema(db);
            await saveDb(db);
        } catch (err) {
            const error = err as Error;
            console.error("Paste data error:", error);
            setQueryError({ message: `Error creating table from pasted data: ${error.message}` });
        } finally {
            setIsQueryRunning(false);
            setIsModalOpen(false);
        }
    }, [db, refreshSchema]);
    
    const handleNameSubmit = (name: string) => {
        localStorage.setItem('sql-studio-user-name', name);
        setUserName(name);
        setShowNameModal(false);
    };

    if (isDbLoading) {
        return <LoadingScreen message="Initializing SQL Engine..." />;
    }

    return (
        <div className="h-screen w-screen flex flex-col font-sans bg-slate-900 overflow-hidden">
            {showNameModal && <NameModal onNameSubmit={handleNameSubmit} />}
            <Header onNewTableClick={() => setIsModalOpen(true)} userName={userName} />
            <main className="flex-grow flex overflow-hidden">
                <SchemaSidebar schema={schema} />
                <div className="flex-grow flex flex-col overflow-auto">
                    <SqlEditor 
                        runQuery={runQuery} 
                        isQueryRunning={isQueryRunning}
                        schemaSql={schemaSql}
                        schema={schema}
                    />
                    <ResultsTable 
                        result={queryResult} 
                        error={queryError}
                        isLoading={isQueryRunning} 
                    />
                </div>
            </main>
            <Footer />
            {isModalOpen && (
                <PasteDataModal 
                    onClose={() => setIsModalOpen(false)} 
                    onGenerate={handleDataPasted}
                />
            )}
        </div>
    );
};

export default App;