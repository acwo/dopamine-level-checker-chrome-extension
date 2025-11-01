import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DLevelAnalysis } from '../../types';
import DLevelGauge from './charts/DLevelGauge';
import DopamineTypeProgress from './charts/DopamineTypeProgress';
import ScoreIndicator from './charts/ScoreIndicator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ExternalLink } from 'lucide-react';

export default function AnalysisDisplay({ analysis }: { analysis: DLevelAnalysis }) {
	if (!analysis) {
		return null;
	}

	const correctedAnalysis = analysis.fullAnalysis.replace(/\\n/g, '\n');

	return (
		<div className='space-y-6 sm:space-y-8'>
			{/* Visual Profile */}
			<Card className='border-0 bg-muted/30 shadow-sm sm:border'>
				<CardHeader className='space-y-1'>
					<CardTitle className='text-xl sm:text-2xl'>Visual Dopamine Profile</CardTitle>
				</CardHeader>
				<CardContent className='grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 sm:items-center'>
					<div className='flex justify-center'>
						<DLevelGauge score={analysis.dLevel} width={160} height={110} />
					</div>
					<DopamineTypeProgress data={analysis.dopamineTypes} />
				</CardContent>
			</Card>

			{/* Verdict Section */}
			<Card className='bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'>
				<CardHeader>
					<div className='flex items-start gap-4'>
						{/* Small Clickable Thumbnail */}
						{analysis.videoId && (
							<a
								href={`https://www.youtube.com/watch?v=${analysis.videoId}`}
								target='_blank'
								rel='noopener noreferrer'
								className='group flex-shrink-0'
							>
								<div className='relative w-32 h-18 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow'>
									<img
										src={`https://img.youtube.com/vi/${analysis.videoId}/mqdefault.jpg`}
										alt='Video thumbnail'
										className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
									/>
									<div className='absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center'>
										<div className='bg-white/90 rounded-full p-1.5 group-hover:scale-110 transition-transform'>
											<ExternalLink className='w-3.5 h-3.5 text-gray-800' />
										</div>
									</div>
								</div>
							</a>
						)}
						<div className='flex-1'>
							<CardTitle>D-Level Checker 0.9 Verdict</CardTitle>
							<CardDescription>
								Key takeaways and recommendations for parents.
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<p className='text-base'>{analysis.verdict}</p>
				</CardContent>
			</Card>

			{/* Detailed Analysis Text */}
			<Card className='border-0 bg-muted/30 shadow-sm sm:border'>
				<CardHeader>
					<CardTitle className='text-xl sm:text-2xl'>Detailed Analysis</CardTitle>
					<CardDescription>
						Results based on the Dopamine Level Checker 0.9 model.
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-6 sm:space-y-8'>
					<div className='flex flex-col items-stretch gap-4 sm:flex-row sm:justify-between sm:gap-6'>
						<ScoreIndicator
							title='Neural Overdrive'
							score={analysis.neuralOverdrive.score}
							maxScore={10}
							sentiment='negative'
							className='rounded-xl bg-background/60 p-4 shadow-sm'
						/>
						<ScoreIndicator
							title='Emotional Coherence'
							score={analysis.emotionalCoherence.score}
							maxScore={100}
							sentiment='positive'
							className='rounded-xl bg-background/60 p-4 shadow-sm'
						/>
						<ScoreIndicator
							title='Cognitive Depth'
							score={analysis.cognitiveDepth.score}
							maxScore={100}
							sentiment='positive'
							className='rounded-xl bg-background/60 p-4 shadow-sm'
						/>
					</div>
					<div className='prose prose-base max-w-none dark:prose-invert'>
						<style dangerouslySetInnerHTML={{__html: `
							.prose h3 {
								margin-top: 3rem !important;
								margin-bottom: 1.5rem !important;
								font-size: 1.25rem !important;
								font-weight: 600 !important;
							}
							.prose h3:first-of-type {
								margin-top: 0 !important;
							}
							.prose p {
								margin-top: 1.5rem !important;
								margin-bottom: 1.5rem !important;
								line-height: 1.75 !important;
							}
							.prose ul {
								margin-top: 1.5rem !important;
								margin-bottom: 1.5rem !important;
							}
							.prose li {
								margin-top: 1rem !important;
								margin-bottom: 1rem !important;
							}
							.prose em {
								display: block !important;
								margin-top: 2rem !important;
								margin-bottom: 2rem !important;
								padding: 1rem !important;
								background-color: rgba(0, 0, 0, 0.03) !important;
								border-left: 4px solid hsl(var(--primary)) !important;
								font-style: italic !important;
								color: hsl(var(--muted-foreground)) !important;
							}
							.prose strong {
								font-weight: 600 !important;
							}
						`}} />
						<ReactMarkdown remarkPlugins={[remarkGfm]}>
							{correctedAnalysis}
						</ReactMarkdown>
					</div>
					<div className='flex justify-center pt-4 sm:pt-6'>
						<DLevelGauge score={analysis.dLevel} width={180} height={120} />
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
