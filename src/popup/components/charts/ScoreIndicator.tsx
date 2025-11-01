import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface ScoreIndicatorProps {
	title: string;
	score: number;
	maxScore: number;
	sentiment?: 'positive' | 'negative';
	className?: string;
}

const ScoreIndicator: React.FC<ScoreIndicatorProps> = ({
	title,
	score,
	maxScore,
	sentiment = 'negative',
	className,
}) => {
	const ref = useRef<SVGSVGElement>(null);

	useEffect(() => {
		if (ref.current) {
			const svg = d3.select(ref.current);
			svg.selectAll('*').remove();

			const width = 100;
			const height = 60;
			const arcWidth = 8;
			const DURATION = 1500;

			const g = svg
				.append('g')
				.attr('transform', `translate(${width / 2}, ${height - 10})`);

			const angle = d3
				.scaleLinear()
				.domain([0, maxScore])
				.range([-Math.PI / 2, Math.PI / 2]);

			const colorScale = d3
				.scaleLinear<string>()
				.domain([0, maxScore * 0.25, maxScore * 0.5, maxScore * 0.75, maxScore])
				.range(['#FFA726', '#FF7043', '#FF5722', '#F4511E', '#F4511E']);

			const arc = d3
				.arc<{ endAngle: number }>()
				.innerRadius(width / 2 - arcWidth - 10)
				.outerRadius(width / 2 - 10)
				.startAngle(-Math.PI / 2)
				.cornerRadius(3);

			g.append('path')
				.datum({ endAngle: Math.PI / 2 })
				.style('fill', '#e0e0e0')
				.attr('d', arc);

			const foreground = g
				.append('path')
				.datum({ endAngle: -Math.PI / 2 })
				.style('fill', colorScale(score))
				.attr('d', arc);

			foreground
				.transition()
				.duration(DURATION)
				.ease(d3.easeElastic)
				.attrTween('d', (d: { endAngle: number }) => {
					const interpolate = d3.interpolate(
						d.endAngle,
						angle(score)
					);
					return (t: number) => {
						d.endAngle = interpolate(t);
						return arc(d) ?? '';
					};
				});

			g.append('text')
				.text(`${score} / ${maxScore}`)
				.attr('text-anchor', 'middle')
				.attr('dy', '-0.35em')
				.style('font-size', '14px')
				.style('font-weight', 'bold')
				.style('fill', colorScale(score));
		}
	}, [score, maxScore, sentiment]);

	return (
		<div className={`flex flex-col items-center text-center ${className || ''}`}>
			<svg ref={ref} width={100} height={60}></svg>
			<p className='text-xs font-semibold mt-1'>{title}</p>
		</div>
	);
};

export default ScoreIndicator;

