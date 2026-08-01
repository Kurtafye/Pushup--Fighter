// Performance ranking system for PushUp Fighter.
// This file keeps the ranking rules separate from the UI so the
// gameplay loop can stay focused on combat while the profile logic
// remains reusable and easy to extend for other exercises later.
(function (global) {
  const DEFAULT_WEIGHTS = {
    maxConsecutive: 0.4,
    weeklyVolume: 0.2,
    monthlyConsistency: 0.15,
    streak: 0.1,
    improvementRate: 0.1,
    workoutFrequency: 0.05,
  };

  class RankCalculator {
    constructor(weights = {}) {
      this.weights = { ...DEFAULT_WEIGHTS, ...weights };
    }

    calculateExerciseScore(profile) {
      const weightLbs = Math.max(60, Math.min(550, Number(profile.weightLbs) || 154));
      const heightFt = Math.max(4, Math.min(8.5, Number(profile.heightFt) || 5.75));
      const genderFactor = profile.gender === 'male' ? 1.05 : profile.gender === 'female' ? 0.95 : 1;
      const bodyWeightAdjustment = Math.max(0.7, Math.min(1.3, (154 / weightLbs) * genderFactor));

      const maxConsecutiveScore = Math.min(100, (profile.maxConsecutivePushups || 0) / 3);
      const weeklyScore = Math.min(100, ((profile.weeklyPushups || 0) / 40) * bodyWeightAdjustment * 100);
      const consistencyScore = Math.min(100, (profile.consistencyScore || 0));
      const streakScore = Math.min(100, (profile.streakLength || 0) * 6);
      const improvementScore = Math.min(100, Math.max(0, profile.improvementRate || 0));
      const frequencyScore = Math.min(100, (profile.workoutSessions || 0) * 3);

      const weightedScore =
        maxConsecutiveScore * this.weights.maxConsecutive +
        weeklyScore * this.weights.weeklyVolume +
        consistencyScore * this.weights.monthlyConsistency +
        streakScore * this.weights.streak +
        improvementScore * this.weights.improvementRate +
        frequencyScore * this.weights.workoutFrequency;

      return {
        maxConsecutiveScore,
        weeklyScore,
        consistencyScore,
        streakScore,
        improvementScore,
        frequencyScore,
        weightedScore,
      };
    }

    getRankInfo(score) {
      if (score >= 130) {
        return { rank: 'God', title: 'God Push Slayer', className: 'god' };
      }
      if (score >= 115) {
        return { rank: 'Legend', title: 'Legend Push Slayer', className: 'legend' };
      }
      if (score >= 100) {
        return { rank: 'Mythic', title: 'Mythic Push Slayer', className: 'mythic' };
      }
      if (score >= 85) {
        return { rank: 'SSS', title: 'SSS Rank Push Warrior', className: 'sss' };
      }
      if (score >= 70) {
        return { rank: 'SS', title: 'SS Rank Push Warrior', className: 'ss' };
      }
      if (score >= 55) {
        return { rank: 'S', title: 'S Rank Push Warrior', className: 's' };
      }
      if (score >= 40) {
        return { rank: 'A', title: 'A Rank Push Warrior', className: 'a' };
      }
      if (score >= 28) {
        return { rank: 'B', title: 'B Rank Push Warrior', className: 'b' };
      }
      if (score >= 18) {
        return { rank: 'C', title: 'C Rank Push Warrior', className: 'c' };
      }
      if (score >= 10) {
        return { rank: 'D', title: 'D Rank Push Warrior', className: 'd' };
      }
      if (score >= 4) {
        return { rank: 'E', title: 'E Rank Push Warrior', className: 'e' };
      }
      return { rank: 'F', title: 'F Rank Push Warrior', className: 'f' };
    }

    calculateProfile(profile) {
      const score = Math.round(this.calculateExerciseScore(profile).weightedScore);
      const rankInfo = this.getRankInfo(score);
      const enduranceClass = this.getEnduranceClass(profile.maxConsecutivePushups || 0);
      const disciplineScore = Math.min(100, Math.round((profile.consistencyScore || 0) * 0.6 + (profile.streakLength || 0) * 4));
      const powerScore = Math.min(100, Math.round((profile.weeklyPushups || 0) / 25 + (profile.maxConsecutivePushups || 0) / 2.5));
      const weightLbs = Math.max(60, Math.min(550, Number(profile.weightLbs) || 154));
      const heightFt = Math.max(4, Math.min(8.5, Number(profile.heightFt) || 5.75));
      const genderFactor = profile.gender === 'male' ? 1.05 : profile.gender === 'female' ? 0.95 : 1;
      const lifetimeReps = Math.max(0, profile.lifetimePushups || 0);
      const relativeStrength = Number((
        (Math.log10(Math.max(1, lifetimeReps)) * 0.4) +
        ((Math.max(0, lifetimeReps) >= 100 ? 0.1 : 0) +
         (Math.max(0, lifetimeReps) >= 1000 ? 0.9 : 0) +
         (Math.max(0, lifetimeReps) >= 10000 ? 1.0 : 0) +
         (Math.max(0, lifetimeReps) >= 100000 ? 1.0 : 0) +
         (Math.max(0, lifetimeReps) >= 10000000 ? 1.0 : 0)) * 1.0 +
        ((Math.max(0, lifetimeReps) >= 100 ? 0.1 : 0) * 0.2) +
        (Math.max(0, lifetimeReps) >= 1000 ? 0.3 : 0) +
        ((154 / weightLbs) * 0.35) +
        ((heightFt / 5.75) * 0.15) +
        (genderFactor - 1) * 0.05
      ).toFixed(2));

      return {
        score,
        rank: rankInfo.rank,
        title: rankInfo.title,
        className: rankInfo.className,
        enduranceClass,
        disciplineScore,
        powerScore,
        relativeStrength,
      };
    }

    getEnduranceClass(maxConsecutive) {
      if (maxConsecutive >= 100) return 'Titan';
      if (maxConsecutive >= 60) return 'Warrior';
      if (maxConsecutive >= 30) return 'Veteran';
      if (maxConsecutive >= 15) return 'Adept';
      return 'Novice';
    }
  }

  class PerformanceProfileStore {
    constructor(storageKey = 'pushup-fighter-performance') {
      this.storageKey = storageKey;
      this.calculator = new RankCalculator();
      this.data = this.load();
      this.ensureDefaults();
      this.refreshDerived();
      this.persist();
    }

    load() {
      if (typeof localStorage === 'undefined') {
        return {};
      }
      try {
        const raw = localStorage.getItem(this.storageKey);
        return raw ? JSON.parse(raw) : {};
      } catch (error) {
        return {};
      }
    }

    persist() {
      if (typeof localStorage === 'undefined') {
        return;
      }
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    ensureDefaults() {
      this.data = {
        playerName: 'Hero',
        weightLbs: 154,
        heightFt: 5.75,
        gender: 'other',
        relativeStrength: 0,
        level: 1,
        campaignProgress: 0,
        maxConsecutivePushups: 0,
        totalPushupsToday: 0,
        weeklyPushups: 0,
        monthlyPushups: 0,
        lifetimePushups: 0,
        fastest25: null,
        fastest50: null,
        fastest100: null,
        longestWorkout: 0,
        averageRepsPerSession: 0,
        consistencyScore: 0,
        streakLength: 0,
        longestStreak: 0,
        workoutSessions: 0,
        currentStreak: 0,
        activityDates: [],
        dailyVolumes: {},
        rankHistory: [],
        recentPRs: [],
        achievements: [],
        previousWeeklyVolume: 0,
        previousMonthlyVolume: 0,
        weekKey: this.getWeekKey(Date.now()),
        monthKey: this.getMonthKey(Date.now()),
        todayKey: this.getDayKey(Date.now()),
        currentSessionActive: false,
        currentSessionStart: null,
        currentSessionReps: 0,
        currentSessionTotal: 0,
        highestCombo: 1,
        bestCampaignFloor: 1,
        bestCampaignKills: 0,
        pushRating: 0,
        slayerRank: 'F',
        title: 'F Rank Push Warrior',
        enduranceClass: 'Novice',
        disciplineScore: 0,
        powerScore: 0,
        improvementRate: 0,
        lastUpdated: null,
        ...this.data,
      };
    }

    applyBodyProfile(profile) {
      this.data.weightLbs = Math.max(60, Math.min(550, Number(profile.weightLbs) || 154));
      this.data.heightFt = Math.max(4, Math.min(8.5, Number(profile.heightFt) || 5.75));
      this.data.gender = profile.gender || 'other';
      this.refreshDerived(Date.now());
      this.persist();
      return this.getSnapshot();
    }

    startWorkout(now = Date.now()) {
      if (this.data.currentSessionActive) {
        return;
      }

      this.rolloverIfNeeded(now);
      this.data.currentSessionActive = true;
      this.data.currentSessionStart = now;
      this.data.currentSessionReps = 0;
      this.data.currentSessionTotal = 0;
      this.addActivityDate(this.getDayKey(now));
      this.refreshDerived(now);
      this.persist();
    }

    recordPushUp(options = {}) {
      const now = options.now || Date.now();
      const reps = Math.max(1, options.reps || 1);
      this.startWorkout(now);
      this.rolloverIfNeeded(now);

      const previousSessionReps = this.data.currentSessionReps;
      this.data.currentSessionReps += reps;
      this.data.currentSessionTotal += reps;

      this.data.totalPushupsToday += reps;
      this.data.weeklyPushups += reps;
      this.data.monthlyPushups += reps;
      this.data.lifetimePushups += reps;
      this.data.dailyVolumes[this.getDayKey(now)] = (this.data.dailyVolumes[this.getDayKey(now)] || 0) + reps;

      const sessionDurationSeconds = this.getSessionDuration(now);
      if (this.data.currentSessionReps >= 25 && (!this.data.fastest25 || sessionDurationSeconds < this.data.fastest25)) {
        this.data.fastest25 = sessionDurationSeconds;
        this.addPR('Fastest 25 push-ups');
      }
      if (this.data.currentSessionReps >= 50 && (!this.data.fastest50 || sessionDurationSeconds < this.data.fastest50)) {
        this.data.fastest50 = sessionDurationSeconds;
        this.addPR('Fastest 50 push-ups');
      }
      if (this.data.currentSessionReps >= 100 && (!this.data.fastest100 || sessionDurationSeconds < this.data.fastest100)) {
        this.data.fastest100 = sessionDurationSeconds;
        this.addPR('Fastest 100 push-ups');
      }

      if (this.data.currentSessionReps > this.data.maxConsecutivePushups) {
        this.data.maxConsecutivePushups = this.data.currentSessionReps;
        this.addPR('New max consecutive push-ups');
      }

      if (options.combo && options.combo > this.data.highestCombo) {
        this.data.highestCombo = options.combo;
        this.addPR('Higher combo meter');
      }

      if (options.wave && options.wave > this.data.bestCampaignFloor) {
        this.data.bestCampaignFloor = options.wave;
        this.addPR('New campaign floor');
      }
      if (options.kills && options.kills > this.data.bestCampaignKills) {
        this.data.bestCampaignKills = options.kills;
        this.addPR('More enemies defeated');
      }

      const previousMaxConsecutive = this.data.maxConsecutivePushups;
      this.data.maxConsecutivePushups = Math.max(this.data.maxConsecutivePushups, this.data.currentSessionReps);
      if (previousMaxConsecutive < this.data.maxConsecutivePushups && this.data.currentSessionReps >= 10) {
        this.addPR('New max consecutive push-ups');
      }

      this.refreshDerived(now);
      this.persist();
      return { previousSessionReps, currentSessionReps: this.data.currentSessionReps };
    }

    endWorkout(options = {}) {
      if (!this.data.currentSessionActive) {
        return;
      }

      const now = options.now || Date.now();
      const durationSeconds = this.getSessionDuration(now);
      this.data.longestWorkout = Math.max(this.data.longestWorkout, durationSeconds);
      this.data.averageRepsPerSession = Math.round(this.data.lifetimePushups / Math.max(1, this.data.workoutSessions + 1));
      this.data.currentSessionActive = false;
      this.data.currentSessionStart = null;
      this.data.currentSessionReps = 0;
      this.data.currentSessionTotal = 0;
      this.data.workoutSessions = Math.max(1, this.data.workoutSessions + 1);
      this.data.averageRepsPerSession = Math.round(this.data.lifetimePushups / Math.max(1, this.data.workoutSessions));
      this.refreshDerived(now);
      this.persist();
    }

    refreshDerived(now = Date.now()) {
      this.rolloverIfNeeded(now);
      this.data.level = Math.max(1, Math.floor(this.data.lifetimePushups / 250) + 1);
      this.data.campaignProgress = Math.min(100, Math.round((this.data.bestCampaignFloor / 20) * 100));
      this.data.currentStreak = this.calculateCurrentStreak();
      this.data.longestStreak = Math.max(this.data.longestStreak, this.data.currentStreak);
      this.data.consistencyScore = this.calculateConsistencyScore();
      this.data.improvementRate = this.calculateImprovementRate();
      const rank = this.calculator.calculateProfile(this.data);
      this.data.pushRating = rank.score;
      this.data.slayerRank = rank.rank;
      this.data.title = rank.title;
      this.data.enduranceClass = rank.enduranceClass;
      this.data.disciplineScore = rank.disciplineScore;
      this.data.powerScore = rank.powerScore;
      this.data.relativeStrength = rank.relativeStrength;
      this.data.lastUpdated = new Date(now).toISOString();
      this.data.rankHistory = this.data.rankHistory || [];
      this.data.rankHistory.push({ date: this.getDayKey(now), score: this.data.pushRating });
      if (this.data.rankHistory.length > 16) {
        this.data.rankHistory = this.data.rankHistory.slice(-16);
      }
      this.data.achievements = this.calculateAchievements();
      this.data.recentPRs = (this.data.recentPRs || []).slice(-6);
    }

    calculateAchievements() {
      const items = [];
      if (this.data.lifetimePushups >= 100) items.push('Century Club');
      if (this.data.maxConsecutivePushups >= 25) items.push('Endurance Builder');
      if (this.data.streakLength >= 3) items.push('Steady Discipline');
      if (this.data.maxConsecutivePushups >= 50) items.push('Push Warrior');
      if (this.data.bestCampaignFloor >= 10) items.push('Dungeon Raider');
      if (this.data.workoutSessions >= 5) items.push('Routine Keeper');
      return items;
    }

    calculateConsistencyScore() {
      const today = this.getDayKey(Date.now());
      const recentDates = Object.keys(this.data.dailyVolumes || {}).filter((date) => {
        const age = (Date.parse(today) - Date.parse(date)) / 86400000;
        return age <= 30 && age >= 0;
      });
      return Math.min(100, Math.round((recentDates.length / 30) * 100));
    }

    calculateCurrentStreak() {
      const dates = (this.data.activityDates || []).slice().sort();
      if (!dates.length) return 0;
      const uniqueDates = [...new Set(dates)];
      let streak = 0;
      const today = new Date();
      const checkDate = new Date(today);
      for (let i = 0; i < 365; i += 1) {
        const key = this.getDayKey(checkDate.getTime());
        if (uniqueDates.includes(key)) {
          streak += 1;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
      return streak;
    }

    calculateImprovementRate() {
      const baseline = Math.max(1, this.data.previousWeeklyVolume || Math.max(1, Math.round((this.data.monthlyPushups || 0) / 4)));
      const recent = Math.max(1, this.data.weeklyPushups || 0);
      return Math.min(100, Math.max(0, Math.round(((recent - baseline) / baseline) * 100)));
    }

    addActivityDate(dateKey) {
      const dates = new Set(this.data.activityDates || []);
      dates.add(dateKey);
      this.data.activityDates = [...dates].sort();
    }

    addPR(label) {
      const existing = this.data.recentPRs || [];
      if (!existing.includes(label)) {
        existing.push(label);
      }
      this.data.recentPRs = existing.slice(-6);
    }

    getSessionDuration(now = Date.now()) {
      if (!this.data.currentSessionStart) return 0;
      return Math.max(0, Math.round((now - this.data.currentSessionStart) / 1000));
    }

    rolloverIfNeeded(now = Date.now()) {
      const currentDayKey = this.getDayKey(now);
      const currentWeekKey = this.getWeekKey(now);
      const currentMonthKey = this.getMonthKey(now);

      if (this.data.todayKey !== currentDayKey) {
        this.data.todayKey = currentDayKey;
        this.data.totalPushupsToday = 0;
      }

      if (this.data.weekKey !== currentWeekKey) {
        this.data.previousWeeklyVolume = this.data.weeklyPushups || 0;
        this.data.weeklyPushups = 0;
        this.data.weekKey = currentWeekKey;
      }

      if (this.data.monthKey !== currentMonthKey) {
        this.data.previousMonthlyVolume = this.data.monthlyPushups || 0;
        this.data.monthlyPushups = 0;
        this.data.monthKey = currentMonthKey;
      }
    }

    getDayKey(value) {
      const date = new Date(value);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    }

    getWeekKey(value) {
      const date = new Date(value);
      const start = new Date(date);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      return `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(start.getDate()).padStart(2, '0')}`;
    }

    getMonthKey(value) {
      const date = new Date(value);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    getSnapshot() {
      return JSON.parse(JSON.stringify(this.data));
    }
  }

  global.RankCalculator = RankCalculator;
  global.PerformanceProfileStore = PerformanceProfileStore;
})(window);
