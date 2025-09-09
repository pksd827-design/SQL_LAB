
const DB_NAME = 'SqlStudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'database';
const DB_KEY = 'main_db';

let db: IDBDatabase;

function openDb(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (db) {
            return resolve(db);
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('IndexedDB error:', request.error);
            reject(new Error('Failed to open IndexedDB.'));
        };

        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };
    });
}

export async function saveDb(dbArray: Uint8Array): Promise<void> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(dbArray, DB_KEY);

        request.onsuccess = () => resolve();
        request.onerror = () => {
             console.error('Failed to save DB to IndexedDB:', request.error);
             reject(new Error('Failed to save database.'));
        }
    });
}

export async function loadDb(): Promise<Uint8Array | null> {
    const db = await openDb();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(DB_KEY);

        request.onsuccess = () => {
            resolve(request.result ? request.result as Uint8Array : null);
        };
        request.onerror = () => {
            console.error('Failed to load DB from IndexedDB:', request.error);
            reject(new Error('Failed to load database.'));
        }
    });
}
