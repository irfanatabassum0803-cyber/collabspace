import { INITIAL_WELCOME_DOC, STORAGE_KEYS } from './constants';

// Local storage and browser BroadcastChannel fallback for multi-tab collaboration
class FallbackStorageManager {
  constructor() {
    this.broadcastChannel = null;
    this.listeners = new Set();
    this.presenceMap = new Map(); // docId -> Map(userId -> { user, lastSeen })

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('collabspace_bus');
      this.broadcastChannel.onmessage = (event) => {
        this.handleBroadcastMessage(event.data);
      };
    }
  }

  handleBroadcastMessage(data) {
    if (!data || !data.type) return;

    if (data.type === 'PRESENCE_PING') {
      const { docId, user } = data;
      if (!this.presenceMap.has(docId)) {
        this.presenceMap.set(docId, new Map());
      }
      this.presenceMap.get(docId).set(user.id, {
        user,
        lastSeen: Date.now()
      });
    }

    // Notify registered subscribers
    for (const listener of this.listeners) {
      listener(data);
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  broadcast(message) {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(message);
      } catch (e) {
        console.warn('BroadcastChannel error', e);
      }
    }
  }

  getDocuments() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOCAL_DOCS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading local documents', e);
    }
    // Initial default documents
    const initial = [INITIAL_WELCOME_DOC];
    this.saveDocuments(initial);
    return initial;
  }

  saveDocuments(docs) {
    try {
      localStorage.setItem(STORAGE_KEYS.LOCAL_DOCS, JSON.stringify(docs));
    } catch (e) {
      console.warn('Error saving local documents', e);
    }
  }

  getDocument(id) {
    const docs = this.getDocuments();
    return docs.find(d => d.id === id) || null;
  }

  createDocument(doc) {
    const docs = this.getDocuments();
    const newDoc = {
      ...doc,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const updatedDocs = [newDoc, ...docs];
    this.saveDocuments(updatedDocs);
    this.broadcast({ type: 'DOC_CREATED', payload: newDoc });
    return newDoc;
  }

  updateDocument(id, updates) {
    const docs = this.getDocuments();
    let updatedDoc = null;
    const newDocs = docs.map(d => {
      if (d.id === id) {
        updatedDoc = {
          ...d,
          ...updates,
          updated_at: new Date().toISOString()
        };
        return updatedDoc;
      }
      return d;
    });

    if (updatedDoc) {
      this.saveDocuments(newDocs);
    }
    return updatedDoc;
  }

  deleteDocument(id) {
    const docs = this.getDocuments();
    const filtered = docs.filter(d => d.id !== id);
    this.saveDocuments(filtered);
    this.broadcast({ type: 'DOC_DELETED', payload: { id } });
    return filtered;
  }
}

export const fallbackStorage = new FallbackStorageManager();
