import { UserPreferences, LearningProgress, ConfigurationTemplate } from '../types/index';

/**
 * 🎯 User Preferences Service
 * 
 * Manages user configuration, learning progress, and adaptive behavior.
 * All settings persist across page refreshes using localStorage.
 */
class UserPreferencesService {
  private readonly PREFERENCES_KEY = 'beta-land-user-preferences';
  private readonly PROGRESS_KEY = 'beta-land-learning-progress';
  private readonly TEMPLATES_KEY = 'beta-land-config-templates';

  /**
   * 🔧 Get User Preferences
   * Returns current preferences or creates defaults
   */
  getUserPreferences(): UserPreferences {
    const stored = localStorage.getItem(this.PREFERENCES_KEY);
    
    if (stored) {
      const preferences = JSON.parse(stored);
      // Convert date strings back to Date objects
      preferences.lastUpdated = new Date(preferences.lastUpdated);
      preferences.createdAt = new Date(preferences.createdAt);
      return preferences;
    }

    // Create default preferences
    const defaultPreferences: UserPreferences = {
      id: this.generateId(),
      
      // Response Style
      responseStyle: 'adaptive',
      showThoughtProcess: true,
      preferredLanguage: 'en',
      
      // Learning Settings
      learningMode: 'guided',
      difficultyLevel: 'intermediate',
      feedbackStyle: 'encouraging',
      
      // Model Settings
      defaultModel: 'gemini-2.0-flash',
      preferredTemperature: 0.7,
      maxTokens: 2000,
      
      // UI Settings
      theme: 'auto',
      fontSize: 'medium',
      compactMode: false,
      
      // Educational Settings
      enableProgressTracking: true,
      studyGoals: [],
      subjectAreas: [],
      
      // Accessibility
      highContrast: false,
      reducedMotion: false,
      
      // Privacy
      saveConversationHistory: true,
      enableAnalytics: false,
      
      lastUpdated: new Date(),
      createdAt: new Date()
    };

    this.saveUserPreferences(defaultPreferences);
    return defaultPreferences;
  }

  /**
   * 💾 Save User Preferences
   */
  saveUserPreferences(preferences: UserPreferences): void {
    preferences.lastUpdated = new Date();
    localStorage.setItem(this.PREFERENCES_KEY, JSON.stringify(preferences));
    
    // Emit event for reactive components
    window.dispatchEvent(new CustomEvent('preferences-updated', { 
      detail: preferences 
    }));
  }

  /**
   * 🎯 Update Specific Preference
   */
  updatePreference<K extends keyof UserPreferences>(
    key: K, 
    value: UserPreferences[K]
  ): void {
    const preferences = this.getUserPreferences();
    preferences[key] = value;
    this.saveUserPreferences(preferences);
  }

  /**
   * 📊 Get Learning Progress
   */
  getLearningProgress(): LearningProgress {
    const stored = localStorage.getItem(this.PROGRESS_KEY);
    
    if (stored) {
      const progress = JSON.parse(stored);
      // Convert date strings back to Date objects
      progress.lastUpdated = new Date(progress.lastUpdated);
      
      // Convert nested dates
      Object.values(progress.subjectAreas || {}).forEach((subject: any) => {
        subject.lastActivity = new Date(subject.lastActivity);
      });
      
      Object.values(progress.languages || {}).forEach((language: any) => {
        language.lastPractice = new Date(language.lastPractice);
      });
      
      return progress;
    }

    // Create default progress
    const defaultProgress: LearningProgress = {
      id: this.generateId(),
      userId: this.getUserPreferences().id,
      subjectAreas: {},
      languages: {},
      totalInteractions: 0,
      streakDays: 0,
      achievementsUnlocked: [],
      lastUpdated: new Date()
    };

    this.saveLearningProgress(defaultProgress);
    return defaultProgress;
  }

  /**
   * 💾 Save Learning Progress
   */
  saveLearningProgress(progress: LearningProgress): void {
    progress.lastUpdated = new Date();
    localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(progress));
  }

  /**
   * 📈 Update Subject Progress
   */
  updateSubjectProgress(
    subject: string, 
    conceptsMastered: string[], 
    timeSpent: number
  ): void {
    const progress = this.getLearningProgress();
    
    if (!progress.subjectAreas[subject]) {
      progress.subjectAreas[subject] = {
        level: 0,
        conceptsMastered: [],
        areasNeedingWork: [],
        lastActivity: new Date(),
        timeSpent: 0
      };
    }

    const subjectProgress = progress.subjectAreas[subject];
    subjectProgress.conceptsMastered = Array.from(
      new Set([...subjectProgress.conceptsMastered, ...conceptsMastered])
    );
    subjectProgress.timeSpent += timeSpent;
    subjectProgress.lastActivity = new Date();
    subjectProgress.level = Math.min(100, subjectProgress.level + conceptsMastered.length * 2);

    this.saveLearningProgress(progress);
  }

  /**
   * 🌍 Update Language Progress
   */
  updateLanguageProgress(
    language: string,
    vocabularyGained: number,
    grammarConcepts: string[],
    conversationTime: number
  ): void {
    const progress = this.getLearningProgress();
    
    if (!progress.languages[language]) {
      progress.languages[language] = {
        proficiencyLevel: 'A1',
        vocabularyCount: 0,
        grammarConcepts: [],
        conversationHours: 0,
        lastPractice: new Date()
      };
    }

    const langProgress = progress.languages[language];
    langProgress.vocabularyCount += vocabularyGained;
    langProgress.grammarConcepts = Array.from(
      new Set([...langProgress.grammarConcepts, ...grammarConcepts])
    );
    langProgress.conversationHours += conversationTime / 60; // Convert minutes to hours
    langProgress.lastPractice = new Date();

    // Update proficiency level based on progress
    this.updateProficiencyLevel(langProgress);

    this.saveLearningProgress(progress);
  }

  /**
   * 🎯 Adaptive Response Configuration
   * Determines how AI should respond based on user preferences and progress
   */
  getAdaptiveConfiguration(): {
    shouldShowThoughtProcess: boolean;
    responseComplexity: 'simple' | 'moderate' | 'complex';
    feedbackLevel: 'minimal' | 'moderate' | 'detailed';
    difficultyAdjustment: number; // -1 to 1
  } {
    const preferences = this.getUserPreferences();
    const progress = this.getLearningProgress();

    return {
      shouldShowThoughtProcess: preferences.responseStyle !== 'direct' && preferences.showThoughtProcess,
      responseComplexity: this.calculateResponseComplexity(preferences, progress),
      feedbackLevel: this.mapFeedbackStyle(preferences.feedbackStyle),
      difficultyAdjustment: this.calculateDifficultyAdjustment(preferences, progress)
    };
  }

  /**
   * 🏆 Check and Award Achievements
   */
  checkAchievements(): string[] {
    const progress = this.getLearningProgress();
    const newAchievements: string[] = [];

    // Define achievements
    const achievements = [
      {
        id: 'first-conversation',
        name: 'First Steps',
        condition: () => progress.totalInteractions >= 1
      },
      {
        id: 'daily-learner',
        name: 'Daily Learner',
        condition: () => progress.streakDays >= 7
      },
      {
        id: 'language-explorer',
        name: 'Language Explorer',
        condition: () => Object.keys(progress.languages).length >= 2
      },
      {
        id: 'subject-master',
        name: 'Subject Master',
        condition: () => Object.values(progress.subjectAreas).some(subject => subject.level >= 75)
      },
      {
        id: 'vocabulary-builder',
        name: 'Vocabulary Builder',
        condition: () => Object.values(progress.languages).some(lang => lang.vocabularyCount >= 100)
      }
    ];

    // Check for new achievements
    achievements.forEach(achievement => {
      if (!progress.achievementsUnlocked.includes(achievement.id) && achievement.condition()) {
        progress.achievementsUnlocked.push(achievement.id);
        newAchievements.push(achievement.name);
      }
    });

    if (newAchievements.length > 0) {
      this.saveLearningProgress(progress);
    }

    return newAchievements;
  }

  /**
   * 🛠️ Configuration Templates
   */
  getConfigurationTemplates(): ConfigurationTemplate[] {
    const stored = localStorage.getItem(this.TEMPLATES_KEY);
    return stored ? JSON.parse(stored) : this.getDefaultTemplates();
  }

  saveConfigurationTemplate(template: ConfigurationTemplate): void {
    const templates = this.getConfigurationTemplates();
    const existingIndex = templates.findIndex(t => t.id === template.id);
    
    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }
    
    localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(templates));
  }

  // Private helper methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private calculateResponseComplexity(
    preferences: UserPreferences, 
    progress: LearningProgress
  ): 'simple' | 'moderate' | 'complex' {
    if (preferences.difficultyLevel === 'beginner') return 'simple';
    if (preferences.difficultyLevel === 'advanced') return 'complex';
    
    // Adaptive based on progress
    const avgSubjectLevel = Object.values(progress.subjectAreas)
      .reduce((sum, subject) => sum + subject.level, 0) / 
      Math.max(1, Object.keys(progress.subjectAreas).length);
    
    if (avgSubjectLevel < 30) return 'simple';
    if (avgSubjectLevel > 70) return 'complex';
    return 'moderate';
  }

  private mapFeedbackStyle(style: string): 'minimal' | 'moderate' | 'detailed' {
    switch (style) {
      case 'minimal': return 'minimal';
      case 'detailed': return 'detailed';
      default: return 'moderate';
    }
  }

  private calculateDifficultyAdjustment(
    preferences: UserPreferences, 
    progress: LearningProgress
  ): number {
    // Base adjustment on preferences
    let adjustment = 0;
    
    if (preferences.difficultyLevel === 'beginner') adjustment -= 0.3;
    if (preferences.difficultyLevel === 'advanced') adjustment += 0.3;
    
    // Fine-tune based on recent performance
    if (progress.streakDays > 14) adjustment += 0.2;
    if (progress.totalInteractions > 100) adjustment += 0.1;
    
    return Math.max(-1, Math.min(1, adjustment));
  }

  private updateProficiencyLevel(langProgress: any): void {
    const { vocabularyCount, grammarConcepts, conversationHours } = langProgress;
    
    // Simple proficiency calculation
    const score = vocabularyCount * 0.1 + grammarConcepts.length * 2 + conversationHours * 10;
    
    if (score >= 200) langProgress.proficiencyLevel = 'C2';
    else if (score >= 150) langProgress.proficiencyLevel = 'C1';
    else if (score >= 100) langProgress.proficiencyLevel = 'B2';
    else if (score >= 60) langProgress.proficiencyLevel = 'B1';
    else if (score >= 30) langProgress.proficiencyLevel = 'A2';
    else langProgress.proficiencyLevel = 'A1';
  }

  private getDefaultTemplates(): ConfigurationTemplate[] {
    return [
      {
        id: 'academic-focus',
        name: 'Academic Focus',
        description: 'Optimized for academic research and study',
        category: 'academic',
        preferredModels: ['gemini-2.0-flash', 'gemini-grounded-search'],
        defaultParameters: { temperature: 0.3, maxTokens: 3000, topP: 0.9 },
        responseStyle: 'direct',
        showReasoningProcess: true,
        adaptiveDifficulty: true,
        isCustom: false,
        createdAt: new Date()
      },
      {
        id: 'creative-expression',
        name: '🎨 Creative Expression',
        description: 'Enhanced for creative writing and artistic projects',
        category: 'creative',
        preferredModels: ['gemini-2.0-flash-realtime', 'creative-writer'],
        defaultParameters: { temperature: 0.8, maxTokens: 4000, topP: 0.95 },
        responseStyle: 'verbose',
        showReasoningProcess: false,
        adaptiveDifficulty: false,
        isCustom: false,
        createdAt: new Date()
      }
    ];
  }
}

export const userPreferencesService = new UserPreferencesService(); 