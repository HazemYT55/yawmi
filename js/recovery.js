/* Yawmi Recovery Engine — additive module; does not replace the schedule generator. */
(function () {
  'use strict';
  var KEY = 'yawmi_recovery_v1';

  function readStore() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{"days":{},"deferred":[]}'); }
    catch (e) { return { days: {}, deferred: [] }; }
  }
  function writeStore(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function nowMinutes() {
    var d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }
  function timeLabel(mins) {
    mins = ((mins % 1440) + 1440) % 1440;
    var h = Math.floor(mins / 60), m = mins % 60;
    return (h % 12 || 12) + ':' + String(m).padStart(2, '0') + (h >= 12 ? ' م' : ' ص');
  }
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function getMissedTasks() {
    if (!window.state || !Array.isArray(state.schedule)) return [];
    var store = readStore(), day = store.days[today()] || {};
    var now = nowMinutes();
    return state.schedule.filter(function (task) {
      return task.endMin <= now && !state.completed[task.id] &&
        !day[task.id] && task.category !== 'sleep';
    }).sort(function (a, b) { return a.startMin - b.startMin; });
  }
  function findGap(duration, taskId) {
    var now = nowMinutes();
    var tasks = state.schedule.filter(function (t) {
      return t.id !== taskId && t.category !== 'sleep' && !state.completed[t.id];
    }).map(function (t) {
      var start = t.startMin, end = t.endMin;
      if (end <= now && start < now) return null;
      return { start: Math.max(start, now), end: end };
    }).filter(Boolean).sort(function (a, b) { return a.start - b.start; });
    var cursor = now;
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].start - cursor >= duration) return cursor;
      cursor = Math.max(cursor, tasks[i].end);
    }
    var sleep = state.schedule.find(function (t) { return t.category === 'sleep'; });
    var cutoff = sleep ? sleep.startMin : 22 * 60;
    if (cutoff <= now) cutoff += 1440;
    return cutoff - cursor >= duration ? cursor : null;
  }
  function setDecision(task, decision) {
    var store = readStore(), day = today();
    store.days[day] = store.days[day] || {};
    store.days[day][task.id] = decision;
    if (decision === 'tomorrow' && !store.deferred.some(function (t) { return t.sourceId === task.id && t.sourceDay === day; })) {
      store.deferred.push({ sourceId: task.id, sourceDay: day, title: task.title, category: task.category, duration: Math.max(5, task.endMin - task.startMin) });
    }
    writeStore(store);
    render();
    if (typeof showToast === 'function') showToast(decision === 'tomorrow' ? '📌 تم حفظ المهمة لخطة الغد' : '✅ تم تحديث خطة التعافي');
  }
  function recover(taskId) {
    var task = state.schedule.find(function (t) { return t.id === taskId; });
    if (!task) return;
    var duration = Math.max(5, task.endMin - task.startMin);
    var gap = findGap(duration, taskId);
    if (gap == null) {
      var choice = confirm('لا توجد فترة فارغة كافية اليوم دون ضغط المهام أو تأخير النوم. هل تريد نقل المهمة إلى قائمة الغد؟');
      if (choice) setDecision(task, 'tomorrow');
      return;
    }
    var store = readStore();
    store.days[today()] = store.days[today()] || {};
    store.days[today()][task.id] = 'rescheduled';
    writeStore(store);
    task.startMin = gap;
    task.endMin = gap + duration;
    task.start = window.minutesToTime(gap);
    task.end = window.minutesToTime(gap + duration);
    if (typeof saveState === 'function') saveState();
    render();
    if (typeof renderSchedule === 'function') renderSchedule();
    if (typeof showToast === 'function') showToast('🔄 اقتراح جديد: ' + timeLabel(gap));
  }
  function render() {
    var host = document.getElementById('recoveryPanel');
    if (!host || !window.state || !Array.isArray(state.schedule)) return;
    var missed = getMissedTasks();
    var store = readStore();
    var deferred = store.deferred.filter(function (t) { return t.sourceDay !== today(); });
    if (!state.schedule.length) {
      host.innerHTML = '<section class="recovery-card"><div class="recovery-heading">🛟 خطة إنقاذ اليوم</div><p>ولّد جدولك أولاً، وسأساعدك عندما تتأخر عن مهمة.</p></section>';
      return;
    }
    var html = '<section class="recovery-card"><div class="recovery-top"><div><div class="recovery-heading">🛟 خطة إنقاذ اليوم</div><p class="recovery-subtitle">التأخير مش فشل — عدّل الخطة من غير ما تضحي بالنوم.</p></div><span class="recovery-count">' + missed.length + '</span></div>';
    if (deferred.length) {
      html += '<div class="recovery-deferred"><strong>📌 من أمس</strong><p>' + deferred.map(function (t) { return esc(t.title); }).join('، ') + '</p><small>أعد إضافتها إلى جدول اليوم من شاشة الإدخال إذا كانت ما زالت مطلوبة.</small></div>';
    }
    if (!missed.length) {
      html += '<div class="recovery-empty">✨ أنت على المسار الصحيح! لا توجد مهام فائتة حتى الآن.</div>';
    } else {
      html += '<div class="recovery-list">' + missed.map(function (task) {
        var gap = findGap(Math.max(5, task.endMin - task.startMin), task.id);
        return '<article class="recovery-task"><div class="recovery-task-title">' + esc(task.title) + '</div><div class="recovery-meta">كان موعدها ' + timeLabel(task.startMin) + ' – ' + timeLabel(task.endMin) + '</div>' +
          (gap != null ? '<div class="recovery-suggestion">اقتراح: ' + timeLabel(gap) + ' · ' + Math.max(5, task.endMin - task.startMin) + ' دقيقة</div><button type="button" class="recovery-action" data-recover="' + esc(task.id) + '">انقلها للفترة المتاحة</button>' : '<div class="recovery-suggestion">ما فيش وقت كافي اليوم بدون تداخل أو تأخير النوم.</div><button type="button" class="recovery-action secondary" data-defer="' + esc(task.id) + '">انقلها لخطة الغد</button>') +
          '</article>';
      }).join('') + '</div>';
    }
    html += '<div class="recovery-footnote">لن يتم حذف أي مهمة تلقائياً، ولن يتم تغيير وقت النوم.</div></section>';
    host.innerHTML = html;
    host.querySelectorAll('[data-recover]').forEach(function (button) {
      button.addEventListener('click', function () { recover(button.getAttribute('data-recover')); });
    });
    host.querySelectorAll('[data-defer]').forEach(function (button) {
      button.addEventListener('click', function () {
        var task = state.schedule.find(function (t) { return t.id === button.getAttribute('data-defer'); });
        if (task && confirm('حفظ "' + task.title + '" في قائمة مهام الغد؟')) setDecision(task, 'tomorrow');
      });
    });
  }
  document.addEventListener('DOMContentLoaded', function () {
    render();
    var originalRenderSchedule = window.renderSchedule;
    if (typeof originalRenderSchedule === 'function') {
      window.renderSchedule = function () {
        originalRenderSchedule.apply(this, arguments);
        render();
      };
    }
    document.addEventListener('visibilitychange', function () { if (!document.hidden) render(); });
  });
  window.YawmiRecovery = { render: render, getMissedTasks: getMissedTasks };
})();