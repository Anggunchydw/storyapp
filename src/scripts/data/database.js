// import { openDB } from 'idb';
 
// const DATABASE_NAME = 'storyapp';
// const DATABASE_VERSION = 1;
// const OBJECT_STORE_NAME = 'reports';
 
// const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
//   upgrade: (database) => {
//     database.createObjectStore(OBJECT_STORE_NAME, {
//       keyPath: 'id',
//     });
//   },
// });
// const Database = {
//   async putReport(report) {
//     if (!Object.hasOwn(report, 'id')) {
//       throw new Error('`id` is required to save.');
//     }
//     return (await dbPromise).put(OBJECT_STORE_NAME, report);
//   },

//   async getAllReports() {
//     return (await dbPromise).getAll(OBJECT_STORE_NAME);
//   },

//   async deleteReport(id) {
//     return (await dbPromise).delete(OBJECT_STORE_NAME, id);
//   },
// };

// export default Database;
import { openDB } from 'idb';

const DB_NAME = 'storyApp';
const DB_VERSION = 1;
const STORE_NAME = 'reports';

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  },
});

const Database = {
  async putReport(report) {
    const db = await dbPromise;
    return db.put(STORE_NAME, report);
  },

  async getAllReports() {
    const db = await dbPromise;
    return db.getAll(STORE_NAME);
  },

  async deleteReport(id) {
    const db = await dbPromise;
    return db.delete(STORE_NAME, id);
  },
};

export default Database;
