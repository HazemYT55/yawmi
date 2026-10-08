/* ============================================
   ⚽ يومي v4.0 - Workout Library
   ============================================ */

'use strict';

/* ============================================
   1. WORKOUT LIBRARY (18 تمرين في 3 فئات)
============================================ */
const WORKOUT_LIBRARY = {

  /* ========== 🏃 الرشاقة (Agility) ========== */
  agility: {
    name: 'الرشاقة',
    icon: '🏃',
    color: '#fb8c00',
    description: 'تمارين لتطوير سرعة الاستجابة وتغيير الاتجاه — مثالية للمدافعين',
    workouts: [
      {
        id: 'a1',
        name: 'سلّم الرشاقة',
        nameEn: 'Agility Ladder',
        icon: '🪜',
        duration: '5 دقائق',
        durationMin: 5,
        difficulty: 'مبتدئ',
        level: 1,
        desc: 'خطوات سريعة داخل/خارج — تطوير سرعة القدمين',
        benefits: ['سرعة القدمين', 'التوازن', 'التنسيق'],
        muscles: ['الساقين', 'الفخذين'],
        equipment: ['سلّم رشاقة'],
        instructions: [
          'قف أمام بداية السلّم',
          'خطوة داخل ثم خارج بسرعة',
          'كرر بالقدمين بالتبادل',
          'حافظ على ظهرك مستقيم وذراعيك متحركتين',
          'كرر التمرين 5 مرات'
        ],
        sets: '5 مجموعات',
        reps: 'بدون عدد',
        calories: 40,
        animation: ['🧍‍♂️', '🏃', '🧍‍♂️']
      },
      {
        id: 'a2',
        name: 'تغيير الاتجاه 180°',
        nameEn: '180° Direction Change',
        icon: '🔄',
        duration: '3×10',
        durationMin: 6,
        difficulty: 'متوسط',
        level: 2,
        desc: 'عدو سريع مع دوران مفاجئ — مهارة أساسية للمدافع',
        benefits: ['سرعة الاستجابة', 'الرشاقة', 'قوة الساقين'],
        muscles: ['الفخذين', 'الساقين', 'البطن'],
        equipment: ['علامة أرضية'],
        instructions: [
          'ضع علامة على بعد 5 أمتار',
          'اركض بسرعة نحو العلامة',
          'استدر 180 درجة فوراً',
          'ارجع للبداية بنفس السرعة',
          'كرر 10 مرات'
        ],
        sets: '3 مجموعات',
        reps: '10 عدات',
        calories: 60,
        animation: ['🧍‍♂️', '🏃', '🔄', '🏃', '🧍‍♂️']
      },
      {
        id: 'a3',
        name: 'تمركز الظل',
        nameEn: 'Shadow Positioning',
        icon: '🎯',
        duration: '5 دقائق',
        durationMin: 5,
        difficulty: 'مبتدئ',
        level: 1,
        desc: 'حركات دفاعية بدون كرة — تطوير الحس الدفاعي',
        benefits: ['الحس الدفاعي', 'التوازن', 'التوقع'],
        muscles: ['الساقين', 'البطن'],
        equipment: [],
        instructions: [
          'قف في وضع الدفاع الأساسي',
          'تحرك يميناً ويساراً بخفة',
          'تخيل مهاجم يتحرك أمامك',
          'حافظ على وزنك على مقدمة القدم',
          'باعد بين قدميك بعرض الكتفين'
        ],
        sets: 'تمرين متواصل',
        reps: '5 دقائق',
        calories: 35,
        animation: ['🧍‍♂️', '🤺', '🧍‍♂️', '🤺', '🧍‍♂️']
      },
      {
        id: 'a4',
        name: 'Zig-Zag',
        nameEn: 'Zig-Zag Run',
        icon: '⚡',
        duration: '4 مجموعات',
        durationMin: 8,
        difficulty: 'متوسط',
        level: 2,
        desc: 'عدو متعرج بين العلامات — يطور التمركز الدفاعي',
        benefits: ['الرشاقة', 'التوازن', 'قوة القدمين'],
        muscles: ['الفخذين', 'الساقين', 'البطن'],
        equipment: ['5 علامات'],
        instructions: [
          'ضع 5 علامات على خط مستقيم بمسافات متساوية',
          'اركض بينها بشكل متعرج',
          'لا تلمس العلامات',
          'حافظ على سرعة ثابتة',
          'كرر 4 مرات'
        ],
        sets: '4 مجموعات',
        reps: 'بدون عدد',
        calories: 70,
        animation: ['🧍‍♂️', '🏃', '↗️', '↘️', '🏃']
      },
      {
        id: 'a5',
        name: 'قفز جانبي',
        nameEn: 'Lateral Jumps',
        icon: '↔️',
        duration: '3×15',
        durationMin: 5,
        difficulty: 'مبتدئ',
        level: 1,
        desc: 'قفز يمين-يسار — لتقوية عضلات الفخذ الجانبية',
        benefits: ['قوة الفخذ', 'التوازن', 'التفاعل السريع'],
        muscles: ['الفخذين', 'الساقين'],
        equipment: [],
        instructions: [
          'قف على قدم واحدة',
          'اقفز يميناً ثم يساراً بسرعة',
          'حافظ على توازنك',
          'لا تلمس الأرض بقدميك معاً',
          'كرر 15 مرة لكل قدم'
        ],
        sets: '3 مجموعات',
        reps: '15 عدة',
        calories: 50,
        animation: ['🧍‍♂️', '⬅️', '➡️', '🧍‍♂️']
      },
      {
        id: 'a6',
        name: 'سلّم + كرة',
        nameEn: 'Ladder + Ball',
        icon: '⚽',
        duration: '5 دقائق',
        durationMin: 5,
        difficulty: 'متقدم',
        level: 3,
        desc: 'رشاقة مع تحكم في الكرة — تمرين مركّب للمدافعين',
        benefits: ['الرشاقة', 'التحكم', 'التنسيق'],
        muscles: ['الساقين', 'الفخذين', 'البطن'],
        equipment: ['سلّم رشاقة', 'كرة قدم'],
        instructions: [
          'ضع الكرة عند نهاية السلم',
          'اركض على السلم بسرعة',
          'اسيطر على الكرة فوراً',
          'ارجع بنفس الطريقة',
          'كرر 3 مرات'
        ],
        sets: '3 مجموعات',
        reps: 'بدون عدد',
        calories: 65,
        animation: ['🧍‍♂️', '🪜', '⚽', '🏃']
      }
    ]
  },

  /* ========== 💪 القوة العضلية (Strength) ========== */
  strength: {
    name: 'القوة العضلية',
    icon: '💪',
    color: '#43a047',
    description: 'تمارين لتقوية العضلات الأساسية — أساس دفاعي قوي',
    workouts: [
      {
        id: 's1',
        name: 'قرفصاء',
        nameEn: 'Squats',
        icon: '🦵',
        duration: '3×15',
        durationMin: 6,
        difficulty: 'مبتدئ',
        level: 1,
        desc: 'تمرين أساسي لتقوية الأرجل والفخذين',
        benefits: ['قوة الأرجل', 'التوازن', 'قوة القفز'],
        muscles: ['الفخذين', 'الساقين', 'المؤخرة'],
        equipment: [],
        instructions: [
          'قف بقدمين متباعدتين بعرض الكتفين',
          'انزل كأنك تجلس على كرسي',
          'حافظ على ظهرك مستقيماً',
          'انزل حتى تصبح فخذاك موازية للأرض',
          'ارجع للوضع الأول'
        ],
        sets: '3 مجموعات',
        reps: '15 عدة',
        calories: 55,
        animation: ['🧍‍♂️', '🦵', '🧎', '🧍‍♂️']
      },
      {
        id: 's2',
        name: 'بلانك',
        nameEn: 'Plank',
        icon: '💪',
        duration: '3×45ث',
        durationMin: 5,
        difficulty: 'متوسط',
        level: 2,
        desc: 'تمرين ثابت لتقوية عضلات البطن والظهر',
        benefits: ['قوة البطن', 'ثبات الجسم', 'قوة الظهر'],
        muscles: ['البطن', 'الظهر', 'الكتفين'],
        equipment: [],
        instructions: [
          'استلقِ على بطنك',
          'ارفع جسمك على الكوعين وأصابع القدمين',
          'حافظ على جسمك مستقيماً من الرأس للقدمين',
          'لا ترفع مؤخرتك عالياً',
          'اثبت 45 ثانية'
        ],
        sets: '3 مجموعات',
        reps: '45 ثانية',
        calories: 45,
        animation: ['🧍‍♂️', '➡️', '🧘', '💪']
      },
      {
        id: 's3',
        name: 'ضغط',
        nameEn: 'Push-ups',
        icon: '🏋️',
        duration: '3×10',
        durationMin: 5,
        difficulty: 'متوسط',
        level: 2,
        desc: 'تمرين لتقوية الصدر والذراعين والكتفين',
        benefits: ['قوة الصدر', 'قوة الذراعين', 'قوة الكتفين'],
        muscles: ['الصدر', 'الذراعين', 'الكتفين'],
        equipment: [],
        instructions: [
          'استلقِ على بطنك',
          'ضع يديك على جانبي صدرك',
          'ارفع جسمك بذراعيك حتى يستقيم',
          'انزل ببطء حتى يقترب صدرك من الأرض',
          'كرر 10 مرات'
        ],
        sets: '3 مجموعات',
        reps: '10 عدات',
        calories: 60,
        animation: ['🧎', '🏋️', '🧍‍♂️', '🏋️']
      },
      {
        id: 's4',
        name: 'Lunges',
        nameEn: 'Lunges',
        icon: '🦿',
        duration: '3×12',
        durationMin: 6,
        difficulty: 'متوسط',
        level: 2,
        desc: 'تمرين لتقوية الفخذ والتوازن',
        benefits: ['قوة الفخذ', 'التوازن', 'مرونة الورك'],
        muscles: ['الفخذين', 'المؤخرة', 'الساقين'],
        equipment: [],
        instructions: [
          'قف مستقيماً',
          'خذ خطوة واسعة للأمام',
          'انزل بالركبة الخلفية حتى تقترب من الأرض',
          'ارجع وكرر بالقدم الأخرى',
          'كرر 12 مرة لكل قدم'
        ],
        sets: '3 مجموعات',
        reps: '12 عدة',
        calories: 55,
        animation: ['🧍‍♂️', '🦿', '🧎', '🧍‍♂️']
      },
      {
        id: 's5',
        name: 'جسر المؤخرة',
        nameEn: 'Glute Bridge',
        icon: '🌉',
        duration: '3×20',
        durationMin: 5,
        difficulty: 'مبتدئ',
        level: 1,
        desc: 'تمرين لتقوية عضلات المؤخرة وأسفل الظهر',
        benefits: ['قوة المؤخرة', 'قوة الظهر', 'مرونة الورك'],
        muscles: ['المؤخرة', 'أسفل الظهر', 'الفخذين'],
        equipment: [],
        instructions: [
          'استلقِ على ظهرك',
          'اثنِ ركبتيك وقدميك على الأرض',
          'ارفع حوضك لأعلى حتى يستقيم جسمك',
          'اثبت لحظة ثم انزل ببطء',
          'كرر 20 مرة'
        ],
        sets: '3 مجموعات',
        reps: '20 عدة',
        calories: 40,
        animation: ['🧘', '⬆️', '🌉', '⬇️']
      },
      {
        id: 's6',
        name: 'رفع السمانة',
        nameEn: 'Calf Raises',
        icon: '👟',
        duration: '3×20',
        durationMin: 4,
        difficulty: 'مبتدئ',
        level: 1,
        desc: 'تمرين لتقوية عضلات الساق السفلية',
        benefits: ['قوة الساق', 'قوة القفز', 'التوازن'],
        muscles: ['السمانة', 'الساق السفلية'],
        equipment: [],
        instructions: [
          'قف مستقيماً',
          'ارفع كعبيك لأعلى حتى تقف على أصابع قدميك',
          'اثبت ثانية واحدة في الأعلى',
          'انزل ببطء',
          'كرر 20 مرة'
        ],
        sets: '3 مجموعات',
        reps: '20 عدة',
        calories: 30,
        animation: ['🧍‍♂️', '⬆️', '🦶', '⬇️']
      }
    ]
  },

  /* ========== 🫀 التحمل (Endurance) ========== */
  endurance: {
    name: 'التحمل',
    icon: '🫀',
    color: '#e53935',
    description: 'تمارين لتطوير اللياقة القلبية والتحمل العام',
    workouts: [
      {
        id: 'e1',
        name: 'جري خفيف',
        nameEn: 'Light Jog',
        icon: '🏃',
        duration: '15 دقيقة',
        durationMin: 15,
        difficulty: 'مبتدئ',
        level: 1,
        desc: 'جري بإيقاع معتدل — تسخين ممتاز للجسم',
        benefits: ['اللياقة القلبية', 'التسخين', 'حرق الدهون'],
        muscles: ['الساقين', 'الفخذين', 'القلب'],
        equipment: [],
        instructions: [
          'ابدأ بمشي 2 دقيقة للتسخين',
          'اركض بسرعة معتدلة (تقدر تتكلم)',
          'تنفس بإيقاع منتظم',
          'حافظ على وضعية جسمك مستقيمة',
          'اختم بمشي 2 دقيقة للتهدئة'
        ],
        sets: 'تمرين متواصل',
        reps: '15 دقيقة',
        calories: 130,
        animation: ['🧍‍♂️', '🚶', '🏃', '🚶', '🧍‍♂️']
      },
      {
        id: 'e2',
        name: 'جري متقطع',
        nameEn: 'Interval Running',
        icon: '⚡',
        duration: '8×1 د',
        durationMin: 16,
        difficulty: 'متقدم',
        level: 3,
        desc: 'تبديل بين السرعة والراحة — يطوّر التحمل الانفجاري',
        benefits: ['التحمل', 'السرعة', 'قوة القلب'],
        muscles: ['الساقين', 'القلب', 'الرئتين'],
        equipment: ['ساعة إيقاف'],
        instructions: [
          'اركض سريعاً لمدة دقيقة كاملة',
          'امشِ دقيقة للراحة والاستشفاء',
          'كرر 8 مرات',
          'حافظ على تنفس منتظم',
          'لا تتوقف وسط العدوة'
        ],
        sets: '8 دورات',
        reps: '1 دقيقة عدوة',
        calories: 180,
        animation: ['🏃', '⚡', '🚶', '🏃', '⚡']
      },
      {
        id: 'e3',
        name: 'ركوب دراجة',
        nameEn: 'Cycling',
        icon: '🚴',
        duration: '20 دقيقة',
        durationMin: 20,
        difficulty: 'مبتدئ',
        level: 1,
        desc: 'تحمل عام بأقل ضغط على المفاصل',
        benefits: ['اللياقة العامة', 'قوة الساقين', 'حرق الدهون'],
        muscles: ['الساقين', 'الفخذين', 'القلب'],
        equipment: ['دراجة'],
        instructions: [
          'ابدأ بسرعة معتدلة',
          'زد السرعة تدريجياً',
          'حافظ على إيقاع ثابت',
          'اشرب ماء كل 5 دقائق',
          'اختم ببطء للتهدئة'
        ],
        sets: 'تمرين متواصل',
        reps: '20 دقيقة',
        calories: 160,
        animation: ['🚴', '🚴', '🚴', '🧍‍♂️']
      },
      {
        id: 'e4',
        name: 'قفز الحبل',
        nameEn: 'Jump Rope',
        icon: '🪢',
        duration: '3×1 د',
        durationMin: 5,
        difficulty: 'متوسط',
        level: 2,
        desc: 'تحمل + رشاقة في نفس الوقت',
        benefits: ['التحمل', 'الرشاقة', 'التنسيق'],
        muscles: ['الساقين', 'القلب', 'الذراعين'],
        equipment: ['حبل'],
        instructions: [
          'امسك الحبل بيديك',
          'اقفز بقدمين معاً',
          'حافظ على إيقاع ثابت',
          'خذ راحة 30 ثانية بين المجموعات',
          'كرر 3 مجموعات'
        ],
        sets: '3 مجموعات',
        reps: '1 دقيقة',
        calories: 90,
        animation: ['🧍‍♂️', '🪢', '⬆️', '⬇️']
      },
      {
        id: 'e5',
        name: 'تمدد وإطالة',
        nameEn: 'Stretching',
        icon: '🧘',
        duration: '10 دقائق',
        durationMin: 10,
        difficulty: 'مبتدئ',
        level: 1,
        desc: 'تمرين استشفائي بعد التمارين — يمنع الإصابات',
        benefits: ['المرونة', 'الاستشفاء', 'منع الإصابات'],
        muscles: ['كل الجسم'],
        equipment: ['سجادة'],
        instructions: [
          'ابدأ بتمدد الرقبة',
          'ثم الكتفين والذراعين',
          'ثم الظهر والفخذين',
          'اختم بتمدد الساقين',
          'اثبت كل تمدد 20-30 ثانية'
        ],
        sets: 'تمرين متواصل',
        reps: '10 دقائق',
        calories: 25,
        animation: ['🧘', '🤸', '🧘', '🤸']
      },
      {
        id: 'e6',
        name: 'مشي سريع',
        nameEn: 'Brisk Walking',
        icon: '🚶',
        duration: '20 دقيقة',
        durationMin: 20,
        difficulty: 'مبتدئ',
        level: 1,
        desc: 'تحمل خفيف مناسب للاستشفاء',
        benefits: ['اللياقة', 'حرق الدهون', 'الاستشفاء'],
        muscles: ['الساقين', 'القلب'],
        equipment: [],
        instructions: [
          'امشِ بخطوات واسعة',
          'حرك ذراعيك بشكل طبيعي',
          'حافظ على تنفس منتظم',
          'السرعة: 6-7 كم/س',
          'اختم ببطء'
        ],
        sets: 'تمرين متواصل',
        reps: '20 دقيقة',
        calories: 100,
        animation: ['🚶', '🚶', '🚶', '🧍‍♂️']
      }
    ]
  }
};

/* ============================================
   2. WORKOUT FILTERS & SEARCH
============================================ */
function getAllWorkouts() {
  const all = [];
  Object.keys(WORKOUT_LIBRARY).forEach(cat => {
    WORKOUT_LIBRARY[cat].workouts.forEach(w => {
      all.push({ ...w, category: cat });
    });
  });
  return all;
}

function getWorkoutById(id) {
  for (const cat in WORKOUT_LIBRARY) {
    const workout = WORKOUT_LIBRARY[cat].workouts.find(w => w.id === id);
    if (workout) return { ...workout, category: cat };
  }
  return null;
}

function getWorkoutsByCategory(cat) {
  return WORKOUT_LIBRARY[cat]?.workouts || [];
}

function getWorkoutsByDifficulty(level) {
  const difficulties = ['مبتدئ', 'متوسط', 'متقدم'];
  const target = difficulties[level - 1];
  if (!target) return [];
  return getAllWorkouts().filter(w => w.difficulty === target);
}

function getWorkoutsByLevel(level) {
  return getAllWorkouts().filter(w => w.level <= level);
}

function getWorkoutsByDuration(maxMin) {
  return getAllWorkouts().filter(w => w.durationMin <= maxMin);
}

function searchWorkouts(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return getAllWorkouts().filter(w =>
    w.name.toLowerCase().includes(q) ||
    w.nameEn.toLowerCase().includes(q) ||
    w.desc.toLowerCase().includes(q) ||
    w.muscles.some(m => m.includes(q)) ||
    w.benefits.some(b => b.includes(q))
  );
}

function shuffleWorkouts(cat = null) {
  const list = cat ? getWorkoutsByCategory(cat) : getAllWorkouts();
  const shuffled = [...list];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRandomWorkout(cat = null) {
  const list = shuffleWorkouts(cat);
  return list[0] || null;
}

/* ============================================
   3. ROUTINE GENERATOR
============================================ */
function generateRoutine(options = {}) {
  const {
    goal = 'balanced',      // balanced | agility | strength | endurance
    duration = 30,          // دقائق
    level = 2,              // 1-3
    categories = null       // لو عايز فئات معينة
  } = options;

  let pool = [];

  if (categories && categories.length) {
    categories.forEach(cat => {
      pool.push(...getWorkoutsByCategory(cat));
    });
  } else if (goal === 'balanced') {
    pool = getAllWorkouts();
  } else if (WORKOUT_LIBRARY[goal]) {
    pool = getWorkoutsByCategory(goal);
  } else {
    pool = getAllWorkouts();
  }

  // فلترة حسب المستوى
  pool = pool.filter(w => w.level <= level);

  if (pool.length === 0) return null;

  // رتب عشوائياً
  pool = pool.sort(() => Math.random() - 0.5);

  // اختار لحد ما نغطي الوقت
  const routine = [];
  let totalMin = 0;

  for (const workout of pool) {
    if (totalMin + workout.durationMin <= duration) {
      routine.push(workout);
      totalMin += workout.durationMin;
    }
    if (totalMin >= duration * 0.9) break;
  }

  return {
    goal,
    duration: totalMin,
    level,
    workoutCount: routine.length,
    workouts: routine,
    totalCalories: routine.reduce((sum, w) => sum + (w.calories || 0), 0)
  };
}

function generateWeeklyPlan(level = 2) {
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const goals = ['agility', 'strength', 'endurance', 'agility', 'strength', 'rest', 'endurance'];

  const plan = days.map((day, i) => {
    const goal = goals[i];
    let routine;

    if (goal === 'rest') {
      routine = {
        goal: 'rest',
        duration: 10,
        workoutCount: 1,
        workouts: [getWorkoutById('e5')],
        totalCalories: 25
      };
    } else {
      routine = generateRoutine({ goal, duration: 30, level });
    }

    return { day, goal, routine };
  });

  return plan;
}

/* ============================================
   4. WORKOUT TRACKING
============================================ */
const WorkoutTracker = (function() {
  const HISTORY_KEY = 'workout_history';
  const MAX_HISTORY = 500;

  function log(workoutId, extra = {}) {
    const history = getHistory();
    const workout = getWorkoutById(workoutId);

    history.unshift({
      id: 'log_' + Date.now(),
      workoutId,
      workoutName: workout?.name || 'Unknown',
      category: workout?.category || 'unknown',
      duration: extra.duration || workout?.durationMin || 0,
      reps: extra.reps || 0,
      sets: extra.sets || 0,
      calories: workout?.calories || 0,
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
      notes: extra.notes || ''
    });

    if (history.length > MAX_HISTORY) {
      history.length = MAX_HISTORY;
    }

    saveHistory(history);
    return history[0];
  }

  function getHistory() {
    try {
      const raw = localStorage.getItem('yawmi_' + HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveHistory(history) {
    try {
      localStorage.setItem('yawmi_' + HISTORY_KEY, JSON.stringify(history));
    } catch (e) {}
  }

  function getStats() {
    const history = getHistory();
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const stats = {
      totalWorkouts: history.length,
      totalMinutes: history.reduce((s, h) => s + (h.duration || 0), 0),
      totalCalories: history.reduce((s, h) => s + (h.calories || 0), 0),
      byCategory: { agility: 0, strength: 0, endurance: 0 },
      last7Days: 0,
      last30Days: 0,
      topWorkout: null,
      streak: 0
    };

    const counts = {};

    history.forEach(h => {
      if (stats.byCategory[h.category] !== undefined) {
        stats.byCategory[h.category]++;
      }

      if (now - h.timestamp < 7 * day) stats.last7Days++;
      if (now - h.timestamp < 30 * day) stats.last30Days++;

      counts[h.workoutId] = (counts[h.workoutId] || 0) + 1;
    });

    // أشهر تمرين
    let maxCount = 0;
    for (const id in counts) {
      if (counts[id] > maxCount) {
        maxCount = counts[id];
        stats.topWorkout = getWorkoutById(id);
      }
    }

    // Streak
    const uniqueDays = [...new Set(history.map(h => h.date))].sort().reverse();
    let streak = 0;
    let expectedDate = new Date();

    for (const dateStr of uniqueDays) {
      const expected = expectedDate.toISOString().split('T')[0];
      if (dateStr === expected) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
    stats.streak = streak;

    return stats;
  }

  function getMostUsed(limit = 5) {
    const history = getHistory();
    const counts = {};

    history.forEach(h => {
      counts[h.workoutId] = (counts[h.workoutId] || 0) + 1;
    });

    return Object.keys(counts)
      .sort((a, b) => counts[b] - counts[a])
      .slice(0, limit)
      .map(id => ({ workout: getWorkoutById(id), count: counts[id] }))
      .filter(item => item.workout);
  }

  function clearHistory() {
    if (confirm('هل تريد حذف كل سجل التمارين؟')) {
      localStorage.removeItem('yawmi_' + HISTORY_KEY);
      return true;
    }
    return false;
  }

  return { log, getHistory, getStats, getMostUsed, clearHistory };
})();

/* ============================================
   5. CALCULATIONS
============================================ */
function calculateCalories(workout, user = null) {
  if (!workout) return 0;

  let base = workout.calories || 0;

  // تعديل حسب الوزن
  if (user && user.weight) {
    const avgWeight = 50;
    base = base * (user.weight / avgWeight);
  }

  // تعديل حسب العمر
  if (user && user.age) {
    if (user.age < 12) base *= 0.8;
    else if (user.age > 18) base *= 1.1;
  }

  return Math.round(base);
}

function estimateDuration(workout, sets = 1) {
  if (!workout) return 0;
  return Math.round(workout.durationMin * sets);
}

function getRestTime(workout) {
  if (!workout) return 60;

  switch (workout.difficulty) {
    case 'مبتدئ': return 45;
    case 'متوسط': return 60;
    case 'متقدم': return 90;
    default: return 60;
  }
}

/* ============================================
   6. USER ADAPTATION
============================================ */
function adaptToUser(user) {
  if (!user) return getAllWorkouts();

  const age = user.age || 13;
  const gender = user.gender || 'male';

  let maxLevel = 2;

  if (age < 11) maxLevel = 1;
  else if (age < 14) maxLevel = 2;
  else maxLevel = 3;

  return getWorkoutsByLevel(maxLevel);
}

function filterByAge(workouts, age) {
  if (!age) return workouts;

  return workouts.filter(w => {
    if (age < 11) return w.level === 1;
    if (age < 14) return w.level <= 2;
    return true;
  });
}

function filterByGender(workouts, gender) {
  // كل التمارين مناسبة للجميع
  return workouts;
}

/* ============================================
   7. ANIMATION HELPERS
============================================ */
function getAnimationFrames(workoutId) {
  const w = getWorkoutById(workoutId);
  return w?.animation || ['🧍‍♂️', '🏃', '🧍‍♂️'];
}

let animationTimer = null;
let animationIndex = 0;

function playAnimation(workoutId, targetEl, speed = 500) {
  const frames = getAnimationFrames(workoutId);
  stopAnimation();

  animationIndex = 0;
  animationTimer = setInterval(() => {
    if (targetEl) {
      targetEl.textContent = frames[animationIndex % frames.length];
    }
    animationIndex++;
  }, speed);
}

function pauseAnimation() {
  if (animationTimer) {
    clearInterval(animationTimer);
    animationTimer = null;
  }
}

function stopAnimation() {
  pauseAnimation();
  animationIndex = 0;
}

/* ============================================
   8. STATS HELPERS
============================================ */
function getLibraryStats() {
  const stats = {
    total: 0,
    byCategory: {},
    byDifficulty: { 'مبتدئ': 0, 'متوسط': 0, 'متقدم': 0 },
    totalCalories: 0,
    avgDuration: 0,
    totalDuration: 0
  };

  Object.keys(WORKOUT_LIBRARY).forEach(cat => {
    const workouts = WORKOUT_LIBRARY[cat].workouts;
    stats.byCategory[cat] = workouts.length;
    stats.total += workouts.length;

    workouts.forEach(w => {
      if (stats.byDifficulty[w.difficulty] !== undefined) {
        stats.byDifficulty[w.difficulty]++;
      }
      stats.totalCalories += w.calories || 0;
      stats.totalDuration += w.durationMin || 0;
    });
  });

  stats.avgDuration = stats.total > 0
    ? Math.round(stats.totalDuration / stats.total)
    : 0;

  return stats;
}

/* ============================================
   9. RENDER HELPERS
============================================ */
function renderWorkoutList(cat = null, targetId = 'workoutList') {
  const container = document.getElementById(targetId);
  if (!container) return;

  const category = cat || (window.Yawmi?.state?.currentWorkoutCat) || 'agility';
  const workouts = getWorkoutsByCategory(category);

  container.innerHTML = workouts.map(w => `
    <div class="workout-card" onclick="openViewer('${w.id}', '${category}')">
      <div class="workout-icon">${w.icon}</div>
      <div class="workout-info">
        <div class="workout-name">${w.name}</div>
        <div class="workout-meta">
          <span>⏱️ ${w.duration}</span>
          <span>${w.desc}</span>
        </div>
      </div>
      <div class="workout-arrow">›</div>
    </div>
  `).join('');
}

function selectWorkoutCat(cat) {
  if (window.Yawmi?.state) {
    window.Yawmi.state.currentWorkoutCat = cat;
  }

  document.querySelectorAll('.workout-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.cat === cat);
  });

  renderWorkoutList(cat);

  if (typeof playTick === 'function') playTick();
  if (typeof saveState === 'function') saveState();
}

/* ============================================
   10. EXPORTS
============================================ */
window.YawmiExercises = {
  // Library
  library: WORKOUT_LIBRARY,

  // Getters
  getAll: getAllWorkouts,
  getById: getWorkoutById,
  getByCategory: getWorkoutsByCategory,
  getByDifficulty: getWorkoutsByDifficulty,
  getByLevel: getWorkoutsByLevel,
  getByDuration: getWorkoutsByDuration,

  // Search
  search: searchWorkouts,
  shuffle: shuffleWorkouts,
  random: getRandomWorkout,

  // Generators
  generateRoutine,
  generateWeeklyPlan,

  // Tracker
  tracker: WorkoutTracker,

  // Calculations
  calculateCalories,
  estimateDuration,
  getRestTime,

  // Adaptation
  adaptToUser,
  filterByAge,
  filterByGender,

  // Animation
  getAnimationFrames,
  playAnimation,
  pauseAnimation,
  stopAnimation,

  // Stats
  getLibraryStats,

  // Render
  renderList: renderWorkoutList,
  selectCat: selectWorkoutCat
};

console.log('⚽ يومي v4.0 - Exercises Loaded (18 تمارين)');