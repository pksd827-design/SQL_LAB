
import type { Database } from 'sql.js';
import type { Schema, Table, Column } from '../types';

declare const initSqlJs: (config: { locateFile: (file: string) => string; }) => Promise<{ Database: new (data?: Uint8Array) => Database; }>;

let dbInstance: Database | null = null;

export const initializeDb = async (): Promise<Database> => {
    if (dbInstance) {
        return dbInstance;
    }
    const SQL = await initSqlJs({
        locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${file}`
    });
    dbInstance = new SQL.Database();
    return dbInstance;
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
