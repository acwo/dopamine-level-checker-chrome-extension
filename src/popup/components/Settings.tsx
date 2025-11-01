import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Key, Save, ExternalLink } from 'lucide-react';

export default function Settings() {
	const [apiKey, setApiKey] = useState('');
	const [status, setStatus] = useState('');

	useEffect(() => {
		chrome.storage.local.get('apiKey', (result) => {
			if (result.apiKey) {
				setApiKey(result.apiKey);
			}
		});
	}, []);

	const handleSave = () => {
		chrome.storage.local.set({ apiKey }, () => {
			setStatus('API Key saved successfully!');
			setTimeout(() => setStatus(''), 2000);
		});
	};

	return (
		<div className='p-6 space-y-6 max-w-2xl'>
			<Card>
				<CardHeader>
					<div className='flex items-center gap-2'>
						<Key className='h-5 w-5 text-orange-500' />
						<CardTitle>API Configuration</CardTitle>
					</div>
					<CardDescription>
						Configure your Gemini AI API key to enable video analysis.
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='space-y-2'>
						<Label htmlFor='api-key'>Gemini API Key</Label>
						<Input
							id='api-key'
							type='password'
							value={apiKey}
							onChange={(e: any) => setApiKey(e.target.value)}
							placeholder='Enter your Gemini API Key'
							className='font-mono focus-visible:ring-orange-500'
						/>
						<p className='text-xs text-muted-foreground'>
							Your API key is stored locally and never shared.
						</p>
					</div>
					<div className='flex items-center gap-3'>
						<Button 
							onClick={handleSave} 
							className='gap-2 bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700'
							style={{ background: 'linear-gradient(135deg, #FFA726 0%, #FF7043 100%)' }}
						>
							<Save className='h-4 w-4' />
							Save API Key
						</Button>
						{status && (
							<p className='text-sm font-medium text-orange-500'>{status}</p>
						)}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Getting Started</CardTitle>
					<CardDescription>
						Learn how to use the D-Level Analyzer extension.
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='space-y-3 text-sm'>
						<div>
							<h4 className='font-medium mb-1'>1. Get a Gemini API Key</h4>
							<p className='text-muted-foreground'>
								Visit the Google AI Studio to get your free API key.
							</p>
							<a
								href='https://aistudio.google.com/app/apikey'
								target='_blank'
								rel='noopener noreferrer'
								className='text-orange-500 hover:text-orange-600 hover:underline inline-flex items-center gap-1 mt-1 font-medium'
							>
								Get API Key
								<ExternalLink className='h-3 w-3' />
							</a>
						</div>
						<div>
							<h4 className='font-medium mb-1'>2. Analyze Videos</h4>
							<p className='text-muted-foreground'>
								Go to any YouTube video and click the "Analyze D-Level" button below the video.
							</p>
						</div>
						<div>
							<h4 className='font-medium mb-1'>3. View Results</h4>
							<p className='text-muted-foreground'>
								Open this popup to see all your analyzed videos and their dopaminergic profiles.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
