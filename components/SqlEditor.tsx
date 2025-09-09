import React, { useState, useEffect, useRef } from 'react';
import type { editor, languages } from 'monaco-editor';
import type { Schema } from '../types';
import { generateSqlFromPrompt } from '../services/geminiService';

// To satisfy TypeScript since the loader script defines a global 'require'
declare const require: any;

interface SqlEditorProps {
    runQuery: (sql: string) => void;
    isQueryRunning: boolean;
    schemaSql: string;
    schema: Schema;
}

const SqlEditor: React.FC<SqlEditorProps> = ({ runQuery, isQueryRunning, schemaSql, schema }) => {
    const [prompt, setPrompt] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [generationError, setGenerationError] = useState<string | null>(null);

    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<any | null>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const completionProvider = useRef<any>(null);


    useEffect(() => {
        if (editorContainerRef.current && !editorRef.current) {
            require(['vs/editor/editor.main'], (monaco: any) => {
                monacoRef.current = monaco;
                
                const editorInstance = monaco.editor.create(editorContainerRef.current!, {
                    value: 'SELECT * FROM employees;',
                    language: 'sql',
                    theme: 'vs-dark',
                    automaticLayout: true,
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on',
                    padding: { top: 10 }
                });
                editorRef.current = editorInstance;
            });
        }
        
        return () => {
            if (editorRef.current) {
                editorRef.current.dispose();
                editorRef.current = null;
            }
            if(completionProvider.current) {
                completionProvider.current.dispose();
            }
        };
    }, []); // Run only once

    useEffect(() => {
        if (monacoRef.current && schema) {
            // Dispose of the old provider if it exists
            if (completionProvider.current) {
                completionProvider.current.dispose();
            }

            // Simple, non-context-aware completion provider
            completionProvider.current = monacoRef.current.languages.registerCompletionItemProvider('sql', {
                // FIX: Add model and position arguments to determine the text range to replace.
                // The `range` property is required for `CompletionItem` types.
                provideCompletionItems: (model: editor.ITextModel, position: any) => {
                    const word = model.getWordUntilPosition(position);
                    const range = {
                        startLineNumber: position.lineNumber,
                        endLineNumber: position.lineNumber,
                        startColumn: word.startColumn,
                        endColumn: word.endColumn,
                    };

                    const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'LIMIT', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE'];
                    const suggestions: languages.CompletionItem[] = keywords.map((k: string) => ({
                        label: k,
                        kind: monacoRef.current.languages.CompletionItemKind.Keyword,
                        insertText: k + ' ',
                        range: range,
                    }));

                    Object.values(schema).forEach(table => {
                        suggestions.push({
                            label: table.name,
                            kind: monacoRef.current.languages.CompletionItemKind.Folder,
                            insertText: table.name,
                            range: range,
                        });
                        table.columns.forEach(column => {
                            suggestions.push({
                                label: column.name,
                                kind: monacoRef.current.languages.CompletionItemKind.Field,
                                insertText: column.name,
                                detail: column.type,
                                range: range,
                            });
                        });
                    });

                    return { suggestions };
                },
            });
        }
    }, [schema]); // Rerun if schema changes to update suggestions

    const handleRunQuery = () => {
        const sql = editorRef.current?.getValue();
        if (sql?.trim()) {
            runQuery(sql);
        }
    };

    const handleGenerateSql = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        setGenerationError(null);
        try {
            const generatedSql = await generateSqlFromPrompt(prompt, schemaSql);
            editorRef.current?.setValue(generatedSql);
        } catch (error) {
            const err = error as Error;
            setGenerationError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };
    
    return (
        <div className="flex-grow flex flex-col p-4 gap-4 overflow-auto border-b border-slate-700">
            {/* AI Prompt Section */}
            <div className="flex flex-col gap-2">
                 <label htmlFor="ai-prompt" className="text-sm font-medium text-slate-300">
                    Generate SQL from Natural Language
                </label>
                <div className="flex gap-2">
                    <input
                        id="ai-prompt"
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g., Show me all employees in the Marketing department"
                        className="flex-grow bg-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        disabled={isGenerating}
                        onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGenerateSql()}
                    />
                    <button
                        onClick={handleGenerateSql}
                        disabled={isGenerating || !prompt.trim()}
                        className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-500 transition-colors duration-200 text-sm font-semibold flex items-center gap-2 disabled:bg-slate-600 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </>
                        ) : (
                            'Generate SQL'
                        )}
                    </button>
                </div>
                {generationError && <p className="text-red-400 text-sm mt-1 px-1" role="alert">{generationError}</p>}
            </div>

            {/* SQL Editor Section */}
            <div className="flex-grow flex flex-col relative">
                <label className="block text-sm font-medium text-slate-300 mb-1">SQL Editor</label>
                 <div ref={editorContainerRef} className="flex-grow w-full border border-slate-700 rounded-md" />
            </div>
             <button
                onClick={handleRunQuery}
                disabled={isQueryRunning}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-500 transition-colors duration-200 text-sm font-semibold flex items-center justify-center gap-2 self-end disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
                {isQueryRunning ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Running...
                    </>
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm6.39-2.908a.75.75 0 0 1 .958.083l6 4.5a.75.75 0 0 1 0 1.15l-6 4.5a.75.75 0 0 1-1.04-1.06L14.053 10 8.308 5.756a.75.75 0 0 1 .083-.958Z" clipRule="evenodd" />
                        </svg>
                        Run Query
                    </>
                )}
            </button>
        </div>
    );
};

export default SqlEditor;