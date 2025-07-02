import { browser } from '$app/environment';
import { getContext, setContext } from 'svelte';

const GAME_KEY = Symbol('AKIXI_WHEEL');
const GAME_STATES = ['start', 'form', 'spin', 'landed', 'quiz', 'result', 'final'] as const;
export const GAME_STATES_ENUM = {
	START: GAME_STATES[0],
	FORM: GAME_STATES[1],
	SPIN: GAME_STATES[2],
	LANDED: GAME_STATES[3],
	QUIZ: GAME_STATES[4],
	RESULT: GAME_STATES[5],
	FINAL: GAME_STATES[6]
};

export const initialFormInputs: TFormInputs = {
	first_name: '',
	last_name: '',
	email: '',
	stay_in_touch: false
};

class GameState {
	isOnline = $state(browser ? navigator.onLine : true);
	current = $state<TPossibleGameState>(GAME_STATES_ENUM.START);
	rotation = $state(0);
	winSegment = $state<TWheelSegment | null>(null);
	lastPosition = $state(0);
	formInputs = $state<TFormInputs>(initialFormInputs);
	selectedAnswer = $state<'A' | 'B' | 'C' | null>(null);
	isCorrect = $state(false);

	// should have use enum above, but this is more beautiful 😂
	showBackButton = $derived(this.is('form', 'spin', 'landed'));
	showBackgroundSoundToggle = $derived(this.is('start'));
	showWheel = $derived(this.is('start', 'spin'));
	showForm = $derived(this.is('form'));
	showLanded = $derived(this.is('landed'));
	showQuiz = $derived(this.is('quiz'));
	showResult = $derived(this.is('result'));
	showFinal = $derived(this.is('final'));

	move(direction: number) {
		const currentIndex = GAME_STATES.indexOf(this.current);
		this.current = GAME_STATES[currentIndex + direction];
	}

	is(...states: TPossibleGameState[]) {
		return states.includes(this.current);
	}
}

export const setGameState = () => {
	return setContext(GAME_KEY, new GameState());
};

export const getGameState = () => {
	return getContext<ReturnType<typeof setGameState>>(GAME_KEY);
};

export type TPossibleGameState = (typeof GAME_STATES)[number];

export type TQuizQuestion = {
	text: string;
	choices: string[];
	correct: 'A' | 'B' | 'C';
	explanation: string | null;
};

export type TWheelSegment = {
	text: string;
	color: string;
	question: TQuizQuestion;
};

export type TFormInputs = {
	first_name: string;
	last_name: string;
	email: string;
	stay_in_touch: boolean;
};

export type TFormField = 'first_name' | 'last_name' | 'email';

export type QuizQuestion = {
	text: string;
	choices: [string, string, string];
	correct: 'A' | 'B' | 'C';
	explanation: string | null;
};

export type WheelSegment = {
	text: string;
	color: string;
	question: QuizQuestion;
};
