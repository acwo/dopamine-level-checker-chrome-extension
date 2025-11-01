export interface DLevelAnalysis {
	creationDate?: string;
	title: string;
	videoId?: string;
	channelName?: string;
	verdict: string;
	dLevel: number;
	dLevelCategory: 'Calm' | 'Balanced' | 'Energetic' | 'Electrifying';
	dopamineTypes: { type: string; value: number }[];
	neuralOverdrive: {
		score: number;
		analysis: string;
	};
	emotionalCoherence: {
		score: number;
		analysis: string;
	};
	cognitiveDepth: {
		index: 'Low' | 'Medium' | 'High';
		score: number;
		analysis: string;
	};
	intentStimulusAlignment: {
		score: number;
		analysis: string;
	};
	rhythmicAnalysis: {
		analysis: string;
	};
	dLevelJustification: string;
	fullAnalysis: string;
}
