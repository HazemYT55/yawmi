/* ============================================
   ⚽ يومي v4.0 - Local Storage Manager
   ============================================ */

'use strict';

/* ============================================
   1. LOCALSTORAGE WRAPPER
============================================ */
const LocalManager = (function() {

  const PREFIX = 'yawmi_';
  const isAvailable = checkAvailability();

  function checkAvailability() {
    try {
      const test = '__yawmi_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      console.warn('⚠️ LocalStorage غير متاح، سنستخدم الذاكرة المؤقتة');
      return false;
    }
  }

  // Fallback للذاكرة (لو localStorage مش متاح)
  const memoryStore = {};

  function setItem(key, value) {
    const fullKey = PREFIX + key;

    if (isAvailable) {
      try {
        localStorage.setItem(fullKey, value);
        return true;
      } catch (e) {
        console.error('❌ فشل الحفظ:', e);
        return false;
      }
    } else {
      memoryStore[fullKey] = value;
      return true;
    }
  }

  function getItem(key) {
    const fullKey = PREFIX + key;

    if (isAvailable) {
      try {
        return localStorage.getItem(fullKey);
      } catch (e) {
        console.error('❌ فشل القراءة:', e);
        return null;
      }
    } else {
      return memoryStore[fullKey] || null;
    }
  }

  function removeItem(key) {
    const fullKey = PREFIX + key;

    if (isAvailable) {
      try {
        localStorage.removeItem(fullKey);
        return true;
      } catch (e) {
        return false;
      }
    } else {
      delete memoryStore[fullKey];
      return true;
    }
  }

  function clear() {
    if (isAvailable) {
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(PREFIX)) {
            localStorage.removeItem(key);
          }
        });
        return true;
      } catch (e) {
        return false;
      }
    } else {
      Object.keys(memoryStore).forEach(key => {
        if (key.startsWith(PREFIX)) {
          delete memoryStore[key];
        }
      });
      return true;
    }
  }

  function keys() {
    const result = [];

    if (isAvailable) {
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(PREFIX)) {
            result.push(key.replace(PREFIX, ''));
          }
        });
      } catch (e) {}
    } else {
      Object.keys(memoryStore).forEach(key => {
        if (key.startsWith(PREFIX)) {
          result.push(key.replace(PREFIX, ''));
        }
      });
    }

    return result;
  }

  function getSize() {
    let size = 0;

    if (isAvailable) {
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(PREFIX)) {
            size += localStorage.getItem(key).length + key.length;
          }
        });
      } catch (e) {}
    } else {
      Object.keys(memoryStore).forEach(key => {
        if (key.startsWith(PREFIX)) {
          size += memoryStore[key].length + key.length;
        }
      });
    }

    return size;
  }

  return {
    setItem,
    getItem,
    removeItem,
    clear,
    keys,
    getSize,
    isAvailable: () => isAvailable
  };
})();

/* ============================================
   2. INDEXEDDB FOR LARGE DATA
============================================ */
const DBManager = (function() {
  const DB_NAME = 'yawmi_db';
  const DB_VERSION = 1;
  const STORE_NAME = 'data';
  let db = null;

  function initDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject('IndexedDB غير مدعوم');
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        db = request.result;
        resolve(db);
      };

      request.onupgradeneeded = (event) => {
        const database = event.target.result;
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  function saveToDB(key, value) {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject('قاعدة البيانات غير جاهزة');
        return;
      }

      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const request = store.put({ id: key, value, timestamp: Date.now() });

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  function getFromDB(key) {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject('قاعدة البيانات غير جاهزة');
        return;
      }

      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result ? request.result.value : null);
      request.onerror = () => reject(request.error);
    });
  }

  function deleteFromDB(key) {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject('قاعدة البيانات غير جاهزة');
        return;
      }

      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  function getAllKeys() {
    return new Promise((resolve, reject) => {
      if (!db) {
        reject('قاعدة البيانات غير جاهزة');
        return;
      }

      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAllKeys();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  return {
    init: initDB,
    save: saveToDB,
    get: getFromDB,
    delete: deleteFromDB,
    getAllKeys
  };
})();

/* ============================================
   3. EXPORT / IMPORT DATA
============================================ */
function exportData(filename = null) {
  try {
    const data = {};

    // نجمع كل بيانات التطبيق
    const keys = LocalManager.keys();
    keys.forEach(key => {
      const value = LocalManager.getItem(key);
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch (e) {
          data[key] = value;
        }
      }
    });

    const exportObj = {
      app: 'yawmi',
      version: '4.0.0',
      exportedAt: new Date().toISOString(),
      data
    };

    const json = JSON.stringify(exportObj, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const date = new Date().toISOString().split('T')[0];
    const name = filename || `yawmi_backup_${date}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true, filename: name, size: json.length };
  } catch (e) {
    console.error('❌ خطأ في التصدير:', e);
    return { success: false, error: e.message };
  }
}

function importData(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject('لم يتم اختيار ملف');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const parsed = JSON.parse(content);

        // التحقق من الصيغة
        if (!parsed.app || parsed.app !== 'yawmi') {
          reject('الملف مش بتاع تطبيق يومي');
          return;
        }

        if (!parsed.data) {
          reject('الملف فاضي');
          return;
        }

        // استرجاع البيانات
        let count = 0;
        Object.keys(parsed.data).forEach(key => {
          const value = typeof parsed.data[key] === 'object'
            ? JSON.stringify(parsed.data[key])
            : parsed.data[key];
          if (LocalManager.setItem(key, value)) count++;
        });

        resolve({
          success: true,
          restoredKeys: count,
          version: parsed.version,
          exportedAt: parsed.exportedAt
        });
      } catch (err) {
        reject('الملف تالف أو مش JSON صحيح');
      }
    };

    reader.onerror = () => reject('فشل قراءة الملف');
    reader.readAsText(file);
  });
}

function triggerImport() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    importData(file)
      .then(result => {
        alert(`✅ تم استرجاع ${result.restoredKeys} مفتاح بنجاح!\nسيتم إعادة تحميل الصفحة.`);
        setTimeout(() => location.reload(), 1500);
      })
      .catch(err => {
        alert(`❌ فشل الاسترجاع: ${err}`);
      });
  };

  input.click();
}

/* ============================================
   4. AUTO BACKUP
============================================ */
const AutoBackup = (function() {
  const BACKUP_KEY = 'auto_backup';
  const BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 ساعة

  function createBackup() {
    const backup = {
      timestamp: Date.now(),
      data: {}
    };

    LocalManager.keys().forEach(key => {
      if (key !== BACKUP_KEY) {
        backup.data[key] = LocalManager.getItem(key);
      }
    });

    LocalManager.setItem(BACKUP_KEY, JSON.stringify(backup));
    return backup;
  }

  function restoreBackup() {
    const raw = LocalManager.getItem(BACKUP_KEY);
    if (!raw) return null;

    try {
      const backup = JSON.parse(raw);
      Object.keys(backup.data).forEach(key => {
        LocalManager.setItem(key, backup.data[key]);
      });
      return backup;
    } catch (e) {
      return null;
    }
  }

  function shouldBackup() {
    const raw = LocalManager.getItem(BACKUP_KEY);
    if (!raw) return true;

    try {
      const backup = JSON.parse(raw);
      return (Date.now() - backup.timestamp) > BACKUP_INTERVAL;
    } catch (e) {
      return true;
    }
  }

  function autoBackup() {
    if (shouldBackup()) {
      createBackup();
      console.log('✅ تم إنشاء نسخة احتياطية تلقائية');
    }
  }

  function getBackupInfo() {
    const raw = LocalManager.getItem(BACKUP_KEY);
    if (!raw) return null;

    try {
      const backup = JSON.parse(raw);
      return {
        timestamp: backup.timestamp,
        age: Date.now() - backup.timestamp,
        keys: Object.keys(backup.data).length
      };
    } catch (e) {
      return null;
    }
  }

  return {
    create: createBackup,
    restore: restoreBackup,
    auto: autoBackup,
    info: getBackupInfo,
    shouldBackup
  };
})();

/* ============================================
   5. SESSION MANAGEMENT
============================================ */
const Session = (function() {
  const SESSION_KEY = 'current_session';

  function create() {
    const session = {
      id: 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      startedAt: Date.now(),
      lastActive: Date.now(),
      duration: 0
    };

    LocalManager.setItem(SESSION_KEY, JSON.stringify(session));
    return session;
  }

  function get() {
    const raw = LocalManager.getItem(SESSION_KEY);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function update() {
    const session = get();
    if (session) {
      session.lastActive = Date.now();
      session.duration = Date.now() - session.startedAt;
      LocalManager.setItem(SESSION_KEY, JSON.stringify(session));
    }
    return session;
  }

  function clear() {
    LocalManager.removeItem(SESSION_KEY);
  }

  return { create, get, update, clear };
})();

/* ============================================
   6. CACHE (with TTL)
============================================ */
const Cache = (function() {
  const CACHE_PREFIX = 'cache_';

  function set(key, value, ttlMs = 60 * 60 * 1000) {
    const entry = {
      value,
      expiresAt: Date.now() + ttlMs,
      createdAt: Date.now()
    };

    LocalManager.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    return true;
  }

  function get(key) {
    const raw = LocalManager.getItem(CACHE_PREFIX + key);
    if (!raw) return null;

    try {
      const entry = JSON.parse(raw);

      if (Date.now() > entry.expiresAt) {
        LocalManager.removeItem(CACHE_PREFIX + key);
        return null;
      }

      return entry.value;
    } catch (e) {
      return null;
    }
  }

  function has(key) {
    return get(key) !== null;
  }

  function remove(key) {
    LocalManager.removeItem(CACHE_PREFIX + key);
  }

  function clearExpired() {
    const keys = LocalManager.keys();
    let cleared = 0;

    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        const raw = LocalManager.getItem(key);
        if (raw) {
          try {
            const entry = JSON.parse(raw);
            if (Date.now() > entry.expiresAt) {
              LocalManager.removeItem(key);
              cleared++;
            }
          } catch (e) {
            LocalManager.removeItem(key);
            cleared++;
          }
        }
      }
    });

    return cleared;
  }

  function clearAll() {
    const keys = LocalManager.keys();
    let cleared = 0;

    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        LocalManager.removeItem(key);
        cleared++;
      }
    });

    return cleared;
  }

  return { set, get, has, remove, clearExpired, clearAll };
})();

/* ============================================
   7. JSON FILE OPERATIONS
============================================ */
const JSONFile = (function() {

  async function load(path) {
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.error('❌ فشل تحميل JSON:', path, e);
      return null;
    }
  }

  async function loadWithCache(path, cacheKey = null, ttlMs = 60 * 60 * 1000) {
    const key = cacheKey || path.replace(/[^a-z0-9]/gi, '_');

    // جرب من الكاش الأول
    const cached = Cache.get(key);
    if (cached) return cached;

    // حمّل من الملف
    const data = await load(path);
    if (data) Cache.set(key, data, ttlMs);

    return data;
  }

  function save(filename, data) {
    try {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return true;
    } catch (e) {
      console.error('❌ فشل حفظ JSON:', e);
      return false;
    }
  }

  return { load, loadWithCache, save };
})();

/* ============================================
   8. HELPERS
============================================ */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

function getStorageInfo() {
  const size = LocalManager.getSize();
  const available = LocalManager.isAvailable();
  const keys = LocalManager.keys();
  const backup = AutoBackup.info();

  return {
    available,
    size,
    sizeFormatted: formatBytes(size),
    keysCount: keys.length,
    keys,
    backup
  };
}

function clearAllData() {
  if (!confirm('⚠️ هل أنت متأكد؟ سيتم حذف كل شيء!')) return false;
  LocalManager.clear();
  Cache.clearAll();
  Session.clear();
  return true;
}

/* ============================================
   9. INITIALIZATION
============================================ */
function initLocalManager() {
  if (!LocalManager.isAvailable) {
    console.warn('⚠️ LocalStorage غير مدعوم في هذا المتصفح');
  }

  // ابدأ IndexedDB
  DBManager.init()
    .then(() => console.log('✅ IndexedDB جاهز'))
    .catch(e => console.warn('⚠️ IndexedDB:', e));

  // نسخة احتياطية تلقائية
  AutoBackup.auto();

  // جلسة جديدة
  if (!Session.get()) {
    Session.create();
  } else {
    Session.update();
  }

  // نظف الكاش المنتهي
  const cleared = Cache.clearExpired();
  if (cleared > 0) {
    console.log(`🧹 تم تنظيف ${cleared} عنصر من الكاش`);
  }

  console.log('✅ Local Manager جاهز');
}

// تشغيل تلقائي
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLocalManager);
} else {
  initLocalManager();
}

/* ============================================
   10. EXPORTS
============================================ */
window.YawmiLocal = {
  // LocalStorage
  setItem: LocalManager.setItem,
  getItem: LocalManager.getItem,
  removeItem: LocalManager.removeItem,
  clear: LocalManager.clear,
  keys: LocalManager.keys,
  isAvailable: LocalManager.isAvailable,
  getSize: LocalManager.getSize,

  // IndexedDB
  db: {
    save: DBManager.save,
    get: DBManager.get,
    delete: DBManager.delete,
    keys: DBManager.getAllKeys
  },

  // Export/Import
  export: exportData,
  import: importData,
  triggerImport,

  // Backup
  backup: {
    create: AutoBackup.create,
    restore: AutoBackup.restore,
    auto: AutoBackup.auto,
    info: AutoBackup.info
  },

  // Session
  session: {
    create: Session.create,
    get: Session.get,
    update: Session.update,
    clear: Session.clear
  },

  // Cache
  cache: {
    set: Cache.set,
    get: Cache.get,
    has: Cache.has,
    remove: Cache.remove,
    clearExpired: Cache.clearExpired,
    clearAll: Cache.clearAll
  },

  // JSON
  json: {
    load: JSONFile.load,
    loadWithCache: JSONFile.loadWithCache,
    save: JSONFile.save
  },

  // Helpers
  formatBytes,
  getStorageInfo,
  clearAllData
};

console.log('⚽ يومي v4.0 - Local Manager Loaded');