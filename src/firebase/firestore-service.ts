import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  query,
  onSnapshot,
  Timestamp,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from './config';
import type { Member, Employee, Settlement, DevNote, FavoriteLink, MemberOptionsSettings } from '../../types';

// Utility function to remove undefined values from an object
function removeUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

// Generic Firestore CRUD operations
export class FirestoreService<T extends { id?: number | string }> {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  // Get all documents from a collection
  async getAll(): Promise<T[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as T));
    } catch (error) {
      console.error(`Error getting documents from ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Get a single document by ID
  async getById(id: string): Promise<T | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { ...docSnap.data(), id: docSnap.id } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting document ${id} from ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Add a new document
  async add(data: Omit<T, 'id'>): Promise<string> {
    try {
      const dataWithTimestamp = {
        ...data,
        createdAt: new Date().toISOString()
      };
      const cleanedData = removeUndefined(dataWithTimestamp);
      const docRef = await addDoc(collection(db, this.collectionName), cleanedData);
      return docRef.id;
    } catch (error) {
      console.error(`Error adding document to ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Add a new document with a specific ID
  async setWithId(id: string, data: Omit<T, 'id'>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const dataWithTimestamp = {
        ...data,
        createdAt: (data as any).createdAt || new Date().toISOString()
      };
      const cleanedData = removeUndefined(dataWithTimestamp);
      await setDoc(docRef, cleanedData);
    } catch (error) {
      console.error(`Error setting document ${id} in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Update an existing document
  async update(id: string, data: Partial<T>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const cleanedData = removeUndefined(data as any);
      await updateDoc(docRef, cleanedData);
    } catch (error) {
      console.error(`Error updating document ${id} in ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Delete a document
  async delete(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document ${id} from ${this.collectionName}:`, error);
      throw error;
    }
  }

  // Subscribe to real-time updates
  subscribe(callback: (data: T[]) => void): () => void {
    const q = query(collection(db, this.collectionName));

    const unsubscribe = onSnapshot(q,
      (querySnapshot) => {
        const data = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        } as T));
        callback(data);
      },
      (error) => {
        console.error(`Error in ${this.collectionName} subscription:`, error);
      }
    );

    return unsubscribe;
  }
}

// Specific services for each collection
export const memberService = new FirestoreService<Member>('members');
export const employeeService = memberService; // 하위 호환성을 위한 별칭
export const settlementService = new FirestoreService<Settlement>('settlements');
export const devNoteService = new FirestoreService<DevNote>('dev_notes');
export const favoriteUrlService = new FirestoreService<FavoriteLink>('favorite_urls');

// Prompts service (for AI prompt templates)
export interface Prompt {
  id?: string;
  [key: string]: any;
}

export const promptService = new FirestoreService<Prompt>('prompts');

// Member options service (for managing role and department options)
export const memberOptionsService = new FirestoreService<MemberOptionsSettings>('settings');

// Export deleteField for use in components
export { deleteField };
