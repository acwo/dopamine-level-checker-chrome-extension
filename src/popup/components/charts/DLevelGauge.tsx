import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface DLevelGaugeProps {
	score: number;
	width?: number;
	height?: number;
	textColor?: string;
}

const DLevelGauge: React.FC<DLevelGaugeProps> = ({
	score,
	width = 200,
	height = 130,
	textColor = '#000',
}) => {
	const svgRef = useRef<SVGSVGElement>(null);

	useEffect(() => {
		if (score === undefined || !svgRef.current) return;

		const svg = d3.select(svgRef.current);
		svg.selectAll('*').remove();

		const margin = 20;
		const radius = Math.min(width, height * 1.5) / 2 - margin;

		const colorScale = d3
			.scaleLinear<string>()
			.domain([1, 25, 50, 75, 100])
			.range(['#FFA726', '#FF7043', '#FF5722', '#F4511E', '#F4511E']);

		const color = colorScale(score);

		const g = svg
			.append('g')
			.attr('transform', `translate(${width / 2}, ${height / 1.65})`);

		const arc = d3
			.arc<{ endAngle: number }>()
			.innerRadius(radius - 12)
			.outerRadius(radius)
			.startAngle(-Math.PI / 2)
			.cornerRadius(5);

		g.append('path')
			.datum({ endAngle: Math.PI / 2 })
			.style('fill', '#e0e0e0')
			.attr('d', arc);

		const foreground = g
			.append('path')
			.datum({ endAngle: -Math.PI / 2 })
			.style('fill', color)
			.attr('d', arc);

		foreground
			.transition()
			.duration(1500)
			.ease(d3.easeElastic)
			.attrTween('d', (d: { endAngle: number }) => {
				const interpolate = d3.interpolate(
					d.endAngle,
					(score / 100) * Math.PI - Math.PI / 2
				);
				return (t: number) => {
					d.endAngle = interpolate(t);
					return arc(d) ?? '';
				};
			});

		const scoreText = g
			.append('text')
			.attr('text-anchor', 'middle')
			.attr('dy', '-0.3em')
			.style('font-size', `${Math.max(18, radius / 2)}px`)
			.style('font-weight', 'bold')
			.style('fill', color);

		scoreText
			.transition()
			.duration(1500)
			.tween('text', () => {
				const interpolate = d3.interpolate(0, score);
				return (t: number) => {
					scoreText.text(Math.round(interpolate(t)));
				};
			});

		g.append('text')
			.text('/ 100')
			.attr('text-anchor', 'middle')
			.attr('dy', '1.1em')
			.style('font-size', `${Math.max(10, radius / 5.5)}px`)
			.style('fill', textColor === '#000' ? '#666' : '#eee');
	}, [score, width, height, textColor]);

	return (
		<div className='flex flex-col items-center'>
			<svg ref={svgRef} width={width} height={height}></svg>
			<div className='text-center'>
				<p
					className='text-sm font-semibold'
					style={{
						fontSize: `${Math.max(10, width / 18)}px`,
						color: textColor,
					}}
				>
					D-Level
				</p>
				<p
					className='text-xs'
					style={{
						fontSize: `${Math.max(9, width / 22)}px`,
						color: textColor,
						opacity: 0.8,
					}}
				>
				</p>
			</div>
		</div>
	);
};

export default DLevelGauge;

