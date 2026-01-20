import { openDB, type IDBPDatabase } from 'idb';
import type { GameResult } from '../engine/types';

const DB_NAME = 'euchre-db';
const DB_VERSION = 1;

export interface EuchreDB {
  games: {
    key: string;
    value: GameResult;
    indexes: { timestamp: number };
  };
}

let dbInstance: IDBPDatabase<EuchreDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<EuchreDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<EuchreDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create games object store
      if (!db.objectStoreNames.contains('games')) {
        const gameStore = db.createObjectStore('games', { keyPath: 'id' });
        gameStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    },
  });

  return dbInstance;
}
