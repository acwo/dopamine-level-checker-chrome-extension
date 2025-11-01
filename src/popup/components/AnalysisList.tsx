import React, { useState, useMemo } from 'react';
import { DLevelAnalysis } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import DLevelGauge from './charts/DLevelGauge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowUpDown, Filter, X, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

type SortKey = 'dLevel' | 'title';
type SortOrder = 'asc' | 'desc';
type FilterRange = 'calm' | 'balanced' | 'energetic' | 'electrifying';

interface AnalysisListProps {
	analyses: DLevelAnalysis[];
	onAnalysisSelect: (analysis: DLevelAnalysis) => void;
}

const filterConfigs: Record<FilterRange, { label: string; range: [number, number] }> = {
	calm: { label: 'Calm (1-30)', range: [1, 30] },
	balanced: { label: 'Balanced (31-65)', range: [31, 65] },
	energetic: { label: 'Energetic (66-85)', range: [66, 85] },
	electrifying: { label: 'Electrifying (86-100)', range: [86, 100] },
};

export default function AnalysisList({ analyses, onAnalysisSelect }: AnalysisListProps) {
	const [sortBy, setSortBy] = useState<SortKey>('dLevel');
	const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
	const [activeFilters, setActiveFilters] = useState<FilterRange[]>([]);
	const [searchQuery, setSearchQuery] = useState('');

	const filteredAndSortedAnalyses = useMemo(() => {
		let filtered = analyses;

		if (searchQuery) {
			filtered = filtered.filter((analysis) =>
				analysis.title.toLowerCase().includes(searchQuery.toLowerCase())
			);
		}

		if (activeFilters.length > 0) {
			filtered = filtered.filter((analysis) => {
				return activeFilters.some((filter) => {
					const [min, max] = filterConfigs[filter].range;
					return analysis.dLevel >= min && analysis.dLevel <= max;
				});
			});
		}

		const sorted = [...filtered].sort((a, b) => {
			if (sortBy === 'dLevel') {
				return a.dLevel - b.dLevel;
			}
			return 0; // Simplified for now
		});

		if (sortOrder === 'desc') {
			return sorted.reverse();
		}
		return sorted;
	}, [analyses, sortBy, sortOrder, activeFilters, searchQuery]);

	const handleSort = (key: SortKey) => {
		if (sortBy === key) {
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			setSortBy(key);
			setSortOrder('asc');
		}
	};

	const toggleFilter = (filter: FilterRange) => {
		setActiveFilters((prev) =>
			prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]
		);
	};

	const handleDelete = (e: React.MouseEvent, videoId: string) => {
		e.stopPropagation();
		if (confirm('Delete this analysis? This action cannot be undone.')) {
			chrome.storage.local.remove(videoId);
		}
	};

	return (
		<div className='p-6'>
			<div className='space-y-6'>
				<Input
					type='text'
					placeholder='Search by title, channel, or video ID...'
					value={searchQuery}
					onChange={(e: any) => setSearchQuery(e.target.value)}
					className='w-full'
				/>
				
				<div className='flex flex-col gap-4'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2'>
							<Filter className='h-4 w-4 text-orange-500' />
							<h3 className='text-sm font-semibold'>Filter by D-Level:</h3>
						</div>
						<Button
							variant='outline'
							size='sm'
							onClick={() => handleSort('dLevel')}
							className='gap-2 hover:bg-orange-500/10 hover:border-orange-500/50'
						>
							Sort by D-Level
							{sortBy === 'dLevel' && <ArrowUpDown className='h-4 w-4' />}
						</Button>
					</div>
					
					<div className='flex flex-wrap gap-2'>
						{(Object.keys(filterConfigs) as FilterRange[]).map((filter) => {
							const isActive = activeFilters.includes(filter);
							return (
								<Button
									key={filter}
									variant={isActive ? 'default' : 'outline'}
									size='sm'
									onClick={() => toggleFilter(filter)}
									className={cn('rounded-full', {
										'bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600': isActive,
									})}
									style={isActive ? {
										background: 'linear-gradient(135deg, #FFA726 0%, #FF7043 100%)',
									} : undefined}
								>
									{filterConfigs[filter].label}
								</Button>
							);
						})}
						{activeFilters.length > 0 && (
							<Button
								variant='ghost'
								size='sm'
								onClick={() => setActiveFilters([])}
								className='gap-1 hover:text-orange-500'
							>
								<X className='h-4 w-4' />
								Clear
							</Button>
						)}
					</div>
				</div>

				<div className='grid grid-cols-3 gap-4'>
					{filteredAndSortedAnalyses.map((analysis) => (
						<Card
							key={analysis.videoId || analysis.title}
							className='cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden group hover:border-orange-500/50 relative'
							onClick={() => onAnalysisSelect(analysis)}
						>
							{analysis.videoId && (
								<>
									<CardContent className='p-0 relative'>
										<div className='aspect-video overflow-hidden'>
											<img
												src={`https://img.youtube.com/vi/${analysis.videoId}/mqdefault.jpg`}
												alt={analysis.title}
												className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
											/>
										</div>
							<div className='absolute top-2 left-2'>
								<div className='relative bg-black/70 backdrop-blur-sm rounded-lg p-2.5 shadow-lg group-hover:bg-black/80 transition-colors'>
									<DLevelGauge score={analysis.dLevel} width={110} height={85} textColor='#fff' />
								</div>
							</div>
									</CardContent>
									{analysis.videoId && (
										<button
											onClick={(e) => handleDelete(e, analysis.videoId!)}
											className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg z-10'
											title='Delete analysis'
										>
											<Trash2 className='h-3.5 w-3.5' />
										</button>
									)}
								</>
							)}
							<CardHeader className='p-3'>
								<CardTitle className='text-xs line-clamp-2'>{analysis.title}</CardTitle>
							</CardHeader>
						</Card>
					))}
				</div>
				
				{filteredAndSortedAnalyses.length === 0 && (
					<div className='text-center py-12'>
						<p className='text-muted-foreground'>No analyses found.</p>
						<p className='text-sm text-muted-foreground mt-2'>
							Visit a YouTube video and click "Analyze D-Level" to get started.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
