/* ============================================
   ⚽ يومي v4.0 - Quran Module
   CDN: quran-json@3.1.2
   Audio: mp3quran.net + everyayah.com
   ============================================ */

'use strict';

var QuranModule = (function() {

  /* ============ المصادر ============ */
  var CDN_BASE = 'https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/chapters';
  var LOCAL_BASE = '../json/quran/chapters';

  var CDN_INDEX = CDN_BASE + '/index.json';
  var CDN_SURAH = function(id) { return CDN_BASE + '/' + id + '.json'; };
  var LOCAL_INDEX = LOCAL_BASE + '/index.json';
  var LOCAL_SURAH = function(id) { return LOCAL_BASE + '/' + id + '.json'; };

  /* ============ Cache ============ */
  var CACHE_PREFIX = 'yawmi_quran_';
  var CACHE_DURATION = 30 * 24 * 60 * 60 * 1000;

  var surahsList = null;
  var surahCache = {};

  function getCache(key) {
    try {
      var raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      var entry = JSON.parse(raw);
      if (Date.now() > entry.expiresAt) {
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }
      return entry.value;
    } catch (e) {
      return null;
    }
  }

  function setCache(key, value) {
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({
        value: value,
        expiresAt: Date.now() + CACHE_DURATION
      }));
    } catch (e) {}
  }

  /* ============ Fetch with Timeout ============ */
  function fetchWithTimeout(url, timeoutMs) {
    timeoutMs = timeoutMs || 10000;

    return new Promise(function(resolve, reject) {
      var controller;
      var timeoutId;

      if (typeof AbortController !== 'undefined') {
        controller = new AbortController();
        timeoutId = setTimeout(function() { controller.abort(); }, timeoutMs);

        fetch(url, { signal: controller.signal })
          .then(function(res) {
            clearTimeout(timeoutId);
            resolve(res);
          })
          .catch(function(err) {
            clearTimeout(timeoutId);
            reject(err);
          });
      } else {
        timeoutId = setTimeout(function() {
          reject(new Error('Timeout'));
        }, timeoutMs);

        fetch(url)
          .then(function(res) {
            clearTimeout(timeoutId);
            resolve(res);
          })
          .catch(function(err) {
            clearTimeout(timeoutId);
            reject(err);
          });
      }
    });
  }

  /* ============ تحميل قائمة السور ============ */
  async function loadSurahsList() {
    if (surahsList && surahsList.length) return surahsList;

    var cached = getCache('surahs_list');
    if (cached && cached.length) {
      surahsList = cached;
      return surahsList;
    }

    var urls = [CDN_INDEX, LOCAL_INDEX];

    for (var i = 0; i < urls.length; i++) {
      try {
        console.log('🔄 محاولة:', urls[i]);

        var res = await fetchWithTimeout(urls[i], 10000);

        if (!res.ok) throw new Error('HTTP ' + res.status);

        var data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('بيانات فاضية');
        }

        surahsList = data;
        setCache('surahs_list', data);
        console.log('✅ تم التحميل:', data.length, 'سورة');
        return data;

      } catch (e) {
        console.warn('⚠️ فشل:', urls[i], '—', e.message);
      }
    }

    console.error('❌ فشل تحميل السور');
    return [];
  }

  /* ============ تحميل سورة ============ */
  async function loadSurah(surahId) {
    if (surahCache[surahId]) return surahCache[surahId];

    var cached = getCache('surah_' + surahId);
    if (cached) {
      surahCache[surahId] = cached;
      return cached;
    }

    var urls = [CDN_SURAH(surahId), LOCAL_SURAH(surahId)];

    for (var i = 0; i < urls.length; i++) {
      try {
        var res = await fetchWithTimeout(urls[i], 15000);

        if (!res.ok) throw new Error('HTTP ' + res.status);

        var data = await res.json();

        if (!data || !data.verses || data.verses.length === 0) {
          throw new Error('لا توجد آيات');
        }

        surahCache[surahId] = data;
        setCache('surah_' + surahId, data);
        return data;

      } catch (e) {
        console.warn('⚠️ سورة ' + surahId + ':', e.message);
      }
    }

    return null;
  }

  /* ============ جلب آية ============ */
  async function getAyah(surahId, ayahNum) {
    var surah = await loadSurah(surahId);
    if (!surah || !surah.verses) return null;
    return surah.verses[ayahNum - 1] || null;
  }

  /* ============ معلومات سورة ============ */
  async function getSurahInfo(surahId) {
    var list = await loadSurahsList();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === parseInt(surahId)) return list[i];
    }
    return null;
  }

  /* ============ البحث ============ */
  async function searchSurahs(query) {
    var list = await loadSurahsList();
    var q = query.trim().toLowerCase();
    if (!q) return list;

    return list.filter(function(s) {
      return (s.name && s.name.indexOf(q) !== -1) ||
             (s.transliteration && s.transliteration.toLowerCase().indexOf(q) !== -1) ||
             (String(s.id) === q);
    });
  }

  /* ============ روابط الصوت ============ */
  var RECITER_SERVERS = {
    alafasy: 'https://server8.mp3quran.net/afs/',
    sudais: 'https://server11.mp3quran.net/sds/',
    shuraim: 'https://server7.mp3quran.net/shr/',
    maher: 'https://server12.mp3quran.net/maher/',
    husary: 'https://server13.mp3quran.net/husr/',
    minshawi: 'https://server10.mp3quran.net/minsh/',
    abdulbasit: 'https://server7.mp3quran.net/basit/',
    ghamdi: 'https://server7.mp3quran.net/s_gmd/',
    juhany: 'https://server13.mp3quran.net/jhn/',
    dossari: 'https://server11.mp3quran.net/yasser/'
  };

  var AYAH_RECITER_PATHS = {
    alafasy: 'Alafasy_128kbps',
    sudais: 'Abdurrahmaan_As-Sudais_192kbps',
    shuraim: 'Saood_ash-Shuraym_128kbps',
    maher: 'Maher_AlMuaiqly_128kbps',
    husary: 'Husary_128kbps',
    minshawi: 'Minshawy_Murattal_128kbps',
    abdulbasit: 'Abdul_Basit_Murattal_192kbps',
    ghamdi: 'Ghamadi_40kbps'
  };

  function getAudioUrl(surahId, reciter) {
    reciter = reciter || 'alafasy';
    var server = RECITER_SERVERS[reciter] || RECITER_SERVERS.alafasy;
    var num = String(surahId);
    while (num.length < 3) num = '0' + num;
    return server + num + '.mp3';
  }

  function getAyahAudioUrl(surahId, ayahNum, reciter) {
    reciter = reciter || 'alafasy';
    var path = AYAH_RECITER_PATHS[reciter] || AYAH_RECITER_PATHS.alafasy;
    var s = String(surahId);
    var a = String(ayahNum);
    while (s.length < 3) s = '0' + s;
    while (a.length < 3) a = '0' + a;
    return 'https://everyayah.com/data/' + path + '/' + s + a + '.mp3';
  }

  /* ============ تشغيل الصوت ============ */
  var currentAudio = null;
  var currentKey = null;

  function playAudio(url, key, onEnd, onError) {
    // لو نفس الملف شغال، اوقفه
    if (currentKey === key && currentAudio && !currentAudio.paused) {
      stopAudio();
      if (onEnd) onEnd();
      return null;
    }

    stopAudio();

    try {
      var audio = new Audio(url);
      audio.crossOrigin = 'anonymous';
      currentAudio = audio;
      currentKey = key;

      var playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(function() {
            console.log('✅ جاري التشغيل:', key);
          })
          .catch(function(err) {
            console.error('❌ فشل التشغيل:', err);
            currentAudio = null;
            currentKey = null;
            if (onError) onError(err);
          });
      }

      audio.onended = function() {
        console.log('✅ انتهى:', key);
        currentAudio = null;
        currentKey = null;
        if (onEnd) onEnd();
      };

      audio.onerror = function(err) {
        console.error('❌ خطأ الصوت:', err);
        currentAudio = null;
        currentKey = null;
        if (onError) onError(err);
      };

      return audio;
    } catch (e) {
      console.error('❌ خطأ:', e);
      if (onError) onError(e);
      return null;
    }
  }

  function stopAudio() {
    if (currentAudio) {
      try {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      } catch (e) {}
      currentAudio = null;
      currentKey = null;
    }
  }

  function isPlaying(key) {
    return currentKey === key && currentAudio && !currentAudio.paused;
  }

  function playSurahAudio(surahId, reciter, onEnd, onError) {
    var url = getAudioUrl(surahId, reciter);
    var key = 'surah_' + surahId + '_' + reciter;
    return playAudio(url, key, onEnd, onError);
  }

  function playAyahAudio(surahId, ayahNum, reciter, onEnd, onError) {
    var url = getAyahAudioUrl(surahId, ayahNum, reciter);
    var key = 'ayah_' + surahId + '_' + ayahNum + '_' + reciter;
    return playAudio(url, key, onEnd, onError);
  }

  /* ============ خطة الحفظ ============ */
  async function generateMemorizationPlan(options) {
    options = options || {};
    var days = options.days || 30;
    var ayahsPerDay = options.ayahsPerDay || 3;
    var startSurah = options.startSurah || 1;
    var startAyah = options.startAyah || 1;

    var list = await loadSurahsList();
    if (!list.length) return [];

    var plan = [];
    var currentSurah = startSurah;
    var currentAyah = startAyah;

    var surahMap = {};
    list.forEach(function(s) { surahMap[s.id] = s; });

    for (var day = 1; day <= days; day++) {
      var dayPlan = {
        day: day,
        date: new Date(Date.now() + (day - 1) * 86400000).toISOString().split('T')[0],
        ayahs: []
      };

      for (var i = 0; i < ayahsPerDay; i++) {
        if (currentSurah > 114) break;
        var surah = surahMap[currentSurah];
        if (!surah) break;

        dayPlan.ayahs.push({
          surah: currentSurah,
          surahName: surah.name,
          ayah: currentAyah,
          totalAyahs: surah.total_verses
        });

        currentAyah++;
        if (currentAyah > surah.total_verses) {
          currentSurah++;
          currentAyah = 1;
        }
      }

      plan.push(dayPlan);
      if (currentSurah > 114) break;
    }

    return plan;
  }

  /* ============ إحصائيات ============ */
  async function getStats() {
    var list = await loadSurahsList();
    if (!list.length) return null;

    var totalAyahs = 0;
    var meccan = 0;
    var medinan = 0;

    list.forEach(function(s) {
      totalAyahs += s.total_verses || 0;
      if (s.type === 'meccan') meccan++;
      else if (s.type === 'medinan') medinan++;
    });

    return {
      totalSurahs: list.length,
      totalAyahs: totalAyahs,
      meccanSurahs: meccan,
      medinanSurahs: medinan,
      totalJuz: 30,
      totalPages: 604
    };
  }

  /* ============ مسح الكاش ============ */
  function clearCache() {
    try {
      var keys = Object.keys(localStorage);
      keys.forEach(function(k) {
        if (k.indexOf(CACHE_PREFIX) === 0) {
          localStorage.removeItem(k);
        }
      });
      surahsList = null;
      surahCache = {};
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ============ Public API ============ */
  return {
    loadSurahsList: loadSurahsList,
    loadSurah: loadSurah,
    getAyah: getAyah,
    getSurahInfo: getSurahInfo,
    searchSurahs: searchSurahs,
    getAudioUrl: getAudioUrl,
    getAyahAudioUrl: getAyahAudioUrl,
    reciters: Object.keys(RECITER_SERVERS),
    generateMemorizationPlan: generateMemorizationPlan,
    getStats: getStats,
    clearCache: clearCache,
    playSurahAudio: playSurahAudio,
    playAyahAudio: playAyahAudio,
    stopAudio: stopAudio,
    isPlaying: isPlaying
  };

})();

window.QuranModule = QuranModule;

console.log('📖 Quran Module Loaded (quran-json@3.1.2)');