/**
 * Bucket Storage Service
 * Manages persistent storage of NSL bucket files using IndexedDB
 */

import type { BucketFile, NSLMetadata } from '../types';

const DB_NAME = 'cascade-edit-nsl-bucket';
const DB_VERSION = 1;
const STORE_FILES = 'files';
const STORE_METADATA = 'metadata';

/**
 * Initialize IndexedDB database
 */
export const initBucketDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create files object store
      if (!db.objectStoreNames.contains(STORE_FILES)) {
        db.createObjectStore(STORE_FILES, { keyPath: 'filename' });
      }
      
      // Create metadata object store
      if (!db.objectStoreNames.contains(STORE_METADATA)) {
        db.createObjectStore(STORE_METADATA);
      }
    };
  });
};

/**
 * Save all bucket files to IndexedDB
 */
export const saveBucketFiles = async (files: BucketFile[]): Promise<void> => {
  const db = await initBucketDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_FILES], 'readwrite');
    const store = transaction.objectStore(STORE_FILES);
    
    // Clear existing files first
    const clearRequest = store.clear();
    
    clearRequest.onsuccess = () => {
      // Add all new files
      files.forEach(file => {
        store.put(file);
      });
    };
    
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    
    transaction.onerror = () => {
      db.close();
      reject(new Error('Failed to save bucket files'));
    };
  });
};

/**
 * Save individual bucket file to IndexedDB
 */
export const saveBucketFile = async (file: BucketFile): Promise<void> => {
  const db = await initBucketDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_FILES], 'readwrite');
    const store = transaction.objectStore(STORE_FILES);
    
    const request = store.put(file);
    
    request.onsuccess = () => {
      db.close();
      resolve();
    };
    
    request.onerror = () => {
      db.close();
      reject(new Error(`Failed to save file: ${file.filename}`));
    };
  });
};

/**
 * Load all bucket files from IndexedDB
 */
export const loadBucketFiles = async (): Promise<BucketFile[]> => {
  const db = await initBucketDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_FILES], 'readonly');
    const store = transaction.objectStore(STORE_FILES);
    const request = store.getAll();
    
    request.onsuccess = () => {
      db.close();
      resolve(request.result);
    };
    
    request.onerror = () => {
      db.close();
      reject(new Error('Failed to load bucket files'));
    };
  });
};

/**
 * Load single bucket file by filename
 */
export const loadBucketFile = async (filename: string): Promise<BucketFile | null> => {
  const db = await initBucketDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_FILES], 'readonly');
    const store = transaction.objectStore(STORE_FILES);
    const request = store.get(filename);
    
    request.onsuccess = () => {
      db.close();
      resolve(request.result || null);
    };
    
    request.onerror = () => {
      db.close();
      reject(new Error(`Failed to load file: ${filename}`));
    };
  });
};

/**
 * Save bucket metadata to IndexedDB
 */
export const saveBucketMetadata = async (metadata: NSLMetadata): Promise<void> => {
  const db = await initBucketDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_METADATA], 'readwrite');
    const store = transaction.objectStore(STORE_METADATA);
    
    const request = store.put(metadata, 'current');
    
    request.onsuccess = () => {
      db.close();
      resolve();
    };
    
    request.onerror = () => {
      db.close();
      reject(new Error('Failed to save bucket metadata'));
    };
  });
};

/**
 * Load bucket metadata from IndexedDB
 */
export const loadBucketMetadata = async (): Promise<NSLMetadata | null> => {
  const db = await initBucketDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_METADATA], 'readonly');
    const store = transaction.objectStore(STORE_METADATA);
    const request = store.get('current');
    
    request.onsuccess = () => {
      db.close();
      resolve(request.result || null);
    };
    
    request.onerror = () => {
      db.close();
      reject(new Error('Failed to load bucket metadata'));
    };
  });
};

/**
 * Clear all bucket data from IndexedDB
 */
export const clearBucket = async (): Promise<void> => {
  const db = await initBucketDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_FILES, STORE_METADATA], 'readwrite');
    
    const filesStore = transaction.objectStore(STORE_FILES);
    const metadataStore = transaction.objectStore(STORE_METADATA);
    
    filesStore.clear();
    metadataStore.clear();
    
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    
    transaction.onerror = () => {
      db.close();
      reject(new Error('Failed to clear bucket'));
    };
  });
};

/**
 * Check if a bucket exists in storage
 */
export const hasBucket = async (): Promise<boolean> => {
  try {
    const metadata = await loadBucketMetadata();
    return metadata !== null;
  } catch (error) {
    console.error('Error checking bucket existence:', error);
    return false;
  }
};

/**
 * Get bucket storage statistics
 */
export const getBucketStats = async (): Promise<{
  fileCount: number;
  totalSize: number;
  hasMetadata: boolean;
}> => {
  try {
    const files = await loadBucketFiles();
    const metadata = await loadBucketMetadata();
    
    const totalSize = files.reduce((sum, file) => sum + file.content.length, 0);
    
    return {
      fileCount: files.length,
      totalSize,
      hasMetadata: metadata !== null
    };
  } catch (error) {
    console.error('Error getting bucket stats:', error);
    return {
      fileCount: 0,
      totalSize: 0,
      hasMetadata: false
    };
  }
};
