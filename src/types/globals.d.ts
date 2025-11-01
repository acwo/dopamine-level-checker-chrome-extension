declare global {
	interface Window {
		ai?: {
			prompt: (prompt: string) => Promise<string>;
		};
	}
}

export {};
