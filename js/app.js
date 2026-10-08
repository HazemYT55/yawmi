/* ============================================
   ⚽ يومي v4.0 - Main App Logic
   ============================================ */

'use strict';

/* ============================================
   1. STATE
============================================ */
var STORAGE_KEY = 'yawmi_yawmi_v4';

var defaultState = {
  user: { name: '', age: 13, gender: 'male', height: null, weight: null },
  inputs: {
    wakeUp: '06:00', schoolStart: '07:00', schoolEnd: '14:30',
    trainingTime: '17:00', trainingDuration: 90, trainingType: 'agility',
    homeworks: [], quranRecent: 2, quranOld: 1, quranNew: 1
  },
  schedule: [],
  completed: {},
  streak: 0,
  lastActiveDate: null,
  totalPoints: 0,
  totalTasksCompleted: 0,
  totalQuranPages: 0,
  totalWorkouts: 0,
  totalStrength: 0,
  totalAgility: 0,
  totalEndurance: 0,
  pomodoroSessions: 0,
  earlyWakeups: 0,
  perfectDays: 0,
  weeklyHistory: {},
  darkMode: false,
  soundEnabled: true,
  weekendMode: false,
  mood: 'medium',
  rewards: [
    { id: 'r1', name: '🎮 ساعة ألعاب إضافية', cost: 500 },
    { id: 'r2', name: '🍕 رحلة مطعم نهاية الأسبوع', cost: 1000 },
    { id: 'r3', name: '⚽ كرة قدم جديدة', cost: 2000 }
  ],
  weather: null
};

var state = JSON.parse(JSON.stringify(defaultState));

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}
}

function loadState() {
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      var parsed = JSON.parse(saved);
      state = deepMerge(defaultState, parsed);
    }
  } catch (e) {}
}

function deepMerge(target, source) {
  var output = {};
  for (var k in target) output[k] = target[k];
  for (var key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      output[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      output[key] = source[key];
    }
  }
  return output;
}

/* ============================================
   2. UTILS
============================================ */
function timeToMinutes(t) {
  if (!t) return 0;
  var p = t.split(':');
  return parseInt(p[0]) * 60 + parseInt(p[1]);
}

function minutesToTime(m) {
  m = ((m % 1440) + 1440) % 1440;
  var h = Math.floor(m / 60);
  var mn = m % 60;
  return String(h).padStart(2, '0') + ':' + String(mn).padStart(2, '0');
}

function formatTime12(t) {
  if (!t) return '';
  var p = t.split(':');
  var h = parseInt(p[0]);
  var m = p[1];
  var period = h >= 12 ? 'م' : 'ص';
  var h12 = h % 12 || 12;
  return h12 + ':' + m + ' ' + period;
}

function todayKey() {
  var d = new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function $(id) { return document.getElementById(id); }

function showToast(msg) {
  var t = $('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(function() { t.classList.remove('show'); }, 2500);
}

function showNotif(title, body) {
  var n = $('notifBanner');
  if (!n) return;
  var nt = $('notifTitle'), nb = $('notifBody');
  if (nt) nt.textContent = title;
  if (nb) nb.textContent = body;
  n.classList.add('show');
  clearTimeout(showNotif._t);
  showNotif._t = setTimeout(function() { n.classList.remove('show'); }, 4000);
}

function showModal(icon, title, text, content) {
  var mi = $('modalIcon'), mt = $('modalTitle'), mx = $('modalText');
  var mc = $('modalContent'), mo = $('modalOverlay');
  if (mi) mi.textContent = icon;
  if (mt) mt.textContent = title;
  if (mx) mx.textContent = text;
  if (mc) mc.innerHTML = content || '';
  if (mo) mo.classList.add('show');
}

function closeModal() {
  var mo = $('modalOverlay');
  if (mo) mo.classList.remove('show');
}

/* ============================================
   3. SOUND
============================================ */
var audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {}
  }
  return audioCtx;
}

function playBeep(freq, dur, type) {
  freq = freq || 800;
  dur = dur || 150;
  type = type || 'sine';
  if (!state.soundEnabled) return;
  var ctx = getAudioCtx();
  if (!ctx) return;
  try {
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = 0.15;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur / 1000);
    osc.stop(ctx.currentTime + dur / 1000);
  } catch (e) {}
}

function playTick() { playBeep(1200, 40, 'square'); }

function playSuccess() {
  if (!state.soundEnabled) return;
  [523, 659, 784].forEach(function(f, i) {
    setTimeout(function() { playBeep(f, 120); }, i * 100);
  });
}

function playAlert() {
  if (!state.soundEnabled) return;
  [880, 660, 880].forEach(function(f, i) {
    setTimeout(function() { playBeep(f, 200, 'triangle'); }, i * 200);
  });
}

/* ============================================
   4. TOGGLES
============================================ */
function toggleSound() {
  state.soundEnabled = !state.soundEnabled;
  var btn = $('soundBtn');
  if (btn) btn.textContent = state.soundEnabled ? '🔊' : '🔇';
  if (state.soundEnabled) playBeep(800, 150);
  saveState();
}

function toggleDarkMode() {
  state.darkMode = !state.darkMode;
  document.body.classList.toggle('dark', state.darkMode);
  var btn = $('darkBtn');
  if (btn) btn.textContent = state.darkMode ? '☀️' : '🌙';
  saveState();
}

function toggleWeekend() {
  state.weekendMode = !state.weekendMode;
  var t = $('weekendToggle'), b = $('weekendBadge'), f = $('schoolFields');
  if (t) t.classList.toggle('on', state.weekendMode);
  if (b) b.classList.toggle('hidden', !state.weekendMode);
  if (f) f.style.display = state.weekendMode ? 'none' : 'block';
  showToast(state.weekendMode ? '🏖️ يوم إجازة' : '🏫 وضع المدرسة');
  playBeep(700, 100);
  saveState();
}

function selectMood(mood) {
  state.mood = mood;
  var opts = document.querySelectorAll('.mood-option[data-mood]');
  opts.forEach(function(el) {
    el.classList.toggle('selected', el.dataset.mood === mood);
  });
  playTick();
  saveState();
}

function selectGender(gender) {
  state.user.gender = gender;
  var opts = document.querySelectorAll('[data-gender]');
  opts.forEach(function(el) {
    el.classList.toggle('selected', el.dataset.gender === gender);
  });
  playTick();
  saveState();
}

/* ============================================
   5. HOMEWORK
============================================ */
function addHomework(data) {
  data = data || {};
  var div = document.createElement('div');
  div.className = 'homework-item';
  div.innerHTML =
    '<input type="text" placeholder="اسم المادة" value="' + (data.name || '') + '">' +
    '<input type="time" value="' + (data.due || '') + '">' +
    '<button onclick="this.parentElement.remove(); playTick();">×</button>';
  var list = $('homeworkList');
  if (list) list.appendChild(div);
}

function collectHomeworks() {
  var list = [];
  var items = document.querySelectorAll('.homework-item');
  items.forEach(function(item, idx) {
    var inputs = item.querySelectorAll('input');
    var name = inputs[0].value.trim();
    if (name) {
      list.push({
        id: 'hw_' + idx + '_' + Date.now(),
        name: name,
        due: inputs[1].value || '23:59'
      });
    }
  });
  return list;
}

/* ============================================
   6. WEATHER
============================================ */
async function fetchWeather() {
  try {
    var pos = await new Promise(function(resolve, reject) {
      if (!navigator.geolocation) return reject('no geo');
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
    });
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' +
      pos.coords.latitude + '&longitude=' + pos.coords.longitude + '&current_weather=true';
    var res = await fetch(url);
    var data = await res.json();
    var cw = data.current_weather;
    state.weather = {
      temp: Math.round(cw.temperature),
      code: cw.weathercode,
      wind: cw.windspeed
    };
  } catch (e) {
    state.weather = { temp: 28, code: 0, wind: 10 };
  }
  saveState();
  renderWeather();
}

function getWeatherInfo(code) {
  if (code === 0) return { icon: '☀️', desc: 'صافي' };
  if (code <= 3) return { icon: '⛅', desc: 'غائم جزئياً' };
  if (code <= 48) return { icon: '🌫️', desc: 'ضباب' };
  if (code <= 67) return { icon: '🌧️', desc: 'مطر' };
  if (code <= 77) return { icon: '❄️', desc: 'ثلج' };
  if (code <= 82) return { icon: '🌧️', desc: 'زخات مطر' };
  return { icon: '⛈️', desc: 'عاصف' };
}

function renderWeather() {
  var card = $('weatherCard');
  var chip = $('weatherChip');
  var w = state.weather;
  if (!card || !w) return;

  var info = getWeatherInfo(w.code);
  var isBad = w.code >= 51 || w.temp > 38 || w.temp < 10;

  if (chip) {
    chip.classList.remove('hidden');
    chip.textContent = info.icon + ' ' + w.temp + '°C';
  }

  card.innerHTML =
    '<div class="weather-card">' +
      '<div class="weather-main">' +
        '<div>' +
          '<div class="weather-temp">' + w.temp + '°C</div>' +
          '<div class="weather-desc">' + info.desc + ' • رياح ' + w.wind + ' كم/س</div>' +
        '</div>' +
        '<div class="weather-icon">' + info.icon + '</div>' +
      '</div>' +
      '<div class="weather-advice">' +
        (isBad
          ? '⚠️ <strong>الجو مش مناسب للتمرين الخارجي!</strong>'
          : '✅ <strong>الجو مناسب للتمرين الخارجي!</strong>') +
      '</div>' +
    '</div>';
}

/* ============================================
   7. GENERATE SCHEDULE
============================================ */
function generateSchedule() {
  var userNameEl = $('userName');
  var userAgeEl = $('userAge');
  var userHeightEl = $('userHeight');
  var userWeightEl = $('userWeight');

  if (userNameEl && userNameEl.value) state.user.name = userNameEl.value.trim();
  if (userAgeEl) state.user.age = parseInt(userAgeEl.value) || 13;
  if (userHeightEl && userHeightEl.value) state.user.height = parseInt(userHeightEl.value);
  if (userWeightEl && userWeightEl.value) state.user.weight = parseInt(userWeightEl.value);

  var wakeUp = timeToMinutes($('wakeUp').value);
  var trainingTime = timeToMinutes($('trainingTime').value);
  var trainingDur = parseInt($('trainingDuration').value) || 90;
  var trainingType = $('trainingType').value;
  var homeworks = collectHomeworks();
  var quranRecent = parseInt($('quranRecent').value) || 0;
  var quranOld = parseInt($('quranOld').value) || 0;
  var quranNew = parseInt($('quranNew').value) || 0;
  var isWeekend = state.weekendMode;

  var schoolStart, schoolEnd;
  if (isWeekend) {
    schoolStart = 0; schoolEnd = 0;
  } else {
    schoolStart = timeToMinutes($('schoolStart').value);
    schoolEnd = timeToMinutes($('schoolEnd').value);
  }

  state.inputs = {
    wakeUp: $('wakeUp').value,
    schoolStart: $('schoolStart').value,
    schoolEnd: $('schoolEnd').value,
    trainingTime: $('trainingTime').value,
    trainingDuration: trainingDur,
    trainingType: trainingType,
    homeworks: homeworks,
    quranRecent: quranRecent,
    quranOld: quranOld,
    quranNew: quranNew
  };

  if (wakeUp <= 360) state.earlyWakeups++;

  var schedule = [];
  var cursor = wakeUp;
  var idCounter = 0;

  function add(start, duration, title, category, desc) {
    schedule.push({
      id: 'task_' + idCounter++,
      start: minutesToTime(start),
      end: minutesToTime(start + duration),
      title: title,
      category: category,
      desc: desc || '',
      startMin: start,
      endMin: start + duration
    });
  }

  var moodFactor = state.mood === 'high' ? 1.15 : state.mood === 'low' ? 0.75 : 1;

  add(cursor, 15, '🌅 استيقاظ + وضوء + صلاة الفجر', 'meal');
  cursor += 15;

  var quranMinBase = 15 + (quranNew * 5) + (quranRecent * 3) + (quranOld * 2);
  var quranMin = Math.round(quranMinBase * (isWeekend ? 1.5 : 1));
  add(cursor, quranMin, '📖 الحفظ القرآني', 'quran',
      'جديد: ' + quranNew + '، قريب: ' + quranRecent + '، بعيد: ' + quranOld);
  cursor += quranMin;

  if (!isWeekend) {
    var prepTime = Math.max(15, schoolStart - cursor - 5);
    if (prepTime > 0) {
      add(cursor, prepTime, '🍳 الفطور والاستعداد', 'meal');
      cursor += prepTime;
    }
    add(schoolStart, schoolEnd - schoolStart, '🏫 المدرسة', 'school', 'ركّز وخذ ملاحظات');
    cursor = schoolEnd;
  } else {
    add(cursor, 40, '🍳 فطور مريح + وقت عائلي', 'meal');
    cursor += 40;
    if (homeworks.length > 0) {
      add(cursor, 45, '📝 جلسة مذاكرة صباحية', 'study');
      cursor += 45;
    }
  }

  add(cursor, 45, '🍽️ غداء + راحة', 'meal');
  cursor += 45;

  homeworks.sort(function(a, b) { return timeToMinutes(a.due) - timeToMinutes(b.due); });
  homeworks.forEach(function(hw) {
    var dur = Math.round(40 * moodFactor);
    add(cursor, dur, '📝 واجب: ' + hw.name, 'study', 'التسليم: ' + formatTime12(hw.due));
    cursor += dur;
    add(cursor, 10, '☕ راحة قصيرة', 'meal');
    cursor += 10;
  });

  add(cursor, 15, '📖 مراجعة سريعة للحفظ', 'quran');
  cursor += 15;

  if (trainingTime > cursor) cursor = trainingTime;
  var trainingDurFinal = Math.round(trainingDur * moodFactor * (isWeekend ? 1.2 : 1));
  var isBadWeather = state.weather && (state.weather.code >= 51 || state.weather.temp > 38 || state.weather.temp < 10);
  var trainingTitle = isBadWeather ? '⚽ تدريب كرة (منزلي)' : '⚽ تدريب كرة القدم';
  var trainingDesc = isBadWeather ? 'تمارين داخلية' : 'ركّز على التمركز والرشاقة';
  add(cursor, trainingDurFinal, trainingTitle, 'sport', trainingDesc);
  cursor += trainingDurFinal;

  var homeWorkoutDur = isWeekend ? 30 : 20;
  add(cursor, homeWorkoutDur, '💪 تمارين مدافع منزلية', 'sport', getWorkoutForToday(trainingType));
  cursor += homeWorkoutDur;

  add(cursor, 45, '🍽️ عشاء + وقت عائلي', 'meal');
  cursor += 45;

  var freeTime = isWeekend ? 90 : 30;
  add(cursor, freeTime, isWeekend ? '🎮 وقت حر طويل' : '🎮 وقت حر', 'meal');
  cursor += freeTime;

  add(cursor, 15, '📖 مراجعة قرآن قبل النوم', 'quran', 'تثبيت الحفظ');
  cursor += 15;

  var sleepTargetMin = wakeUp - 540 + 1440;
  add(sleepTargetMin % 1440, 540, '😴 النوم (9 ساعات)', 'sleep', 'نم مبكراً');

  state.schedule = schedule;
  state.completed = {};
  updateStreak();
  saveState();
  renderSchedule();
  scheduleNotifications();
  switchTab('schedule');
  playSuccess();
  showToast('✅ تم توليد جدولك!');
}

function getWorkoutForToday(type) {
  var workouts = {
    agility: 'سلّم رشاقة + تغيير اتجاه سريع',
    jump: 'قفز رأسي 3×12 + قفز جانبي',
    fitness: '20×3 قرفصاء + 60ث×3 بلانك',
    defense: 'تمركز + تغطية عكسية + قطع الكرة',
    rest: 'تمدد خفيف + إطالة'
  };
  return workouts[type] || workouts.agility;
}
/* ============================================
   8. RENDER SCHEDULE
============================================ */
function renderSchedule() {
  var timeline = $('timeline');
  if (!timeline) return;
  timeline.innerHTML = '';

  var profileCard = $('userProfileCard');
  if (profileCard) {
    var u = state.user;
    profileCard.innerHTML =
      '<div class="user-avatar">' + (u.gender === 'female' ? '👧' : '👦') + '</div>' +
      '<div class="user-info">' +
        '<div class="user-name">أهلاً ' + (u.name || 'بطل') + '! 👋</div>' +
        '<div class="user-details">' +
          u.age + ' سنة' +
          (u.height ? ' • ' + u.height + ' سم' : '') +
          (u.weight ? ' • ' + u.weight + ' كجم' : '') +
        '</div>' +
      '</div>';
  }

  if (!state.schedule.length) {
    timeline.innerHTML = '<div class="empty"><div class="empty-icon">📅</div><p>لا يوجد جدول بعد</p></div>';
    return;
  }

  var now = new Date();
  var nowMin = now.getHours() * 60 + now.getMinutes();

  state.schedule.forEach(function(task, idx) {
    var div = document.createElement('div');
    div.className = 'task ' + task.category;
    if (state.completed[task.id]) div.classList.add('done');

    var isCurrent = nowMin >= task.startMin && nowMin < task.endMin && !state.completed[task.id];
    if (isCurrent) div.classList.add('current');

    div.style.animationDelay = (idx * 0.05) + 's';

    var showPomodoro = task.category === 'study' || task.category === 'quran';

    var html =
      '<div class="task-header">' +
        '<div style="flex: 1;">' +
          '<div class="task-time">' + formatTime12(task.start) + ' - ' + formatTime12(task.end) + '</div>' +
          '<div class="task-title">' + task.title + '</div>';

    if (task.desc) {
      html += '<div class="task-desc">' + task.desc + '</div>';
    }

    if (showPomodoro && !state.completed[task.id]) {
      html += '<button class="pomodoro-btn" onclick="openPomodoro(\'' + task.id + '\')">🍅 ابدأ Pomodoro</button>';
    }

    html +=
        '</div>' +
        '<button class="task-check ' + (state.completed[task.id] ? 'done' : '') + '" onclick="toggleTask(\'' + task.id + '\')">' +
          (state.completed[task.id] ? '✓' : '') +
        '</button>' +
      '</div>';

    div.innerHTML = html;
    timeline.appendChild(div);
  });

  updateProgress();
  updateCurrentBanner(nowMin);
  renderWeather();

  var wsb = $('weekendScheduleBadge');
  if (wsb) {
    wsb.innerHTML = state.weekendMode ? '<div class="weekend-badge">🏖️ وضع الإجازة مفعّل</div>' : '';
  }
}

function toggleTask(taskId) {
  var wasCompleted = state.completed[taskId];

  if (wasCompleted) {
    delete state.completed[taskId];
    state.totalPoints = Math.max(0, state.totalPoints - 10);
  } else {
    state.completed[taskId] = true;
    state.totalPoints += 10;
    state.totalTasksCompleted++;
    playSuccess();

    var task = state.schedule.find(function(t) { return t.id === taskId; });
    if (task && task.category === 'quran') {
      var pages = (state.inputs.quranNew || 0) + (state.inputs.quranRecent || 0) + (state.inputs.quranOld || 0);
      state.totalQuranPages += pages;
    }

    if (Object.keys(state.completed).length === state.schedule.length) {
      state.perfectDays++;
      setTimeout(function() {
        fireConfetti();
        showModal('🏆', 'أحسنت يا بطل!', 'أكملت جميع مهام اليوم!');
      }, 300);
    } else {
      showToast('🎉 أحسنت! +10 نقاط');
    }
  }

  var tk = todayKey();
  state.weeklyHistory[tk] = Object.keys(state.completed).length;
  saveState();
  renderSchedule();
}

function updateProgress() {
  var total = state.schedule.length;
  var done = Object.keys(state.completed).length;
  var percent = total ? Math.round((done / total) * 100) : 0;

  var pf = $('progressFill'), pp = $('progressPercent');
  var cc = $('completedCount'), tc = $('totalCount'), pv = $('pointsValue');

  if (pf) pf.style.width = percent + '%';
  if (pp) pp.textContent = percent + '%';
  if (cc) cc.textContent = done;
  if (tc) tc.textContent = total;
  if (pv) pv.textContent = state.totalPoints;
}

function updateCurrentBanner(nowMin) {
  var banner = $('currentTaskBanner');
  if (!banner) return;

  var current = state.schedule.find(function(t) {
    return nowMin >= t.startMin && nowMin < t.endMin && !state.completed[t.id];
  });

  if (!current) { banner.innerHTML = ''; return; }

  var remaining = current.endMin - nowMin;
  var h = Math.floor(remaining / 60);
  var m = remaining % 60;
  var remainStr = h > 0 ? h + ' س ' + m + ' د' : m + ' دقيقة';

  banner.innerHTML =
    '<div class="current-banner">' +
      '<div class="current-banner-label">⏰ المهمة الحالية</div>' +
      '<div class="current-banner-title">' + current.title + '</div>' +
      '<div class="current-banner-time">حتى ' + formatTime12(current.end) + '</div>' +
      '<div class="countdown">⏳ متبقي: ' + remainStr + '</div>' +
    '</div>';
}

/* ============================================
   9. AI ADJUST
============================================ */
function emergencyAdjust() {
  var now = new Date();
  var nowMin = now.getHours() * 60 + now.getMinutes();

  var remaining = state.schedule.filter(function(t) {
    return !state.completed[t.id] && t.endMin > nowMin;
  });
  var done = state.schedule.filter(function(t) {
    return state.completed[t.id] || t.endMin <= nowMin;
  });

  if (remaining.length === 0) { showToast('لا يوجد مهام متبقية!'); return; }

  var cursor = Math.max(nowMin + 5, timeToMinutes(state.inputs.wakeUp));
  var newSchedule = done.slice();

  remaining.forEach(function(task) {
    var duration = task.endMin - task.startMin;
    var newDuration = duration > 40 ? Math.round(duration * 0.7) : duration;
    newSchedule.push({
      id: task.id,
      start: minutesToTime(cursor),
      end: minutesToTime(cursor + newDuration),
      title: task.title + (newDuration < duration ? ' ⚡' : ''),
      category: task.category,
      desc: (task.desc || '') + ' (مُعدّل)',
      startMin: cursor,
      endMin: cursor + newDuration
    });
    cursor += newDuration + 5;
  });

  state.schedule = newSchedule.sort(function(a, b) { return a.startMin - b.startMin; });
  saveState();
  renderSchedule();
  playAlert();
  showModal('🤖', 'تم التعديل الذكي!', 'أعاد التطبيق ترتيب مهامك المتبقية.');
}

/* ============================================
   10. POMODORO
============================================ */
var pomodoroState = {
  active: false, timeLeft: 1500, isBreak: false,
  interval: null, currentTaskId: null, sound: 'none', soundNodes: []
};

function openPomodoro(taskId) {
  pomodoroState.currentTaskId = taskId || null;
  pomodoroState.timeLeft = 1500;
  pomodoroState.isBreak = false;
  pomodoroState.active = true;

  var overlay = $('pomodoroOverlay');
  if (overlay) overlay.classList.add('show');

  var mode = $('pomodoroMode');
  if (mode) mode.textContent = '🍅 وقت التركيز';

  updatePomodoroDisplay();
  startPomodoroInterval();
  playBeep(660, 200);
}

function startPomodoroInterval() {
  clearInterval(pomodoroState.interval);
  pomodoroState.interval = setInterval(function() {
    if (!pomodoroState.active) return;
    pomodoroState.timeLeft--;
    updatePomodoroDisplay();

    if (pomodoroState.timeLeft <= 10 && pomodoroState.timeLeft > 0) playTick();

    if (pomodoroState.timeLeft <= 0) {
      if (!pomodoroState.isBreak) {
        state.pomodoroSessions++;
        playSuccess();
        showNotif('✅ انتهى وقت التركيز!', 'خذ راحة 5 دقائق');
        pomodoroState.isBreak = true;
        pomodoroState.timeLeft = 300;
        var m1 = $('pomodoroMode');
        if (m1) m1.textContent = '☕ وقت الراحة';
      } else {
        playAlert();
        showNotif('⏰ انتهت الراحة!', 'ارجع للتركيز');
        pomodoroState.isBreak = false;
        pomodoroState.timeLeft = 1500;
        var m2 = $('pomodoroMode');
        if (m2) m2.textContent = '🍅 وقت التركيز';
      }
      saveState();
      updatePomodoroDisplay();
    }
  }, 1000);
}

function updatePomodoroDisplay() {
  var t = pomodoroState.timeLeft;
  var m = Math.floor(t / 60);
  var s = t % 60;

  var timeEl = $('pomodoroTime');
  if (timeEl) {
    timeEl.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }

  var total = pomodoroState.isBreak ? 300 : 1500;
  var progress = 1 - (t / total);
  var circle = $('pomodoroCircle');
  if (circle) {
    circle.style.strokeDashoffset = 628 * (1 - progress);
  }
}

function togglePomodoro() {
  pomodoroState.active = !pomodoroState.active;
  var btn = $('pomodoroToggleBtn');
  if (btn) {
    btn.textContent = pomodoroState.active ? '⏸️ إيقاف' : '▶️ استئناف';
  }
  playBeep(500, 100);
}

function closePomodoro() {
  clearInterval(pomodoroState.interval);
  pomodoroState.active = false;
  stopAmbientSound();
  var overlay = $('pomodoroOverlay');
  if (overlay) overlay.classList.remove('show');
}

/* ============================================
   11. AMBIENT SOUNDS
============================================ */
function selectSound(type, btn) {
  var btns = document.querySelectorAll('.sound-btn');
  btns.forEach(function(b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  pomodoroState.sound = type;
  stopAmbientSound();
  if (type !== 'none') startAmbientSound(type);
}

function startAmbientSound(type) {
  stopAmbientSound();
  var ctx = getAudioCtx();
  if (!ctx) return;

  try {
    var bufferSize = 2 * ctx.sampleRate;
    var noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var output = noiseBuffer.getChannelData(0);

    for (var i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    var whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    var filter = ctx.createBiquadFilter();
    var gain = ctx.createGain();

    if (type === 'rain') {
      filter.type = 'lowpass';
      filter.frequency.value = 400;
      gain.gain.value = 0.1;
    } else if (type === 'forest') {
      filter.type = 'bandpass';
      filter.frequency.value = 800;
      gain.gain.value = 0.06;
    } else if (type === 'waves') {
      filter.type = 'lowpass';
      filter.frequency.value = 200;
      gain.gain.value = 0.12;
    }

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    whiteNoise.start();

    pomodoroState.soundNodes = [whiteNoise, gain];
  } catch (e) {}
}

function stopAmbientSound() {
  pomodoroState.soundNodes.forEach(function(node) {
    try { if (node.stop) node.stop(); } catch (e) {}
    try { if (node.disconnect) node.disconnect(); } catch (e) {}
  });
  pomodoroState.soundNodes = [];
}

/* ============================================
   12. NOTIFICATIONS
============================================ */
async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    try { await Notification.requestPermission(); } catch (e) {}
  }
}

function scheduleNotifications() {
  if (!state.schedule.length) return;

  if (window.__yawmiTimeouts) {
    window.__yawmiTimeouts.forEach(function(t) { clearTimeout(t); });
  }
  window.__yawmiTimeouts = [];

  var now = new Date();
  var nowMs = now.getTime();

  state.schedule.forEach(function(task) {
    var parts = task.start.split(':').map(Number);
    var target = new Date();
    target.setHours(parts[0], parts[1], 0, 0);
    if (target.getTime() < nowMs) target.setDate(target.getDate() + 1);

    var delay = target.getTime() - nowMs;
    var delay5 = delay - 300000;

    if (delay5 > 0 && delay5 < 86400000) {
      var tid = setTimeout(function() {
        playAlert();
        showNotif('⏰ استعد!', 'بعد 5 دقائق: ' + task.title);
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('⏰ يومي', { body: 'بعد 5 دقائق: ' + task.title });
        }
      }, delay5);
      window.__yawmiTimeouts.push(tid);
    }

    if (delay > 0 && delay < 86400000) {
      var tid2 = setTimeout(function() {
        playAlert();
        showNotif('🎯 الوقت الآن!', task.title);
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('🎯 يومي', { body: 'ابدأ: ' + task.title });
        }
      }, delay);
      window.__yawmiTimeouts.push(tid2);
    }
  });
}

/* ============================================
   13. BADGES
============================================ */
var BADGES = {
  streak: {
    title: '🔥 شارات الاستمرارية',
    items: [
      { id: 'st1', icon: '🌱', name: 'بداية الطريق', check: function(s) { return s.streak >= 1; } },
      { id: 'st2', icon: '🔥', name: '3 أيام', check: function(s) { return s.streak >= 3; } },
      { id: 'st3', icon: '🔥🔥', name: 'أسبوع كامل', check: function(s) { return s.streak >= 7; } },
      { id: 'st4', icon: '💪💪', name: 'أسبوعين', check: function(s) { return s.streak >= 14; } },
      { id: 'st5', icon: '👑', name: 'شهر كامل', check: function(s) { return s.streak >= 30; } },
      { id: 'st6', icon: '🌟', name: 'أسطورة', check: function(s) { return s.streak >= 100; }, gold: true }
    ]
  },
  points: {
    title: '⭐ شارات النقاط',
    items: [
      { id: 'p1', icon: '⭐', name: 'مبتدئ', check: function(s) { return s.totalPoints >= 50; } },
      { id: 'p2', icon: '⭐⭐', name: 'نشيط', check: function(s) { return s.totalPoints >= 100; } },
      { id: 'p3', icon: '⭐⭐⭐', name: 'مجتهد', check: function(s) { return s.totalPoints >= 250; } },
      { id: 'p4', icon: '💎', name: 'محترف', check: function(s) { return s.totalPoints >= 500; } },
      { id: 'p5', icon: '👑', name: 'خبير', check: function(s) { return s.totalPoints >= 1000; }, gold: true }
    ]
  },
  quran: {
    title: '📖 شارات القرآن',
    items: [
      { id: 'q1', icon: '📖', name: 'أول صفحة', check: function(s) { return s.totalQuranPages >= 1; } },
      { id: 'q2', icon: '📚', name: '10 صفحات', check: function(s) { return s.totalQuranPages >= 10; } },
      { id: 'q3', icon: '📚📚', name: '50 صفحة', check: function(s) { return s.totalQuranPages >= 50; } },
      { id: 'q4', icon: '🕌', name: 'جزء كامل', check: function(s) { return s.totalQuranPages >= 20; } },
      { id: 'q5', icon: '👑', name: 'ملك الحفظ', check: function(s) { return s.totalQuranPages >= 200; }, gold: true }
    ]
  },
  sport: {
    title: '⚽ شارات الرياضة',
    items: [
      { id: 'sp1', icon: '⚽', name: 'رياضي مبتدئ', check: function(s) { return s.totalWorkouts >= 5; } },
      { id: 'sp2', icon: '🏃', name: 'رياضي نشيط', check: function(s) { return s.totalWorkouts >= 20; } },
      { id: 'sp3', icon: '💪', name: 'قوي', check: function(s) { return s.totalStrength >= 10; } },
      { id: 'sp4', icon: '🏃‍♂️', name: 'رشيق', check: function(s) { return s.totalAgility >= 10; } },
      { id: 'sp5', icon: '🫀', name: 'متحمل', check: function(s) { return s.totalEndurance >= 10; } },
      { id: 'sp6', icon: '🏆', name: 'بطل', check: function(s) { return s.totalWorkouts >= 100; }, gold: true }
    ]
  },
  special: {
    title: '🎯 شارات خاصة',
    items: [
      { id: 'x1', icon: '🌅', name: 'مبكر', check: function(s) { return s.earlyWakeups >= 7; } },
      { id: 'x2', icon: '🎯', name: 'مدقق', check: function(s) { return s.perfectDays >= 3; } },
      { id: 'x3', icon: '🧠', name: 'مركز', check: function(s) { return s.pomodoroSessions >= 10; } },
      { id: 'x4', icon: '🏖️', name: 'مستمتع', check: function(s) { return s.weekendMode === true; } },
      { id: 'x5', icon: '🌙', name: 'مثالي', check: function(s) { return s.perfectDays >= 5; }, gold: true }
    ]
  }
};

function renderBadges() {
  var container = $('badgesContainer');
  if (!container) return { totalUnlocked: 0, totalBadges: 0 };

  var html = '', totalUnlocked = 0, totalBadges = 0;

  for (var key in BADGES) {
    var cat = BADGES[key];
    var unlockedInCat = cat.items.filter(function(b) { return b.check(state); }).length;
    totalUnlocked += unlockedInCat;
    totalBadges += cat.items.length;

    html += '<div class="badge-category">';
    html += '<div class="badge-category-title"><span>' + cat.title + '</span>';
    html += '<span class="badge-category-count">' + unlockedInCat + '/' + cat.items.length + '</span></div>';
    html += '<div class="badges-grid">';

    cat.items.forEach(function(b) {
      var unlocked = b.check(state);
      html += '<div class="badge-item ' + (unlocked ? 'unlocked' : '') + ' ' + (b.gold ? 'gold' : '') + '">';
      html += '<div class="badge-icon">' + (unlocked ? b.icon : '🔒') + '</div>';
      html += '<div class="badge-name">' + b.name + '</div></div>';
    });

    html += '</div></div>';
  }

  container.innerHTML = html;
  return { totalUnlocked: totalUnlocked, totalBadges: totalBadges };
}

/* ============================================
   14. REWARDS
============================================ */
function renderRewards() {
  var list = $('rewardsList');
  if (!list) return;

  list.innerHTML = state.rewards.map(function(r) {
    var canClaim = state.totalPoints >= r.cost;
    var progress = Math.min(100, (state.totalPoints / r.cost) * 100);
    return '<div class="reward-item">' +
      '<div class="reward-info">' +
        '<div class="reward-name">' + r.name + '</div>' +
        '<div class="reward-desc">' + state.totalPoints + ' / ' + r.cost + ' نقطة</div>' +
        '<div class="reward-progress"><div class="reward-fill" style="width: ' + progress + '%"></div></div>' +
      '</div>' +
      '<div class="reward-status">' + (canClaim ? '🎁' : '🔒') + '</div>' +
    '</div>';
  }).join('');
}

function addReward() {
  var name = prompt('اسم المكافأة:');
  if (!name) return;
  var cost = parseInt(prompt('عدد النقاط:', '500'));
  if (!cost) return;
  state.rewards.push({ id: 'r_' + Date.now(), name: name, cost: cost });
  saveState();
  renderRewards();
  showToast('✅ تمت الإضافة');
}

/* ============================================
   15. STATS
============================================ */
function renderStats() {
  var setText = function(id, val) {
    var el = $(id);
    if (el) el.textContent = val;
  };
  setText('statStreak', state.streak);
  setText('statPoints', state.totalPoints);
  setText('statTasks', state.totalTasksCompleted);
  setText('statQuran', state.totalQuranPages);
  renderBadges();
  renderWeeklyChart();
  renderRewards();
}

function renderWeeklyChart() {
  var chart = $('weeklyChart');
  if (!chart) return;

  var days = [];
  var dayNames = ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'];

  for (var i = 6; i >= 0; i--) {
    var d = new Date();
    d.setDate(d.getDate() - i);
    var key = d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
    days.push({
      label: dayNames[d.getDay()],
      value: state.weeklyHistory[key] || 0
    });
  }

  var values = days.map(function(d) { return d.value; });
  values.push(5);
  var max = Math.max.apply(null, values);

  chart.innerHTML = days.map(function(d) {
    var h = (d.value / max) * 100;
    return '<div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;">' +
      '<div style="font-size: 10px; color: var(--text-light); font-weight: bold;">' + d.value + '</div>' +
      '<div style="width: 100%; height: 80px; display: flex; align-items: flex-end;">' +
        '<div style="width: 100%; height: ' + h + '%; min-height: 4px; background: linear-gradient(180deg, var(--primary-light), var(--primary)); border-radius: 6px 6px 0 0;"></div>' +
      '</div>' +
      '<div style="font-size: 10px; color: var(--text-light);">' + d.label + '</div>' +
    '</div>';
  }).join('');
}

function shareProgress() {
  var text = '🏆 إنجازي في تطبيق يومي:\n' +
    '🔥 ' + state.streak + ' يوم متتالي\n' +
    '⭐ ' + state.totalPoints + ' نقطة\n' +
    '✅ ' + state.totalTasksCompleted + ' مهمة\n' +
    '📖 ' + state.totalQuranPages + ' صفحة قرآن';

  if (navigator.share) {
    navigator.share({ title: 'إنجازي في يومي', text: text }).catch(function() {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function() {
      showToast('📋 تم نسخ الإنجاز!');
    });
  }
}

/* ============================================
   16. NAVIGATION
============================================ */
function switchTab(tab) {
  var screens = ['schedule', 'input', 'stats', 'download'];

  screens.forEach(function(t) {
    var screen = $(t + 'Screen');
    if (screen) screen.classList.toggle('hidden', t !== tab);

    var nav = $('nav' + t.charAt(0).toUpperCase() + t.slice(1));
    if (nav) nav.classList.toggle('active', t === tab);
  });

  if (tab === 'stats') renderStats();
  if (tab === 'schedule' && state.schedule.length) renderSchedule();

  window.scrollTo(0, 0);
}

function backToInput() {
  var setVal = function(id, val) {
    var el = $(id);
    if (el) el.value = val;
  };

  setVal('wakeUp', state.inputs.wakeUp);
  setVal('schoolStart', state.inputs.schoolStart);
  setVal('schoolEnd', state.inputs.schoolEnd);
  setVal('trainingTime', state.inputs.trainingTime);
  setVal('trainingDuration', state.inputs.trainingDuration);
  setVal('trainingType', state.inputs.trainingType || 'agility');
  setVal('quranRecent', state.inputs.quranRecent || 2);
  setVal('quranOld', state.inputs.quranOld || 1);
  setVal('quranNew', state.inputs.quranNew || 1);

  var hwList = $('homeworkList');
  if (hwList) {
    hwList.innerHTML = '';
    if (state.inputs.homeworks && state.inputs.homeworks.length) {
      state.inputs.homeworks.forEach(function(hw) { addHomework(hw); });
    } else {
      addHomework();
    }
  }

  var wToggle = $('weekendToggle');
  if (wToggle) wToggle.classList.toggle('on', state.weekendMode);

  var schoolFields = $('schoolFields');
  if (schoolFields) schoolFields.style.display = state.weekendMode ? 'none' : 'block';

  document.querySelectorAll('.mood-option[data-mood]').forEach(function(el) {
    el.classList.toggle('selected', el.dataset.mood === state.mood);
  });

  switchTab('input');
}

function resetDay() {
  if (confirm('هل تريد بدء يوم جديد؟')) {
    state.completed = {};
    saveState();
    renderSchedule();
    playSuccess();
    showToast('🌅 يوم جديد سعيد!');
  }
}

function resetAllData() {
  if (confirm('⚠️ هل أنت متأكد؟ سيتم حذف كل بياناتك!')) {
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  }
}

/* ============================================
   17. TACTICAL TIPS
============================================ */
function renderTacticalTip() {
  var tips = [
    { title: '🛡️ التغطية العكسية', text: 'راقب المهاجم اللي بيقطع من العمق. اتخذ خطوة للخلف قبل ما يوصلك الباص.' },
    { title: '⏱️ توقيت القطع', text: 'لا تقطع الكرة إلا لما المهاجم يلمسها تحكم كامل.' },
    { title: '🦶 الوقفة الصحيحة', text: 'قدماك بعرض كتفيك، ووزنك على مقدمة القدم.' },
    { title: '👀 التواصل مع الحارس', text: 'اتفق مع حارسك على إشارات. لما يطلع، أنت ترجع تغطي.' },
    { title: '🎯 الدفاع كوحدة', text: 'تحرك مع خط الدفاع ككتلة واحدة.' },
    { title: '⚡ الالتحام الذكي', text: 'التحم بكتفك مش بذراعك. القوة في التوازن.' },
    { title: '🔄 التعافي بعد الخطأ', text: 'لو غلطت، اركض بسرعة للخلف.' }
  ];

  var tip = tips[Math.floor(Math.random() * tips.length)];
  var el = $('tacticalTip');
  if (el) {
    el.innerHTML = '<div class="tactical-tip"><strong>' + tip.title + '</strong>' + tip.text + '</div>';
  }
}

/* ============================================
   18. STREAK
============================================ */
function updateStreak() {
  var today = todayKey();
  var d = new Date();
  d.setDate(d.getDate() - 1);
  var yesterday = d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');

  if (state.lastActiveDate === today) return;

  if (state.lastActiveDate === yesterday) {
    state.streak++;
  } else {
    state.streak = 1;
  }

  state.lastActiveDate = today;
  var el = $('streakDays');
  if (el) el.textContent = state.streak;
  saveState();
}

/* ============================================
   19. CONFETTI
============================================ */
function fireConfetti() {
  var colors = ['#1a237e', '#3949ab', '#43a047', '#fb8c00', '#fdd835', '#e53935', '#8e24aa'];

  for (var i = 0; i < 50; i++) {
    (function(index) {
      setTimeout(function() {
        var c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = Math.random() * 100 + '%';
        c.style.background = colors[Math.floor(Math.random() * colors.length)];
        c.style.animationDuration = (Math.random() * 2 + 2) + 's';
        c.style.width = (Math.random() * 8 + 6) + 'px';
        c.style.height = (Math.random() * 8 + 6) + 'px';
        document.body.appendChild(c);
        setTimeout(function() { c.remove(); }, 4000);
      }, index * 30);
    })(i);
  }
}

/* ============================================
   20. SETTINGS
============================================ */
function showSettings() {
  var badges = renderBadges();
  showModal('⚙️', 'الإعدادات',
    '🔊 الصوت: ' + (state.soundEnabled ? 'مفعّل' : 'معطّل') + '\n' +
    '🌙 الوضع الليلي: ' + (state.darkMode ? 'مفعّل' : 'معطّل') + '\n' +
    '🏖️ وضع الإجازة: ' + (state.weekendMode ? 'مفعّل' : 'معطّل') + '\n' +
    '🏆 الإنجازات: ' + badges.totalUnlocked + ' من ' + badges.totalBadges);
}

/* ============================================
   21. INIT
============================================ */
function initApp() {
  loadState();

  if (state.darkMode) {
    document.body.classList.add('dark');
    var db = $('darkBtn');
    if (db) db.textContent = '☀️';
  }

  var sb = $('soundBtn');
  if (sb) sb.textContent = state.soundEnabled ? '🔊' : '🔇';

  var sd = $('streakDays');
  if (sd) sd.textContent = state.streak;

  var pv = $('pointsValue');
  if (pv) pv.textContent = state.totalPoints;

  var setVal = function(id, val) {
    var el = $(id);
    if (el) el.value = val;
  };

  setVal('wakeUp', state.inputs.wakeUp);
  setVal('schoolStart', state.inputs.schoolStart);
  setVal('schoolEnd', state.inputs.schoolEnd);
  setVal('trainingTime', state.inputs.trainingTime);
  setVal('trainingDuration', state.inputs.trainingDuration);
  setVal('trainingType', state.inputs.trainingType || 'agility');
  setVal('quranRecent', state.inputs.quranRecent || 2);
  setVal('quranOld', state.inputs.quranOld || 1);
  setVal('quranNew', state.inputs.quranNew || 1);

  var wt = $('weekendToggle');
  if (wt) wt.classList.toggle('on', state.weekendMode);

  var wb = $('weekendBadge');
  if (wb) wb.classList.toggle('hidden', !state.weekendMode);

  var sf = $('schoolFields');
  if (sf) sf.style.display = state.weekendMode ? 'none' : 'block';

  document.querySelectorAll('.mood-option[data-mood]').forEach(function(el) {
    el.classList.toggle('selected', el.dataset.mood === state.mood);
  });

  var hwList = $('homeworkList');
  if (hwList) {
    hwList.innerHTML = '';
    if (state.inputs.homeworks && state.inputs.homeworks.length) {
      state.inputs.homeworks.forEach(function(hw) { addHomework(hw); });
    } else {
      addHomework();
    }
  }

  // User profile summary
  var profileCard = $('userProfileCard');
  if (profileCard && state.user.name) {
    profileCard.style.display = 'flex';
    profileCard.querySelector('.user-name').textContent = 'أهلاً ' + state.user.name + '! 👋';
    profileCard.querySelector('.user-details').textContent = state.user.age + ' سنة';
    var avatar = profileCard.querySelector('.user-avatar');
    if (avatar) avatar.textContent = state.user.gender === 'female' ? '👧' : '👦';
  }

  if (typeof fetchWeather === 'function') {
    fetchWeather().then(function() { renderWeather(); }).catch(function() {});
  }
  renderTacticalTip();

  if (state.schedule.length) {
    renderSchedule();
    switchTab('schedule');
    scheduleNotifications();
  } else {
    switchTab('input');
  }

  requestNotificationPermission();

  setInterval(function() {
    var sch = $('scheduleScreen');
    if (state.schedule.length && sch && !sch.classList.contains('hidden')) {
      var now = new Date();
      updateCurrentBanner(now.getHours() * 60 + now.getMinutes());
    }
  }, 60000);

  setInterval(saveState, 30000);

  console.log('✅ App initialized');
}

/* ============================================
   22. EVENT LISTENERS
============================================ */
document.addEventListener('touchstart', function unlockAudio() {
  getAudioCtx();
  document.removeEventListener('touchstart', unlockAudio);
}, { once: true });

document.addEventListener('click', function unlockAudioClick() {
  getAudioCtx();
  document.removeEventListener('click', unlockAudioClick);
}, { once: true });

window.addEventListener('beforeunload', saveState);

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

window.Yawmi = {
  state: state,
  saveState: saveState,
  loadState: loadState,
  showToast: showToast,
  showNotif: showNotif,
  showModal: showModal
};