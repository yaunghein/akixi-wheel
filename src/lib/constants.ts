export const GAME_STATES = {
	START: 'start',
	FORM: 'form',
	SPIN: 'spin',
	LANDED: 'landed',
	QUIZ: 'quiz',
	RESULT: 'result',
	FINAL: 'final'
} as const;

export type TGameState = (typeof GAME_STATES)[keyof typeof GAME_STATES];
