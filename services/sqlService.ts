import type { Database } from 'sql.js';
import type { Schema, Table, Column } from '../types';
import { loadDb as loadFromIndexedDB, saveDb as saveToIndexedDB } from './indexedDbService';
import { SAMPLE_DATA } from '../constants';

// Since sql.js is loaded via a <script> tag in index.html, it provides a global function.
// We declare it here to inform TypeScript about its existence and type.
declare const initSqlJs: (config?: { locateFile: (file: string) => string }) => Promise<any>;

let dbInstance: Database | null = null;

export const initializeDb = async (): Promise<Database> => {
    if (dbInstance) {
        return dbInstance;
    }
    
    // Use the global initSqlJs function provided by the script tag in index.html
    const SQL = await initSqlJs({
        locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1.13.0/dist/${file}`
    });

    const dbData = await loadFromIndexedDB();
    if (dbData) {
        console.log("Loading database from IndexedDB...");
        dbInstance = new SQL.Database(dbData);
    } else {
        console.log("Creating new database and seeding with sample data...");
        dbInstance = new SQL.Database();
        // Seed with sample data only if the DB is new
        for (const query of SAMPLE_DATA) {
            dbInstance.run(query);
        }
        // Save the newly seeded database
        const data = dbInstance.export();
        await saveToIndexedDB(data);
        console.log("Initial database seeded and saved to IndexedDB.");
    }
    return dbInstance;
};

export const saveDb = async (db: Database): Promise<void> => {
    try {
        const data = db.export();
        await saveToIndexedDB(data);
        console.log("Database saved to IndexedDB.");
    } catch(error) {
        console.error("Failed to save database:", error);
    }
};


export const getDbSchema = async (db: Database): Promise<Schema> => {
    const schema: Schema = {};
    const tablesResult = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");

    if (tablesResult.length === 0 || tablesResult[0].values.length === 0) {
        return schema;
    }

    const tableNames = tablesResult[0].values.map(row => row[0] as string);

    for (const tableName of tableNames) {
        const tableInfoResult = db.exec(`PRAGMA table_info(${tableName});`);
        if (tableInfoResult.length > 0) {
            const columns: Column[] = tableInfoResult[0].values.map(row => ({
                name: row[1] as string,
                type: row[2] as string
            }));
            const table: Table = {
                name: tableName,
                columns: columns
            };
            schema[tableName] = table;
        }
    }

    return schema;
};

export const getDbSchemaSQL = async (db: Database): Promise<string> => {
    const schemaResult = db.exec("SELECT sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
    if (schemaResult.length === 0 || schemaResult[0].values.length === 0) {
        return "-- No tables in schema";
    }
    return schemaResult[0].values.map(row => row[0]).join('\n\n');
};