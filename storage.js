/**
 * Chat AI - Storage & State Management
 */

const STORAGE_KEYS = {
  SESSIONS: 'chat_ai_pro_sessions',
  ACTIVE_ID: 'chat_ai_pro_active_id',
  SETTINGS: 'chat_ai_pro_settings',
  GALLERY: 'chat_ai_pro_gallery',
  SNIPPETS: 'chat_ai_pro_snippets'
};

export const DEFAULT_SETTINGS = {
  provider: 'default',
  geminiApiKey: '',
  geminiModel: 'gemini-1.5-flash',
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

export const Storage = {
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  },

  getSessions() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveSessions(sessions) {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (e) {
      console.error(e);
    }
  },

  getActiveSessionId() {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_ID) || null;
  },

  setActiveSessionId(id) {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
    }
  },

  getGallery() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GALLERY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  saveGallery(gallery) {
    try {
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(gallery.slice(0, 50)));
    } catch (e) {
      console.error(e);
    }
  }
};
