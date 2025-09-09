
export interface Column {
    name: string;
    type: string;
}

export interface Table {
    name: string;
    columns: Column[];
}

export interface Schema {
    [tableName: string]: Table;
}

export interface QueryResult {
    columns: string[];
    values: any[][];
}

export interface QueryError {
    message: string;
}
