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

// Sample data structure (this would come from CMS in production)
const wheelData: WheelSegment[] = [
	{
		text: 'CX Analytics',
		color: '#22f4ad',
		question: {
			text: 'Which of the following best describes the primary function of Akixi CX Analytics?',
			choices: [
				'A messaging platform',
				'Video conferencing and screen sharing tool',
				'A call analytics solution that provides real-time and historical insights into call data'
			],
			correct: 'C',
			explanation: null
		}
	},
	{
		text: 'Wallboards',
		color: '#1cd2fa',
		question: {
			text: 'What is the primary function of Customisable Wallboards in a call centre environment?',
			choices: [
				'To automate outbound email marketing',
				'To display live data on call queues, activity levels, and KPIs for better team performance',
				'To archive historical call data for legal compliance'
			],
			correct: 'B',
			explanation: null
		}
	},
	{
		text: 'Missed Call Recovery',
		color: '#4450ff',
		question: {
			text: 'What is the primary purpose of Unreturned Lost Call Reports?',
			choices: [
				'To block spam and robocalls from reaching the call center',
				'To analyse agent performance during live calls',
				'To provide teams with data to follow up on missed calls and identify service or sales opportunities'
			],
			correct: 'C',
			explanation: null
		}
	},
	{
		text: 'Call Volume by Interval',
		color: '#1cd2fa',
		question: {
			text: 'What is the main use of Call Interval and Volume Reports?',
			choices: [
				'Tracking customer satisfaction scores',
				'Identifying peak call times to support staffing and resource planning',
				'Monitoring internet bandwidth usage during calls'
			],
			correct: 'B',
			explanation: null
		}
	},
	{
		text: 'Call History Reporting',
		color: '#22f4ad',
		question: {
			text: 'How does Call Log History support dispute resolution?',
			choices: [
				'By allowing automatic call rerouting to senior staff',
				'By tracking caller journeys to identify friction points in processes, teams, or individuals',
				'By generating sales leads from unanswered calls'
			],
			correct: 'B',
			explanation: null
		}
	},
	{
		text: 'Auto Attendant & User reports',
		color: '#4450ff',
		question: {
			text: 'What is the main benefit of User / Auto Attendant Reports?',
			choices: [
				'To schedule training sessions for support staff',
				'To measure the efficiency and customer experience provided by human and automated agents',
				'To monitor email response rates'
			],
			correct: 'B',
			explanation: null
		}
	},
	{
		text: 'Queue & Group Activity',
		color: '#1cd2fa',
		question: {
			text: 'What is the main objective of Queue and Group Activity Reports?',
			choices: [
				'To automate customer surveys after calls',
				'To monitor queue data in real-time and historically in order to identify bottlenecks and improve service',
				'To manage voicemail inboxes for multiple departments'
			],
			correct: 'B',
			explanation: null
		}
	}
];

class GameState {
	segments = $state<WheelSegment[]>(wheelData);
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
