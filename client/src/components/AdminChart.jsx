import React, { useState } from 'react';

/**
 * Animated neon line chart using raw SVG paths and gradient fills.
 * Zero-dependency, fully responsive, and compliant with React 19.
 * 
 * @param {Object} props - Component properties
 * @param {Array<Object>} props.data - The data array of chart data values to plot
 * @param {Array<string>} props.dataKeys - Key names in the data objects to trace
 * @param {Array<string>} props.colors - Stroke and fill neon accent colors for each line
 * @param {Array<string>} props.labels - Display labels mapping to each key for tooltips
 */
export const AdminLineChart = ({ data = [], dataKeys = ['value'], colors = ['#6366f1'], labels = ['Users'] }) => {
    const [hoveredPoint, setHoveredPoint] = useState(null);

    if (!data || data.length === 0) {
        return (
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No trend data available
            </div>
        );
    }

    const width = 600;
    const height = 240;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Get max value to scale the Y axis
    const maxVal = Math.max(
        ...data.flatMap(d => dataKeys.map(k => d[k] || 0)),
        10 // default min height
    ) * 1.15;

    const pointsCount = data.length;
    const stepX = chartWidth / (pointsCount - 1 || 1);

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', overflow: 'visible' }}>
                <defs>
                    {dataKeys.map((key, ki) => (
                        <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={colors[ki]} stopOpacity="0.45" />
                            <stop offset="100%" stopColor={colors[ki]} stopOpacity="0.00" />
                        </linearGradient>
                    ))}
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Y Gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                    const y = padding + chartHeight * (1 - ratio);
                    const gridVal = Math.round(maxVal * ratio);
                    return (
                        <g key={index} opacity="0.15">
                            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="white" strokeDasharray="4 4" strokeWidth="1" />
                            <text x={padding - 8} y={y + 4} fill="white" fontSize="10" textAnchor="end" fontWeight="600">
                                {gridVal}
                            </text>
                        </g>
                    );
                })}

                {/* X Labels */}
                {data.map((d, index) => {
                    const x = padding + index * stepX;
                    return (
                        <text key={index} x={x} y={height - padding + 18} fill="rgba(255,255,255,0.4)" fontSize="9" fontWeight="700" textAnchor="middle">
                            {d.day || d.label}
                        </text>
                    );
                })}

                {/* Draw Paths for each key */}
                {dataKeys.map((key, ki) => {
                    const color = colors[ki];
                    
                    // Construct path string
                    const points = data.map((d, index) => {
                        const x = padding + index * stepX;
                        const y = padding + chartHeight * (1 - (d[key] || 0) / maxVal);
                        return { x, y, val: d[key] || 0, label: d.day || d.label };
                    });

                    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                    const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

                    return (
                        <g key={key}>
                            {/* Area fill */}
                            <path d={areaD} fill={`url(#grad-${key})`} />

                            {/* Line stroke */}
                            <path d={pathD} fill="none" stroke={color} strokeWidth="3" filter="url(#glow)" strokeLinecap="round" strokeLinejoin="round" />

                            {/* Interactive dots */}
                            {points.map((p, i) => (
                                <circle
                                    key={i}
                                    cx={p.x}
                                    cy={p.y}
                                    r={hoveredPoint && hoveredPoint.key === key && hoveredPoint.index === i ? 6 : 4}
                                    fill={color}
                                    stroke="white"
                                    strokeWidth="1.5"
                                    style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                                    onMouseEnter={() => setHoveredPoint({ key, index: i, x: p.x, y: p.y, val: p.val, label: p.label, keyName: labels[ki] })}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                />
                            ))}
                        </g>
                    );
                })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
                <div style={{
                    position: 'absolute',
                    left: `${(hoveredPoint.x / width) * 100}%`,
                    top: `${(hoveredPoint.y / height) * 100 - 45}%`,
                    transform: 'translate(-50%, -100%)',
                    background: 'rgba(5, 5, 8, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    pointerEvents: 'none',
                    fontSize: '11px',
                    color: 'white',
                    zIndex: 20,
                    boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                    whiteSpace: 'nowrap'
                }}>
                    <div style={{ fontWeight: 800, color: 'var(--primary)' }}>{hoveredPoint.label}</div>
                    <div style={{ fontWeight: 600, display: 'flex', gap: '8px', marginTop: '2px' }}>
                        <span>{hoveredPoint.keyName}:</span>
                        <span style={{ color: '#10b981' }}>{hoveredPoint.val}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

/**
 * Custom SVG Bar chart for distributions.
 */
export const AdminBarChart = ({ data = [], color = '#3b82f6', labelKey = 'name', valueKey = 'count' }) => {
    const [hoverIndex, setHoverIndex] = useState(null);

    if (!data || data.length === 0) {
        return (
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No distribution data available
            </div>
        );
    }

    const width = 600;
    const height = 240;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxVal = Math.max(...data.map(d => d[valueKey] || 0), 1) * 1.1;
    const barCount = data.length;
    const containerWidth = chartWidth / barCount;
    const barWidth = containerWidth * 0.6;

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%' }}>
                <defs>
                    <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="1" />
                        <stop offset="100%" stopColor={color} stopOpacity="0.4" />
                    </linearGradient>
                </defs>

                {/* Y Gridlines */}
                {[0, 0.5, 1].map((ratio, index) => {
                    const y = padding + chartHeight * (1 - ratio);
                    return (
                        <line key={index} x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                    );
                })}

                {/* Draw Bars */}
                {data.map((d, index) => {
                    const x = padding + index * containerWidth + (containerWidth - barWidth) / 2;
                    const val = d[valueKey] || 0;
                    const barHeight = chartHeight * (val / maxVal);
                    const y = height - padding - barHeight;

                    return (
                        <g key={index}>
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={Math.max(barHeight, 4)} // at least 4px visible
                                rx="4"
                                fill="url(#bar-grad)"
                                style={{
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    filter: hoverIndex === index ? 'drop-shadow(0px 0px 8px rgba(99, 102, 241, 0.6))' : 'none'
                                }}
                                onMouseEnter={() => setHoverIndex(index)}
                                onMouseLeave={() => setHoverIndex(null)}
                            />

                            {/* Label */}
                            <text
                                x={x + barWidth / 2}
                                y={height - padding + 16}
                                fill="rgba(255,255,255,0.4)"
                                fontSize="9"
                                fontWeight="700"
                                textAnchor="middle"
                            >
                                {d[labelKey]}
                            </text>

                            {/* Tooltip text display directly above bar if hovered */}
                            {hoverIndex === index && (
                                <g>
                                    <rect x={x + barWidth / 2 - 25} y={y - 25} width="50" height="18" rx="4" fill="rgba(5, 5, 8, 0.95)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
                                    <text
                                        x={x + barWidth / 2}
                                        y={y - 13}
                                        fill="white"
                                        fontSize="9"
                                        fontWeight="800"
                                        textAnchor="middle"
                                    >
                                        {val}
                                    </text>
                                </g>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};
