import React from 'react';
import { Progress } from '../ui/progress';
import { Label } from '../ui/label';

interface DopamineType {
	type: string;
	value: number;
}

interface DopamineTypeProgressProps {
	data: DopamineType[];
}

const dopamineColorMap: { [key: string]: string } = {
	Reflective: 'bg-[#66c2a5]',
	Affective: 'bg-[#8da0cb]',
	Creative: 'bg-[#a6d854]',
	Sensory: 'bg-[#ffd92f]',
	Chaotic: 'bg-[#fc8d62]',
};

const DopamineTypeProgress: React.FC<DopamineTypeProgressProps> = ({
	data,
}) => {
	return (
		<div className='w-full space-y-4'>
			<h3 className='text-center text-sm font-semibold'>
				Dominant Dopamine Types
			</h3>
			{data
				.filter((d) => d.value > 0)
				.map((item) => (
					<div key={item.type} className='grid gap-2'>
						<div className='flex justify-between items-center'>
							<Label htmlFor={item.type} className='text-xs font-medium'>
								{item.type}
							</Label>
							<span className='text-xs font-semibold'>{item.value}%</span>
						</div>
						<Progress
							id={item.type}
							value={item.value}
							className='h-2'
							indicatorClassName={dopamineColorMap[item.type] || 'bg-primary'}
						/>
					</div>
				))}
		</div>
	);
};

export default DopamineTypeProgress;

