import { ScoreHistoryItem, PresentationDeck, Participant, ParticipantMode, ThemeMode } from '../types';

const STORAGE_KEYS = {
  THEME_MODE: 'ppt_theme_mode_v3',
  PARTICIPANTS_V2: 'ppt_participants_v2',
  PARTICIPANT_MODE_V2: 'ppt_participant_mode_v2',
  HAS_CONFIGURED_TEAMS_V2: 'ppt_has_configured_teams_v2',
  TEAM_A_SCORE: 'ppt_team_a_score_v1',
  TEAM_B_SCORE: 'ppt_team_b_score_v1',
  TEAM_A_NAME: 'ppt_team_a_name_v1',
  TEAM_B_NAME: 'ppt_team_b_name_v1',
  SCORE_HISTORY: 'ppt_score_history_v1',
  CURRENT_DECK_ID: 'ppt_current_deck_id_v1',
  CURRENT_SLIDE: 'ppt_current_slide_idx_v1',
  SOUND_ENABLED: 'ppt_sound_enabled_v1',
  SAVED_CUSTOM_DECK: 'ppt_custom_deck_v1',
};

export const MEMBER_EMOJIS = [
  '🦊', '🐯', '🚀', '🐼', '🦁', '🦄', '⚡', '🎯',
  '👾', '🦉', '🐬', '🥑', '🌟', '🍕', '🔥', '👑',
  '🎸', '🏎️', '🏄‍♂️', '🤖', '🐶', '🐱', '🐲', '🏆',
  '💎', '🎉', '🧠', '🧙‍♂️', '🥷', '🌈', '🦅', '🐝',
  '🌺', '🎨', '⚽', '🎪', '🪐', '⚓', '🎭', '🥊',
  '🧸', '🦖', '🍀', '💡', '🕹️', '🌊', '🍁', '🌙',
  '🪄', '☕'
];

export const getRandomEmoji = (exclude: string[] = []): string => {
  const pool = MEMBER_EMOJIS.filter((e) => !exclude.includes(e));
  const source = pool.length > 0 ? pool : MEMBER_EMOJIS;
  return source[Math.floor(Math.random() * source.length)];
};

export const getSavedThemeMode = (): ThemeMode => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME_MODE);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
  } catch {
    // Default to dark
  }
  return 'dark'; // Always default to Dark mode
};

export const saveThemeMode = (mode: ThemeMode) => {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
  } catch (err) {
    console.error('Failed to save theme mode', err);
  }
};

export const COLOR_CONFIGS: Array<{
  color: Participant['color'];
  defaultTeamName: string;
  defaultEmoji: string;
}> = [
  { color: 'cyan', defaultTeamName: 'Team A', defaultEmoji: '🦊' },
  { color: 'rose', defaultTeamName: 'Team B', defaultEmoji: '🚀' },
  { color: 'amber', defaultTeamName: 'Team C', defaultEmoji: '🦁' },
  { color: 'emerald', defaultTeamName: 'Team D', defaultEmoji: '🐼' },
  { color: 'indigo', defaultTeamName: 'Team E', defaultEmoji: '🦄' },
  { color: 'purple', defaultTeamName: 'Team F', defaultEmoji: '⚡' },
  { color: 'fuchsia', defaultTeamName: 'Team G', defaultEmoji: '🎯' },
  { color: 'teal', defaultTeamName: 'Team H', defaultEmoji: '🥑' },
];

export const getTeamNameForIndex = (index: number): string => {
  const letter = String.fromCharCode(65 + index); // A, B, C, D...
  return `Team ${letter}`;
};

export const getDefaultParticipants = (mode: ParticipantMode = 'teams', count: number = 2): Participant[] => {
  const safeCount = mode === 'teams' ? Math.min(4, Math.max(2, count)) : Math.min(20, Math.max(2, count));
  const usedEmojis: string[] = [];

  return Array.from({ length: safeCount }, (_, i) => {
    const colorConfig = COLOR_CONFIGS[i % COLOR_CONFIGS.length];
    const emoji = getRandomEmoji(usedEmojis);
    usedEmojis.push(emoji);

    const letter = String.fromCharCode(65 + i);
    const keyLabel = i < 4 ? `${i + 1} / ${letter}` : i < 9 ? `${i + 1}` : `#${i + 1}`;

    return {
      id: `p-${i + 1}`,
      // For Teams: Team A, Team B, Team C, Team D...
      // For Members: empty name by default (user will have to manually type to continue)
      name: mode === 'teams' ? getTeamNameForIndex(i) : '',
      score: 0,
      color: colorConfig.color,
      keyLabel,
      avatarEmoji: emoji,
    };
  });
};

export const getSavedGameSetup = (): {
  mode: ParticipantMode;
  participants: Participant[];
  hasConfigured: boolean;
} => {
  try {
    const hasConfigured = localStorage.getItem(STORAGE_KEYS.HAS_CONFIGURED_TEAMS_V2) === 'true';
    const savedMode = (localStorage.getItem(STORAGE_KEYS.PARTICIPANT_MODE_V2) as ParticipantMode) || 'teams';
    const rawParticipants = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS_V2);

    if (rawParticipants) {
      const parsed = JSON.parse(rawParticipants);
      const maxAllowed = savedMode === 'teams' ? 4 : 20;
      if (Array.isArray(parsed) && parsed.length >= 2 && parsed.length <= maxAllowed) {
        const usedEmojis: string[] = [];
        const validated: Participant[] = parsed.map((p, idx) => {
          let emoji = p.avatarEmoji;
          if (!emoji) {
            emoji = getRandomEmoji(usedEmojis);
          }
          usedEmojis.push(emoji);
          const colorConfig = COLOR_CONFIGS[idx % COLOR_CONFIGS.length];
          const letter = String.fromCharCode(65 + idx);
          const keyLabel = p.keyLabel || (idx < 4 ? `${idx + 1} / ${letter}` : `${idx + 1}`);

          return {
            ...p,
            id: p.id || `p-${idx + 1}`,
            color: p.color || colorConfig.color,
            keyLabel,
            avatarEmoji: emoji,
          };
        });

        return {
          mode: savedMode,
          participants: validated,
          hasConfigured,
        };
      }
    }

    // Fallback to legacy Team A / Team B if available
    const legacyA = localStorage.getItem(STORAGE_KEYS.TEAM_A_SCORE);
    const legacyB = localStorage.getItem(STORAGE_KEYS.TEAM_B_SCORE);
    const legacyNameA = localStorage.getItem(STORAGE_KEYS.TEAM_A_NAME) || 'Team A';
    const legacyNameB = localStorage.getItem(STORAGE_KEYS.TEAM_B_NAME) || 'Team B';

    const fallbackParticipants: Participant[] = [
      {
        id: 'p-1',
        name: legacyNameA === 'Team 1' ? 'Team A' : legacyNameA,
        score: legacyA ? parseInt(legacyA, 10) || 0 : 0,
        color: 'cyan',
        keyLabel: '1 / A',
        avatarEmoji: '🦊',
      },
      {
        id: 'p-2',
        name: legacyNameB === 'Team 2' ? 'Team B' : legacyNameB,
        score: legacyB ? parseInt(legacyB, 10) || 0 : 0,
        color: 'rose',
        keyLabel: '2 / B',
        avatarEmoji: '🚀',
      },
    ];

    return {
      mode: savedMode,
      participants: fallbackParticipants,
      hasConfigured,
    };
  } catch {
    return {
      mode: 'teams',
      participants: getDefaultParticipants('teams', 2),
      hasConfigured: false,
    };
  }
};

export const saveGameSetup = (mode: ParticipantMode, participants: Participant[], hasConfigured: boolean = true) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PARTICIPANT_MODE_V2, mode);
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS_V2, JSON.stringify(participants));
    localStorage.setItem(STORAGE_KEYS.HAS_CONFIGURED_TEAMS_V2, hasConfigured ? 'true' : 'false');
    
    // Also update legacy keys for compatibility
    if (participants[0]) {
      localStorage.setItem(STORAGE_KEYS.TEAM_A_NAME, participants[0].name);
      localStorage.setItem(STORAGE_KEYS.TEAM_A_SCORE, participants[0].score.toString());
    }
    if (participants[1]) {
      localStorage.setItem(STORAGE_KEYS.TEAM_B_NAME, participants[1].name);
      localStorage.setItem(STORAGE_KEYS.TEAM_B_SCORE, participants[1].score.toString());
    }
  } catch (err) {
    console.error('Failed to save game setup to localStorage', err);
  }
};

export const resetAllScores = (participants: Participant[]): Participant[] => {
  const reset = participants.map((p) => ({ ...p, score: 0 }));
  try {
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS_V2, JSON.stringify(reset));
    localStorage.setItem(STORAGE_KEYS.TEAM_A_SCORE, '0');
    localStorage.setItem(STORAGE_KEYS.TEAM_B_SCORE, '0');
    localStorage.setItem(STORAGE_KEYS.SCORE_HISTORY, JSON.stringify([]));
  } catch (err) {
    console.error('Failed to reset participant scores', err);
  }
  return reset;
};

export const getSavedScores = (): { teamA: number; teamB: number } => {
  try {
    const a = localStorage.getItem(STORAGE_KEYS.TEAM_A_SCORE);
    const b = localStorage.getItem(STORAGE_KEYS.TEAM_B_SCORE);
    return {
      teamA: a !== null ? parseInt(a, 10) || 0 : 0,
      teamB: b !== null ? parseInt(b, 10) || 0 : 0,
    };
  } catch {
    return { teamA: 0, teamB: 0 };
  }
};

export const saveScores = (teamA: number, teamB: number) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TEAM_A_SCORE, teamA.toString());
    localStorage.setItem(STORAGE_KEYS.TEAM_B_SCORE, teamB.toString());
  } catch (err) {
    console.error('Failed to save scores to localStorage', err);
  }
};

export const getSavedTeamNames = (): { teamA: string; teamB: string } => {
  try {
    const a = localStorage.getItem(STORAGE_KEYS.TEAM_A_NAME);
    const b = localStorage.getItem(STORAGE_KEYS.TEAM_B_NAME);
    return {
      teamA: a || 'Team A',
      teamB: b || 'Team B',
    };
  } catch {
    return { teamA: 'Team A', teamB: 'Team B' };
  }
};

export const saveTeamNames = (teamA: string, teamB: string) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TEAM_A_NAME, teamA);
    localStorage.setItem(STORAGE_KEYS.TEAM_B_NAME, teamB);
  } catch (err) {
    console.error('Failed to save team names', err);
  }
};

export const getSavedHistory = (): ScoreHistoryItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SCORE_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveHistory = (history: ScoreHistoryItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SCORE_HISTORY, JSON.stringify(history.slice(-100)));
  } catch (err) {
    console.error('Failed to save score history', err);
  }
};

export const getSavedSlideIndex = (): number => {
  try {
    const idx = localStorage.getItem(STORAGE_KEYS.CURRENT_SLIDE);
    return idx !== null ? parseInt(idx, 10) || 0 : 0;
  } catch {
    return 0;
  }
};

export const saveSlideIndex = (index: number) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SLIDE, index.toString());
  } catch (err) {
    console.error('Failed to save slide index', err);
  }
};

export const getSavedDeckId = (): string => {
  try {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_DECK_ID) || 'trivia-arena';
  } catch {
    return 'trivia-arena';
  }
};

export const saveDeckId = (deckId: string) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENT_DECK_ID, deckId);
  } catch (err) {
    console.error('Failed to save deck ID', err);
  }
};

export const getSavedCustomDeck = (): PresentationDeck | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_CUSTOM_DECK);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveCustomDeck = (deck: PresentationDeck | null) => {
  try {
    if (deck) {
      localStorage.setItem(STORAGE_KEYS.SAVED_CUSTOM_DECK, JSON.stringify(deck));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SAVED_CUSTOM_DECK);
    }
  } catch (err) {
    console.warn('Unable to persist custom deck in localStorage (may exceed quota)', err);
  }
};

export const resetGameScores = () => {
  try {
    localStorage.setItem(STORAGE_KEYS.TEAM_A_SCORE, '0');
    localStorage.setItem(STORAGE_KEYS.TEAM_B_SCORE, '0');
    localStorage.setItem(STORAGE_KEYS.SCORE_HISTORY, JSON.stringify([]));
  } catch (err) {
    console.error('Failed to reset scores in localStorage', err);
  }
};
