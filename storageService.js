// LocalStorage Persistence Service for Chat AI

const STORAGE_KEYS = {
  SESSIONS: 'chat_ai_sessions_v1',
  ACTIVE_SESSION: 'chat_ai_active_session_v1',
  SETTINGS: 'chat_ai_settings_v1',
  GALLERY: 'chat_ai_gallery_v1',
  FAVORITES: 'chat_ai_favorites_v1',
  SAVED_SNIPPETS: 'chat_ai_saved_snippets_v1'
};

export const DEFAULT_SETTINGS = {
  provider: 'default', // 'default' | 'gemini' | 'openai' | 'openrouter'
  geminiApiKey: '',
  geminiModel: 'gemini-2.0-flash',
  openaiApiKey: '',
  openaiModel: 'gpt-4o-mini',
  openrouterApiKey: '',
  openrouterModel: 'deepseek/deepseek-r1',
  systemPersona: 'general',
  customSystemPrompt: '',
  temperature: 0.7,
  theme: 'dark',
  lang: 'ar',
  autoSpeak: false,
  streamResponse: true
};

export const storageService = {
  // --- Settings ---
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (e) {
      console.error('Error reading settings from localStorage', e);
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings to localStorage', e);
    }
  },

  // --- Sessions / Chats ---
  getSessions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading sessions', e);
      return [];
    }
  },

  saveSessions(sessions) {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error('Error saving sessions', e);
    }
  },

  getActiveSessionId() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION) || null;
  },

  setActiveSessionId(id) {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    }
  },

  // --- Gallery Images ---
  getGallery() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GALLERY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading gallery', e);
      return [];
    }
  },

  saveImageToGallery(imageItem) {
    try {
      const gallery = this.getGallery();
      const updated = [imageItem, ...gallery.filter(item => item.id !== imageItem.id)];
      // Keep up to 60 images to prevent localStorage overflow
      const trimmed = updated.slice(0, 60);
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(trimmed));
      return trimmed;
    } catch (e) {
      console.error('Error saving image to gallery', e);
      return [];
    }
  },

  deleteImageFromGallery(id) {
    try {
      const gallery = this.getGallery();
      const updated = gallery.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error('Error deleting image from gallery', e);
      return [];
    }
  },

  // --- Saved Code Snippets ---
  getSavedSnippets() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SAVED_SNIPPETS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveSnippet(snippet) {
    try {
      const list = this.getSavedSnippets();
      const updated = [snippet, ...list.filter(s => s.id !== snippet.id)];
      localStorage.setItem(STORAGE_KEYS.SAVED_SNIPPETS, JSON.stringify(updated));
      return updated;
    } catch (e) {
      return [];
    }
  }
};
