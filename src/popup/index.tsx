import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './popup.css';

import AnalysisDisplay from './components/AnalysisDisplay';
import AnalysisList from './components/AnalysisList';
import Settings from './components/Settings';
import { DLevelAnalysis } from '../types';
import { Button } from './components/ui/button';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';

const Popup = () => {
	const [analyses, setAnalyses] = useState<Record<string, DLevelAnalysis>>({});
	const [selectedAnalysis, setSelectedAnalysis] = useState<DLevelAnalysis | null>(
		null
	);
	const [view, setView] = useState<'list' | 'analysis' | 'settings'>('list');

	useEffect(() => {
		chrome.storage.local.get(null, (items) => {
			const loadedAnalyses: Record<string, DLevelAnalysis> = {};
			for (const key in items) {
				if (key !== 'apiKey') {
					loadedAnalyses[key] = items[key];
				}
			}
			setAnalyses(loadedAnalyses);
		});

		const storageListener = (
			changes: { [key: string]: chrome.storage.StorageChange },
			areaName: string
		) => {
			if (areaName === 'local') {
				chrome.storage.local.get(null, (items) => {
					const loadedAnalyses: Record<string, DLevelAnalysis> = {};
					for (const key in items) {
						if (key !== 'apiKey') {
							loadedAnalyses[key] = items[key];
						}
					}
					setAnalyses(loadedAnalyses);
				});
			}
		};

		chrome.storage.onChanged.addListener(storageListener);

		return () => {
			chrome.storage.onChanged.removeListener(storageListener);
		};
	}, []);

	const handleSelectAnalysis = (analysis: DLevelAnalysis) => {
		setSelectedAnalysis(analysis);
		setView('analysis');
	};

	const renderHeader = () => {
		if (view === 'list') {
			return (
				<div className='flex items-center justify-between px-6 py-4 border-b bg-card'>
					<h1 className='text-lg font-semibold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent'>
						D-Level Analyzer
					</h1>
					<Button
						variant='ghost'
						size='icon'
						onClick={() => setView('settings')}
						title='Settings'
						className='hover:bg-orange-500/10 hover:text-orange-500'
					>
						<SettingsIcon className='h-5 w-5' />
					</Button>
				</div>
			);
		} else {
			return (
				<div className='flex items-center gap-2 px-6 py-4 border-b bg-card'>
					<Button
						variant='ghost'
						size='sm'
						onClick={() => setView('list')}
						className='gap-1 hover:bg-orange-500/10 hover:text-orange-500'
					>
						<ArrowLeft className='h-4 w-4' />
						Back
					</Button>
					<h2 className='text-base font-medium truncate'>
						{view === 'settings' ? 'Settings' : selectedAnalysis?.title}
					</h2>
				</div>
			);
		}
	};

	const renderView = () => {
		switch (view) {
			case 'analysis':
				return (
					<div className='p-6 overflow-y-auto flex-1'>
						<AnalysisDisplay analysis={selectedAnalysis!} />
					</div>
				);
			case 'settings':
				return (
					<div className='overflow-y-auto flex-1'>
						<Settings />
					</div>
				);
			case 'list':
			default:
				return (
					<div className='overflow-y-auto flex-1'>
						<AnalysisList
							analyses={Object.values(analyses)}
							onAnalysisSelect={handleSelectAnalysis}
						/>
					</div>
				);
		}
	};

	return (
		<div className='flex flex-col' style={{ width: '800px', height: '800px' }}>
			{renderHeader()}
			{renderView()}
		</div>
	);
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
	<React.StrictMode>
		<Popup />
	</React.StrictMode>
);
