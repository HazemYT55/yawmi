"""
============================================
⚽ يومي v4.0 - Flask API Server
============================================
الجزء 1: الإعداد + User + Schedule + Workouts
============================================
"""

# ============================================
# 1. IMPORTS
# ============================================
import os
import json
import time
import random
import hashlib
from datetime import datetime, timedelta
from functools import wraps
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory, abort
from flask_cors import CORS

# محاولة استيراد surahs (لو موجود)
try:
    from surahs import SURAHS, RECITERS, get_surah, get_ayah, get_audio_url
except ImportError:
    SURAHS = []
    RECITERS = []
    def get_surah(sid): return None
    def get_ayah(sid, aid): return None
    def get_audio_url(sid, reciter=None): return None


# ============================================
# 2. APP SETUP
# ============================================
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "json"
CACHE_DIR = BASE_DIR / "cache"

# إنشاء المجلدات لو مش موجودة
DATA_DIR.mkdir(exist_ok=True)
CACHE_DIR.mkdir(exist_ok=True)

app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path='')
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.config['JSON_AS_ASCII'] = False
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True


# ============================================
# 3. HELPERS
# ============================================
def success(data=None, message="OK", code=200):
    """رد ناجح موحد"""
    return jsonify({
        "success": True,
        "message": message,
        "data": data,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }), code


def error(message="حدث خطأ", code=400, details=None):
    """رد خطأ موحد"""
    return jsonify({
        "success": False,
        "message": message,
        "details": details,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }), code


def load_json_file(filename, default=None):
    """تحميل ملف JSON"""
    path = DATA_DIR / filename
    if not path.exists():
        return default
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"⚠️ خطأ في تحميل {filename}: {e}")
        return default


def save_json_file(filename, data):
    """حفظ ملف JSON"""
    path = DATA_DIR / filename
    try:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"⚠️ خطأ في حفظ {filename}: {e}")
        return False


def cache_get(key):
    """قراءة من الكاش"""
    path = CACHE_DIR / f"{key}.json"
    if not path.exists():
        return None
    try:
        with open(path, 'r', encoding='utf-8') as f:
            entry = json.load(f)
            if entry.get('expiresAt', 0) < time.time():
                path.unlink()
                return None
            return entry.get('value')
    except Exception:
        return None


def cache_set(key, value, ttl_seconds=3600):
    """حفظ في الكاش"""
    path = CACHE_DIR / f"{key}.json"
    entry = {
        "value": value,
        "expiresAt": time.time() + ttl_seconds,
        "createdAt": time.time()
    }
    try:
        with open(path, 'w', encoding='utf-8') as f:
            json.dump(entry, f, ensure_ascii=False)
        return True
    except Exception:
        return False


def require_json(f):
    """Decorator للتأكد من JSON في الطلب"""
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not request.is_json:
            return error("الطلب لازم يكون JSON", 400)
        return f(*args, **kwargs)
    return wrapper


# ============================================
# 4. STATIC FILES
# ============================================
@app.route('/')
def index():
    """الصفحة الرئيسية"""
    return send_from_directory(str(BASE_DIR), 'index.html')


@app.route('/health')
def health():
    """فحص الحالة"""
    return success({
        "status": "healthy",
        "version": "4.0.0",
        "uptime": time.time(),
        "surahs_loaded": len(SURAHS)
    })


# ============================================
# 5. USER API
# ============================================
@app.route('/api/user', methods=['GET'])
def get_user():
    """جلب بيانات المستخدم"""
    info = load_json_file('information_local.json', {})
    user = info.get('user', {})
    return success(user)


@app.route('/api/user', methods=['POST'])
@require_json
def update_user():
    """تحديث بيانات المستخدم"""
    data = request.get_json()

    info = load_json_file('information_local.json', {})
    if 'user' not in info:
        info['user'] = {}

    # تحديث الحقول المسموحة
    allowed = ['name', 'age', 'gender', 'height', 'weight', 'avatar']
    for key in allowed:
        if key in data:
            info['user'][key] = data[key]

    info['user']['lastLogin'] = datetime.utcnow().isoformat() + "Z"
    info['_metadata']['updatedAt'] = datetime.utcnow().isoformat() + "Z"

    if save_json_file('information_local.json', info):
        return success(info['user'], "تم تحديث بيانات المستخدم")
    return error("فشل حفظ البيانات", 500)


@app.route('/api/user/settings', methods=['GET'])
def get_settings():
    """جلب الإعدادات"""
    info = load_json_file('information_local.json', {})
    return success(info.get('settings', {}))


@app.route('/api/user/settings', methods=['PUT'])
@require_json
def update_settings():
    """تحديث الإعدادات"""
    data = request.get_json()

    info = load_json_file('information_local.json', {})
    if 'settings' not in info:
        info['settings'] = {}

    info['settings'].update(data)

    if save_json_file('information_local.json', info):
        return success(info['settings'], "تم تحديث الإعدادات")
    return error("فشل حفظ الإعدادات", 500)


@app.route('/api/user/stats', methods=['GET'])
def get_stats():
    """جلب الإحصائيات"""
    info = load_json_file('information_local.json', {})
    return success(info.get('stats', {}))


@app.route('/api/user/stats', methods=['POST'])
@require_json
def update_stats():
    """تحديث الإحصائيات (زيادة نقطة/مهمة)"""
    data = request.get_json()

    info = load_json_file('information_local.json', {})
    if 'stats' not in info:
        info['stats'] = {}

    # زيادة النقاط
    if 'points' in data:
        current = info['stats'].get('totalPoints', 0)
        info['stats']['totalPoints'] = max(0, current + int(data['points']))

    # زيادة المهام
    if 'tasks' in data:
        current = info['stats'].get('totalTasksCompleted', 0)
        info['stats']['totalTasksCompleted'] = max(0, current + int(data['tasks']))

    # زيادة صفحات القرآن
    if 'quranPages' in data:
        current = info['stats'].get('totalQuranPages', 0)
        info['stats']['totalQuranPages'] = max(0, current + int(data['quranPages']))

    # زيادة التمارين
    if 'workouts' in data:
        current = info['stats'].get('totalWorkouts', 0)
        info['stats']['totalWorkouts'] = max(0, current + int(data['workouts']))

    info['_metadata']['updatedAt'] = datetime.utcnow().isoformat() + "Z"

    if save_json_file('information_local.json', info):
        return success(info['stats'], "تم تحديث الإحصائيات")
    return error("فشل حفظ الإحصائيات", 500)


# ============================================
# 6. SCHEDULE API
# ============================================
@app.route('/api/schedule', methods=['GET'])
def get_schedule():
    """جلب الجدول الحالي"""
    info = load_json_file('information_local.json', {})
    schedule = info.get('schedule', {})
    return success(schedule.get('current', []))


@app.route('/api/schedule', methods=['POST'])
@require_json
def save_schedule():
    """حفظ جدول جديد"""
    data = request.get_json()
    tasks = data.get('tasks', [])

    info = load_json_file('information_local.json', {})
    if 'schedule' not in info:
        info['schedule'] = {'current': [], 'templates': [], 'history': []}

    info['schedule']['current'] = tasks

    if save_json_file('information_local.json', info):
        return success(tasks, f"تم حفظ {len(tasks)} مهمة")
    return error("فشل حفظ الجدول", 500)


@app.route('/api/schedule/generate', methods=['POST'])
@require_json
def generate_schedule():
    """توليد جدول تلقائياً"""
    data = request.get_json()

    wake_up = data.get('wakeUp', '06:00')
    school_start = data.get('schoolStart', '07:00')
    school_end = data.get('schoolEnd', '14:30')
    training_time = data.get('trainingTime', '17:00')
    training_dur = data.get('trainingDuration', 90)
    homeworks = data.get('homeworks', [])
    quran = data.get('quran', {'new': 1, 'recent': 2, 'old': 1})
    is_weekend = data.get('weekend', False)

    def to_min(t):
        h, m = map(int, t.split(':'))
        return h * 60 + m

    def to_time(m):
        m = m % 1440
        return f"{m // 60:02d}:{m % 60:02d}"

    def fmt12(t):
        h, m = map(int, t.split(':'))
        period = 'م' if h >= 12 else 'ص'
        h12 = h % 12 or 12
        return f"{h12}:{m:02d} {period}"

    schedule = []
    cursor = to_min(wake_up)
    idx = 0

    def add(start, dur, title, category, desc=''):
        nonlocal idx
        schedule.append({
            'id': f'task_{idx}',
            'start': to_time(start),
            'end': to_time(start + dur),
            'title': title,
            'category': category,
            'desc': desc,
            'startMin': start,
            'endMin': start + dur
        })
        idx += 1

    # استيقاظ
    add(cursor, 15, '🌅 استيقاظ + وضوء + صلاة الفجر', 'meal')
    cursor += 15

    # القرآن
    quran_min = 15 + quran.get('new', 1) * 5 + quran.get('recent', 2) * 3 + quran.get('old', 1) * 2
    if is_weekend:
        quran_min = int(quran_min * 1.5)
    add(cursor, quran_min, '📖 الحفظ القرآني', 'quran',
        f"جديد: {quran.get('new', 1)}، قريب: {quran.get('recent', 2)}، بعيد: {quran.get('old', 1)}")
    cursor += quran_min

    if not is_weekend:
        prep = max(15, to_min(school_start) - cursor - 5)
        if prep > 0:
            add(cursor, prep, '🍳 الفطور والاستعداد', 'meal')
            cursor += prep
        sch_start = to_min(school_start)
        sch_end = to_min(school_end)
        add(sch_start, sch_end - sch_start, '🏫 المدرسة', 'school', 'ركّز وخذ ملاحظات')
        cursor = sch_end
    else:
        add(cursor, 40, '🍳 فطور مريح + وقت عائلي', 'meal')
        cursor += 40
        if homeworks:
            add(cursor, 45, '📝 جلسة مذاكرة صباحية', 'study')
            cursor += 45

    # غداء
    add(cursor, 45, '🍽️ غداء + راحة', 'meal')
    cursor += 45

    # الواجبات
    if homeworks:
        homeworks_sorted = sorted(homeworks, key=lambda h: h.get('due', '23:59'))
        for hw in homeworks_sorted:
            dur = 40
            add(cursor, dur, f"📝 واجب: {hw.get('name', 'غير محدد')}", 'study',
                f"التسليم: {fmt12(hw.get('due', '23:59'))}")
            cursor += dur
            add(cursor, 10, '☕ راحة قصيرة', 'meal')
            cursor += 10

    # مراجعة قرآن
    add(cursor, 15, '📖 مراجعة سريعة للحفظ', 'quran')
    cursor += 15

    # التدريب
    tr_time = to_min(training_time)
    if tr_time > cursor:
        cursor = tr_time
    if is_weekend:
        training_dur = int(training_dur * 1.2)
    add(cursor, training_dur, '⚽ تدريب كرة القدم', 'sport', 'ركّز على التمركز والرشاقة')
    cursor += training_dur

    # تمارين منزلية
    home_dur = 30 if is_weekend else 20
    add(cursor, home_dur, '💪 تمارين مدافع منزلية', 'sport')
    cursor += home_dur

    # عشاء
    add(cursor, 45, '🍽️ عشاء + وقت عائلي', 'meal')
    cursor += 45

    # وقت حر
    free = 90 if is_weekend else 30
    add(cursor, free, '🎮 وقت حر', 'meal')
    cursor += free

    # مراجعة قبل النوم
    add(cursor, 15, '📖 مراجعة قرآن قبل النوم', 'quran')
    cursor += 15

    # النوم
    sleep_target = (to_min(wake_up) - 60 * 9) % 1440
    add(sleep_target, 60 * 9, '😴 النوم (9 ساعات)', 'sleep')

    # رتب حسب الوقت
    schedule.sort(key=lambda t: t['startMin'])

    return success({
        "tasks": schedule,
        "totalTasks": len(schedule),
        "totalMinutes": sum(t['endMin'] - t['startMin'] for t in schedule)
    }, "تم توليد الجدول")


@app.route('/api/schedule/adjust', methods=['POST'])
@require_json
def adjust_schedule():
    """تعديل طارئ على الجدول"""
    data = request.get_json()
    tasks = data.get('tasks', [])
    current_time = data.get('currentTime', datetime.now().strftime('%H:%M'))

    h, m = map(int, current_time.split(':'))
    now_min = h * 60 + m

    remaining = [t for t in tasks if t.get('endMin', 0) > now_min and not t.get('completed')]
    done = [t for t in tasks if t.get('completed') or t.get('endMin', 0) <= now_min]

    if not remaining:
        return success(tasks, "لا يوجد مهام متبقية")

    cursor = now_min + 5
    new_schedule = list(done)

    for task in remaining:
        dur = task['endMin'] - task['startMin']
        new_dur = int(dur * 0.7) if dur > 40 else dur
        new_schedule.append({
            **task,
            'start': to_time_simple(cursor),
            'end': to_time_simple(cursor + new_dur),
            'startMin': cursor,
            'endMin': cursor + new_dur,
            'title': task['title'] + (' ⚡' if new_dur < dur else ''),
            'desc': (task.get('desc', '') + ' (مُعدّل)').strip()
        })
        cursor += new_dur + 5

    new_schedule.sort(key=lambda t: t['startMin'])

    return success({
        "tasks": new_schedule,
        "adjusted": len(remaining)
    }, "تم تعديل الجدول")


def to_time_simple(m):
    m = m % 1440
    return f"{m // 60:02d}:{m % 60:02d}"


# ============================================
# 7. WORKOUTS API
# ============================================
WORKOUTS_CACHE = {}

def load_workouts():
    """تحميل مكتبة التمارين (من json أو cache)"""
    global WORKOUTS_CACHE
    if WORKOUTS_CACHE:
        return WORKOUTS_CACHE

    data = load_json_file('workouts.json')
    if not data:
        # بيانات احتياطية مختصرة
        data = {
            "agility": [
                {"id": "a1", "name": "سلّم الرشاقة", "icon": "🪜", "duration": "5 دقائق", "durationMin": 5,
                 "difficulty": "مبتدئ", "level": 1, "desc": "خطوات سريعة داخل/خارج", "calories": 40},
                {"id": "a2", "name": "تغيير الاتجاه 180°", "icon": "🔄", "duration": "3×10", "durationMin": 6,
                 "difficulty": "متوسط", "level": 2, "desc": "عدو + دوران", "calories": 60},
                {"id": "a3", "name": "تمركز الظل", "icon": "🎯", "duration": "5 دقائق", "durationMin": 5,
                 "difficulty": "مبتدئ", "level": 1, "desc": "تحرك دفاعي", "calories": 35}
            ],
            "strength": [
                {"id": "s1", "name": "قرفصاء", "icon": "🦵", "duration": "3×15", "durationMin": 6,
                 "difficulty": "مبتدئ", "level": 1, "desc": "لتقوية الأرجل", "calories": 55},
                {"id": "s2", "name": "بلانك", "icon": "💪", "duration": "3×45ث", "durationMin": 5,
                 "difficulty": "متوسط", "level": 2, "desc": "لتقوية البطن", "calories": 45}
            ],
            "endurance": [
                {"id": "e1", "name": "جري خفيف", "icon": "🏃", "duration": "15 دقيقة", "durationMin": 15,
                 "difficulty": "مبتدئ", "level": 1, "desc": "تسخين وإطالة", "calories": 130}
            ]
        }

    WORKOUTS_CACHE = data
    return data


@app.route('/api/workouts', methods=['GET'])
def get_all_workouts():
    """جلب كل التمارين"""
    workouts = load_workouts()
    all_workouts = []
    for cat, list_data in workouts.items():
        if isinstance(list_data, dict) and 'workouts' in list_data:
            items = list_data['workouts']
        elif isinstance(list_data, list):
            items = list_data
        else:
            continue
        for w in items:
            all_workouts.append({**w, 'category': cat})
    return success(all_workouts)


@app.route('/api/workouts/<category>', methods=['GET'])
def get_workouts_by_category(category):
    """جلب تمارين فئة معينة"""
    workouts = load_workouts()
    if category not in workouts:
        return error(f"الفئة '{category}' غير موجودة", 404)

    cat_data = workouts[category]
    if isinstance(cat_data, dict) and 'workouts' in cat_data:
        items = cat_data['workouts']
    else:
        items = cat_data

    return success(items)


@app.route('/api/workouts/<category>/<workout_id>', methods=['GET'])
def get_workout_detail(category, workout_id):
    """جلب تفاصيل تمرين معين"""
    workouts = load_workouts()
    if category not in workouts:
        return error("الفئة غير موجودة", 404)

    cat_data = workouts[category]
    items = cat_data.get('workouts', cat_data) if isinstance(cat_data, dict) else cat_data

    for w in items:
        if w.get('id') == workout_id:
            return success({**w, 'category': category})

    return error("التمرين غير موجود", 404)


@app.route('/api/workouts/routine', methods=['POST'])
@require_json
def generate_routine():
    """توليد روتين مخصص"""
    data = request.get_json()
    goal = data.get('goal', 'balanced')
    duration = data.get('duration', 30)
    level = data.get('level', 2)

    workouts = load_workouts()
    pool = []

    if goal == 'balanced':
        for cat in workouts:
            cat_data = workouts[cat]
            items = cat_data.get('workouts', cat_data) if isinstance(cat_data, dict) else cat_data
            pool.extend([{**w, 'category': cat} for w in items if w.get('level', 1) <= level])
    elif goal in workouts:
        cat_data = workouts[goal]
        items = cat_data.get('workouts', cat_data) if isinstance(cat_data, dict) else cat_data
        pool = [{**w, 'category': goal} for w in items if w.get('level', 1) <= level]

    if not pool:
        return error("لا يوجد تمارين مناسبة", 404)

    random.shuffle(pool)

    routine = []
    total = 0
    for w in pool:
        d = w.get('durationMin', 5)
        if total + d <= duration:
            routine.append(w)
            total += d
        if total >= duration * 0.9:
            break

    return success({
        "goal": goal,
        "duration": total,
        "workouts": routine,
        "totalCalories": sum(w.get('calories', 0) for w in routine)
    }, f"تم توليد روتين ({len(routine)} تمرين)")


# ============================================
# 8. QURAN API
# ============================================
@app.route('/api/quran/surahs', methods=['GET'])
def list_surahs():
    """قائمة كل السور"""
    if not SURAHS:
        return error("بيانات السور غير محمّلة", 503)

    simplified = [{
        "id": s.get("id"),
        "name": s.get("name"),
        "englishName": s.get("englishName"),
        "ayahCount": s.get("ayahCount"),
        "type": s.get("type"),
        "juz": s.get("juz"),
        "page": s.get("page")
    } for s in SURAHS]

    return success(simplified, f"{len(simplified)} سورة")


@app.route('/api/quran/surah/<int:surah_id>', methods=['GET'])
def get_surah_detail(surah_id):
    """تفاصيل سورة معينة"""
    if not SURAHS:
        return error("بيانات السور غير محمّلة", 503)

    surah = get_surah(surah_id)
    if not surah:
        return error(f"السورة رقم {surah_id} غير موجودة", 404)

    return success(surah)


@app.route('/api/quran/ayah/<int:surah_id>/<int:ayah_num>', methods=['GET'])
def get_ayah_detail(surah_id, ayah_num):
    """آية محددة"""
    if not SURAHS:
        return error("بيانات السور غير محمّلة", 503)

    ayah = get_ayah(surah_id, ayah_num)
    if not ayah:
        return error(f"الآية {surah_id}:{ayah_num} غير موجودة", 404)

    return success(ayah)


@app.route('/api/quran/audio/<int:surah_id>', methods=['GET'])
def get_quran_audio(surah_id):
    """رابط صوت السورة"""
    reciter = request.args.get('reciter', 'alafasy')

    if not SURAHS:
        return error("بيانات السور غير محمّلة", 503)

    url = get_audio_url(surah_id, reciter)
    if not url:
        return error("التلاوة غير متاحة", 404)

    return success({
        "surahId": surah_id,
        "reciter": reciter,
        "audioUrl": url
    })


@app.route('/api/quran/reciters', methods=['GET'])
def list_reciters():
    """قائمة القراء"""
    if not RECITERS:
        return success([], "لا يوجد قراء محمّلين")
    return success(RECITERS)


@app.route('/api/quran/plan', methods=['POST'])
@require_json
def quran_plan():
    """توليد خطة حفظ قرآنية"""
    data = request.get_json()

    daily_new = data.get('dailyNew', 1)
    daily_recent = data.get('dailyRecent', 2)
    daily_old = data.get('dailyOld', 1)
    days = data.get('days', 30)
    start_surah = data.get('startSurah', 1)
    start_ayah = data.get('startAyah', 1)

    if not SURAHS:
        return error("بيانات السور غير محمّلة", 503)

    plan = []
    current_surah = start_surah
    current_ayah = start_ayah
    total_ayahs = 0
    total_new = 0

    surah_map = {s['id']: s for s in SURAHS}

    for day in range(1, days + 1):
        day_plan = {
            "day": day,
            "date": (datetime.utcnow() + timedelta(days=day - 1)).strftime('%Y-%m-%d'),
            "new": [],
            "recent": [],
            "old": []
        }

        # الحفظ الجديد
        for _ in range(daily_new):
            if current_surah not in surah_map:
                break
            surah = surah_map[current_surah]

            day_plan["new"].append({
                "surah": current_surah,
                "surahName": surah.get("name"),
                "ayah": current_ayah
            })

            current_ayah += 1
            total_ayahs += 1
            total_new += 1

            if current_ayah > surah.get("ayahCount", 7):
                current_surah += 1
                current_ayah = 1

        # المراجعة القريبة
        for i in range(daily_recent):
            recent_day = max(1, day - (i + 1))
            if recent_day <= day and recent_day >= 1:
                day_plan["recent"].append({
                    "fromDay": recent_day,
                    "description": f"مراجعة يوم {recent_day}"
                })

        # المراجعة القديمة
        if day > 7:
            for i in range(daily_old):
                old_day = max(1, day - 7 - (i * 3))
                day_plan["old"].append({
                    "fromDay": old_day,
                    "description": f"مراجعة يوم {old_day}"
                })

        plan.append(day_plan)

    return success({
        "plan": plan,
        "totalDays": days,
        "totalAyahs": total_ayahs,
        "totalNew": total_new,
        "endSurah": current_surah,
        "endAyah": current_ayah
    }, f"تم توليد خطة {days} يوم")


@app.route('/api/quran/progress', methods=['GET'])
def quran_progress():
    """تقدم الحفظ"""
    info = load_json_file('information_local.json', {})
    quran = info.get('quran', {})
    return success(quran)


@app.route('/api/quran/progress', methods=['POST'])
@require_json
def update_quran_progress():
    """تحديث تقدم الحفظ"""
    data = request.get_json()

    info = load_json_file('information_local.json', {})
    if 'quran' not in info:
        info['quran'] = {}

    if 'currentSurah' in data:
        info['quran']['currentSurah'] = data['currentSurah']
    if 'currentAyah' in data:
        info['quran']['currentAyah'] = data['currentAyah']
    if 'memorized' in data:
        info['quran']['memorized'] = data['memorized']

    info['quran']['lastReview'] = datetime.utcnow().isoformat() + "Z"

    if save_json_file('information_local.json', info):
        return success(info['quran'], "تم تحديث تقدم الحفظ")
    return error("فشل الحفظ", 500)


# ============================================
# 9. WEATHER API
# ============================================
WEATHER_CODES = {
    0: {"icon": "☀️", "desc": "صافي"},
    1: {"icon": "🌤️", "desc": "صافي غالباً"},
    2: {"icon": "⛅", "desc": "غائم جزئياً"},
    3: {"icon": "☁️", "desc": "غائم"},
    45: {"icon": "🌫️", "desc": "ضباب"},
    48: {"icon": "🌫️", "desc": "ضباب متجمد"},
    51: {"icon": "🌦️", "desc": "رذاذ خفيف"},
    53: {"icon": "🌦️", "desc": "رذاذ متوسط"},
    55: {"icon": "🌧️", "desc": "رذاذ كثيف"},
    61: {"icon": "🌧️", "desc": "مطر خفيف"},
    63: {"icon": "🌧️", "desc": "مطر متوسط"},
    65: {"icon": "⛈️", "desc": "مطر غزير"},
    71: {"icon": "🌨️", "desc": "ثلج خفيف"},
    73: {"icon": "❄️", "desc": "ثلج متوسط"},
    75: {"icon": "❄️", "desc": "ثلج كثيف"},
    77: {"icon": "🌨️", "desc": "حبيبات ثلج"},
    80: {"icon": "🌧️", "desc": "زخات مطر خفيفة"},
    81: {"icon": "🌧️", "desc": "زخات مطر متوسطة"},
    82: {"icon": "⛈️", "desc": "زخات مطر عنيفة"},
    85: {"icon": "🌨️", "desc": "زخات ثلج"},
    86: {"icon": "❄️", "desc": "زخات ثلج كثيفة"},
    95: {"icon": "⛈️", "desc": "عاصفة رعدية"},
    96: {"icon": "⛈️", "desc": "عاصفة مع برَد"},
    99: {"icon": "🌩️", "desc": "عاصفة شديدة"}
}


@app.route('/api/weather', methods=['GET'])
def get_weather():
    """جلب حالة الطقس الحالية"""
    lat = request.args.get('lat')
    lon = request.args.get('lon')

    if not lat or not lon:
        # لو مش موجود، جرب من الملف المحفوظ
        info = load_json_file('information_local.json', {})
        cached = info.get('weather', {})
        if cached.get('temp') is not None:
            return success(cached, "من البيانات المحفوظة")
        return error("الموقع مطلوب (lat, lon)", 400)

    cache_key = f"weather_{lat}_{lon}"
    cached = cache_get(cache_key)
    if cached:
        return success(cached, "من الكاش")

    # محاولة جلب من Open-Meteo
    try:
        import urllib.request
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current_weather=true"
        with urllib.request.urlopen(url, timeout=10) as resp:
            data = json.loads(resp.read().decode())
            cw = data.get('current_weather', {})

            code = cw.get('weathercode', 0)
            info = WEATHER_CODES.get(code, {"icon": "🌡️", "desc": "غير معروف"})

            result = {
                "temp": round(cw.get('temperature', 0)),
                "wind": cw.get('windspeed', 0),
                "code": code,
                "icon": info["icon"],
                "description": info["desc"],
                "isBad": code >= 51 or cw.get('temperature', 25) > 38 or cw.get('temperature', 25) < 10,
                "lastUpdate": datetime.utcnow().isoformat() + "Z"
            }

            cache_set(cache_key, result, ttl_seconds=1800)  # 30 دقيقة

            # احفظ في الملف
            file_info = load_json_file('information_local.json', {})
            file_info['weather'] = result
            save_json_file('information_local.json', file_info)

            return success(result)
    except Exception as e:
        return error(f"فشل جلب الطقس: {str(e)}", 500)


@app.route('/api/weather/advice', methods=['POST'])
@require_json
def weather_advice():
    """نصيحة رياضية حسب الطقس"""
    data = request.get_json()
    temp = data.get('temp', 25)
    code = data.get('code', 0)

    if code >= 51:
        advice = "🌧️ الجو ممطر — العب في الداخل أو استبدل بالتمارين المنزلية"
    elif temp > 38:
        advice = "🔥 الجو حار جداً — اشرب ماء كتير وتدرب في الظل أو الصبح بدري"
    elif temp < 10:
        advice = "❄️ الجو بارد — سخّن كويس قبل التمرين والبس طبقات"
    else:
        advice = "✅ الجو مناسب للتمرين الخارجي — استمتع!"

    return success({
        "advice": advice,
        "suitable": 10 <= temp <= 38 and code < 51,
        "recommendation": "indoor" if (code >= 51 or temp > 38 or temp < 10) else "outdoor"
    })


# ============================================
# 10. BADGES API
# ============================================
@app.route('/api/badges', methods=['GET'])
def get_badges():
    """جلب كل الشارات مع حالة كل واحدة"""
    info = load_json_file('information_local.json', {})
    stats = info.get('stats', {})

    streak = stats.get('streak', 0)
    points = stats.get('totalPoints', 0)
    quran = stats.get('totalQuranPages', 0)
    workouts = stats.get('totalWorkouts', 0)
    strength = stats.get('totalStrength', 0)
    agility = stats.get('totalAgility', 0)
    endurance = stats.get('totalEndurance', 0)
    early = stats.get('earlyWakeups', 0)
    perfect = stats.get('perfectDays', 0)
    pomodoro = stats.get('pomodoroSessions', 0)

    badges = {
        "streak": [
            {"id": "st1", "icon": "🌱", "name": "بداية الطريق", "unlocked": streak >= 1},
            {"id": "st2", "icon": "🔥", "name": "3 أيام", "unlocked": streak >= 3},
            {"id": "st3", "icon": "🔥🔥", "name": "أسبوع كامل", "unlocked": streak >= 7},
            {"id": "st4", "icon": "💪💪", "name": "أسبوعين", "unlocked": streak >= 14},
            {"id": "st5", "icon": "👑", "name": "شهر كامل", "unlocked": streak >= 30},
            {"id": "st6", "icon": "🌟", "name": "أسطورة", "unlocked": streak >= 100, "gold": True}
        ],
        "points": [
            {"id": "p1", "icon": "⭐", "name": "مبتدئ", "unlocked": points >= 50},
            {"id": "p2", "icon": "⭐⭐", "name": "نشيط", "unlocked": points >= 100},
            {"id": "p3", "icon": "⭐⭐⭐", "name": "مجتهد", "unlocked": points >= 250},
            {"id": "p4", "icon": "💎", "name": "محترف", "unlocked": points >= 500},
            {"id": "p5", "icon": "👑", "name": "خبير", "unlocked": points >= 1000, "gold": True}
        ],
        "quran": [
            {"id": "q1", "icon": "📖", "name": "أول صفحة", "unlocked": quran >= 1},
            {"id": "q2", "icon": "📚", "name": "10 صفحات", "unlocked": quran >= 10},
            {"id": "q3", "icon": "📚📚", "name": "50 صفحة", "unlocked": quran >= 50},
            {"id": "q4", "icon": "🕌", "name": "جزء كامل", "unlocked": quran >= 20},
            {"id": "q5", "icon": "👑", "name": "ملك الحفظ", "unlocked": quran >= 200, "gold": True}
        ],
        "sport": [
            {"id": "sp1", "icon": "⚽", "name": "رياضي مبتدئ", "unlocked": workouts >= 5},
            {"id": "sp2", "icon": "🏃", "name": "رياضي نشيط", "unlocked": workouts >= 20},
            {"id": "sp3", "icon": "💪", "name": "قوي", "unlocked": strength >= 10},
            {"id": "sp4", "icon": "🏃‍♂️", "name": "رشيق", "unlocked": agility >= 10},
            {"id": "sp5", "icon": "🫀", "name": "متحمل", "unlocked": endurance >= 10},
            {"id": "sp6", "icon": "🏆", "name": "بطل", "unlocked": workouts >= 100, "gold": True}
        ],
        "special": [
            {"id": "x1", "icon": "🌅", "name": "مبكر", "unlocked": early >= 7},
            {"id": "x2", "icon": "🎯", "name": "مدقق", "unlocked": perfect >= 3},
            {"id": "x3", "icon": "🧠", "name": "مركز", "unlocked": pomodoro >= 10},
            {"id": "x4", "icon": "🏖️", "name": "مستمتع", "unlocked": info.get('settings', {}).get('weekendMode', False)},
            {"id": "x5", "icon": "🌙", "name": "مثالي", "unlocked": perfect >= 5, "gold": True}
        ]
    }

    total = sum(len(v) for v in badges.values())
    unlocked = sum(1 for v in badges.values() for b in v if b.get('unlocked'))

    return success({
        "categories": badges,
        "total": total,
        "unlocked": unlocked,
        "percentage": round((unlocked / total) * 100) if total else 0
    })


@app.route('/api/badges/check', methods=['POST'])
@require_json
def check_new_badges():
    """فحص الشارات الجديدة المكتسبة"""
    data = request.get_json()
    previous_ids = set(data.get('previousIds', []))

    result = get_badges()
    current_data = result[0].get_json()['data']

    new_badges = []
    current_ids = []

    for cat, items in current_data['categories'].items():
        for badge in items:
            if badge.get('unlocked'):
                current_ids.append(badge['id'])
                if badge['id'] not in previous_ids:
                    new_badges.append({**badge, "category": cat})

    return success({
        "newBadges": new_badges,
        "totalUnlocked": len(current_ids),
        "currentIds": current_ids
    }, f"{len(new_badges)} شارة جديدة" if new_badges else "لا توجد شارات جديدة")


# ============================================
# 11. REWARDS API
# ============================================
@app.route('/api/rewards', methods=['GET'])
def get_rewards():
    """جلب قائمة المكافآت"""
    info = load_json_file('information_local.json', {})
    rewards = info.get('rewards', [])
    points = info.get('stats', {}).get('totalPoints', 0)

    for r in rewards:
        r['canClaim'] = points >= r.get('cost', 0)
        r['progress'] = min(100, round((points / r.get('cost', 1)) * 100))

    return success(rewards)


@app.route('/api/rewards', methods=['POST'])
@require_json
def add_reward():
    """إضافة مكافأة جديدة"""
    data = request.get_json()
    name = data.get('name', '').strip()
    cost = data.get('cost', 0)
    description = data.get('description', '')

    if not name:
        return error("اسم المكافأة مطلوب", 400)
    if not cost or cost < 1:
        return error("النقاط يجب أن تكون أكبر من 0", 400)

    info = load_json_file('information_local.json', {})
    if 'rewards' not in info:
        info['rewards'] = []

    new_reward = {
        "id": f"r_{int(time.time() * 1000)}",
        "name": name,
        "description": description,
        "cost": int(cost),
        "claimed": False,
        "claimedAt": None,
        "createdAt": datetime.utcnow().isoformat() + "Z"
    }

    info['rewards'].append(new_reward)

    if save_json_file('information_local.json', info):
        return success(new_reward, "تمت إضافة المكافأة", 201)
    return error("فشل حفظ المكافأة", 500)


@app.route('/api/rewards/<reward_id>', methods=['DELETE'])
def delete_reward(reward_id):
    """حذف مكافأة"""
    info = load_json_file('information_local.json', {})
    rewards = info.get('rewards', [])

    new_rewards = [r for r in rewards if r.get('id') != reward_id]
    if len(new_rewards) == len(rewards):
        return error("المكافأة غير موجودة", 404)

    info['rewards'] = new_rewards

    if save_json_file('information_local.json', info):
        return success(None, "تم حذف المكافأة")
    return error("فشل الحذف", 500)


@app.route('/api/rewards/<reward_id>/claim', methods=['POST'])
def claim_reward(reward_id):
    """استبدال مكافأة"""
    info = load_json_file('information_local.json', {})
    rewards = info.get('rewards', [])
    points = info.get('stats', {}).get('totalPoints', 0)

    reward = next((r for r in rewards if r.get('id') == reward_id), None)
    if not reward:
        return error("المكافأة غير موجودة", 404)

    if reward.get('claimed'):
        return error("المكافأة تم استبدالها بالفعل", 400)

    if points < reward.get('cost', 0):
        return error(f"نقاطك غير كافية ({points} / {reward['cost']})", 400)

    reward['claimed'] = True
    reward['claimedAt'] = datetime.utcnow().isoformat() + "Z"

    # اخصم النقاط
    info['stats']['totalPoints'] = points - reward['cost']

    if save_json_file('information_local.json', info):
        return success({
            "reward": reward,
            "pointsLeft": info['stats']['totalPoints']
        }, f"🎁 مبروك! {reward['name']}")
    return error("فشل الحفظ", 500)


# ============================================
# 12. STATS API
# ============================================
@app.route('/api/stats/weekly', methods=['GET'])
def stats_weekly():
    """إحصائيات آخر 7 أيام"""
    info = load_json_file('information_local.json', {})
    history = info.get('weeklyHistory', {})

    days = []
    day_names = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']

    for i in range(6, -1, -1):
        d = datetime.utcnow() - timedelta(days=i)
        key = d.strftime('%Y-%m-%d')
        days.append({
            "date": key,
            "dayName": day_names[(d.weekday() + 1) % 7],
            "tasksCompleted": history.get(key, 0)
        })

    total = sum(d['tasksCompleted'] for d in days)

    return success({
        "days": days,
        "totalTasks": total,
        "avgPerDay": round(total / 7, 1) if days else 0
    })


@app.route('/api/stats/monthly', methods=['GET'])
def stats_monthly():
    """إحصائيات آخر 30 يوم"""
    info = load_json_file('information_local.json', {})
    history = info.get('weeklyHistory', {})

    total = 0
    active_days = 0

    for i in range(30):
        d = datetime.utcnow() - timedelta(days=i)
        key = d.strftime('%Y-%m-%d')
        count = history.get(key, 0)
        total += count
        if count > 0:
            active_days += 1

    return success({
        "totalTasks": total,
        "activeDays": active_days,
        "avgPerDay": round(total / 30, 1),
        "consistency": round((active_days / 30) * 100, 1)
    })


@app.route('/api/stats/export', methods=['GET'])
def stats_export():
    """تصدير كل الإحصائيات"""
    info = load_json_file('information_local.json', {})

    export_data = {
        "exportedAt": datetime.utcnow().isoformat() + "Z",
        "version": "4.0.0",
        "stats": info.get('stats', {}),
        "weeklyHistory": info.get('weeklyHistory', {}),
        "monthlyHistory": info.get('monthlyHistory', {}),
        "badges": info.get('badges', {}),
        "quran": info.get('quran', {}),
        "workouts": info.get('workouts', {})
    }

    return success(export_data)


# ============================================
# 13. BACKUP API
# ============================================
@app.route('/api/backup', methods=['GET'])
def create_backup():
    """إنشاء نسخة احتياطية"""
    info = load_json_file('information_local.json', {})

    backup = {
        "app": "yawmi",
        "version": "4.0.0",
        "createdAt": datetime.utcnow().isoformat() + "Z",
        "data": info
    }

    filename = f"backup_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
    backup_path = CACHE_DIR / filename

    try:
        with open(backup_path, 'w', encoding='utf-8') as f:
            json.dump(backup, f, ensure_ascii=False, indent=2)

        size = backup_path.stat().st_size

        return success({
            "filename": filename,
            "size": size,
            "sizeFormatted": f"{size / 1024:.2f} KB",
            "createdAt": backup["createdAt"]
        }, "تم إنشاء النسخة الاحتياطية")
    except Exception as e:
        return error(f"فشل النسخ الاحتياطي: {str(e)}", 500)


@app.route('/api/backup/list', methods=['GET'])
def list_backups():
    """قائمة النسخ الاحتياطية"""
    backups = []

    for f in CACHE_DIR.glob("backup_*.json"):
        stat = f.stat()
        backups.append({
            "filename": f.name,
            "size": stat.st_size,
            "sizeFormatted": f"{stat.st_size / 1024:.2f} KB",
            "createdAt": datetime.fromtimestamp(stat.st_mtime).isoformat() + "Z"
        })

    backups.sort(key=lambda x: x['createdAt'], reverse=True)

    return success(backups, f"{len(backups)} نسخة")


@app.route('/api/restore', methods=['POST'])
@require_json
def restore_backup():
    """استرجاع نسخة احتياطية"""
    data = request.get_json()
    filename = data.get('filename')

    if not filename:
        return error("اسم الملف مطلوب", 400)

    # الأمان: منع الـ path traversal
    filename = os.path.basename(filename)

    backup_path = CACHE_DIR / filename
    if not backup_path.exists() or not backup_path.is_file():
        return error("النسخة غير موجودة", 404)

    try:
        with open(backup_path, 'r', encoding='utf-8') as f:
            backup = json.load(f)

        if backup.get('app') != 'yawmi':
            return error("الملف مش بتاع تطبيق يومي", 400)

        if save_json_file('information_local.json', backup.get('data', {})):
            return success({
                "restoredAt": datetime.utcnow().isoformat() + "Z",
                "fromFile": filename
            }, "تم الاسترجاع بنجاح")
        return error("فشل الحفظ", 500)
    except Exception as e:
        return error(f"فشل الاسترجاع: {str(e)}", 500)


# ============================================
# 14. ERROR HANDLERS
# ============================================
@app.errorhandler(404)
def not_found(e):
    return error("الصفحة أو المسار غير موجود", 404)


@app.errorhandler(405)
def method_not_allowed(e):
    return error("الطريقة غير مسموحة", 405)


@app.errorhandler(500)
def internal_error(e):
    return error("خطأ داخلي في السيرفر", 500)


@app.errorhandler(Exception)
def handle_exception(e):
    print(f"❌ خطأ: {e}")
    return error(f"خطأ غير متوقع: {str(e)}", 500)


# ============================================
# 15. RUN
# ============================================
if __name__ == '__main__':
    print("=" * 50)
    print("⚽ يومي v4.0 - API Server")
    print("=" * 50)
    print(f"📁 Base Directory: {BASE_DIR}")
    print(f"📁 Data Directory: {DATA_DIR}")
    print(f"📁 Cache Directory: {CACHE_DIR}")
    print(f"📚 السور المحمّلة: {len(SURAHS)}")
    print(f"🎙️  القراء: {len(RECITERS)}")
    print()
    print("🌐 Routes:")
    print("   GET  /                       → الصفحة الرئيسية")
    print("   GET  /health                 → فحص الحالة")
    print("   GET  /api/user               → بيانات المستخدم")
    print("   POST /api/user               → تحديث المستخدم")
    print("   GET  /api/schedule           → الجدول")
    print("   POST /api/schedule           → حفظ الجدول")
    print("   POST /api/schedule/generate  → توليد جدول")
    print("   POST /api/schedule/adjust    → تعديل طارئ")
    print("   GET  /api/workouts           → كل التمارين")
    print("   GET  /api/workouts/<cat>     → تمارين فئة")
    print("   POST /api/workouts/routine   → روتين مخصص")
    print("   GET  /api/quran/surahs       → كل السور")
    print("   GET  /api/quran/surah/<id>   → سورة معينة")
    print("   POST /api/quran/plan         → خطة حفظ")
    print("   GET  /api/weather            → الطقس")
    print("   GET  /api/badges             → الشارات")
    print("   GET  /api/rewards            → المكافآت")
    print("   POST /api/backup             → نسخة احتياطية")
    print()
    print("🚀 Server starting on http://localhost:5000")
    print("=" * 50)

    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True,
        threaded=True
    )