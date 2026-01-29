'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface RiskLevel {
    name: string;
    color: string;
    min: number;
    max: number;
}

import { RiskConfiguration } from '@/types/risk-configuration';

interface RiskMatrixCanvasProps {
    width?: number;
    height?: number;
    showScores?: boolean;
    activeConfiguration: RiskConfiguration;
    onCellClick?: (
        likelihood: number,
        consequence: number,
        score: number,
    ) => void;
    className?: string;
}

interface TooltipInfo {
    visible: boolean;
    likelihood: number;
    consequence: number;
    score: number;
    riskLevel: RiskLevel | null;
}

interface CellInfo {
    likelihood: number;
    consequence: number;
    score: number;
    riskLevel: RiskLevel | null;
}

export default function RiskMatrixCanvas({
    width = 600,
    height = 600,
    showScores = true,
    activeConfiguration,
    onCellClick,
    className = '',
}: RiskMatrixCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [tooltipInfo, setTooltipInfo] = useState<TooltipInfo>({
        visible: false,
        likelihood: 0,
        consequence: 0,
        score: 0,
        riskLevel: null,
    });
    const cellInfoCache = useRef<Map<string, CellInfo>>(new Map());
    const tooltipRef = useRef<HTMLDivElement>(null);
    const currentCellKey = useRef<string | null>(null);
    const [canvasSize, setCanvasSize] = useState({ width, height });

    // Extract dimensions from impacts and probabilities arrays
    const rows = activeConfiguration.probabilities.length;
    const columns = activeConfiguration.impacts.length;
    
    // Calculate maxScore using multiplication (likelihood * consequence)
    const maxScore = rows * columns;

    // Responsive canvas sizing
    const updateCanvasSize = useCallback(() => {
        if (containerRef.current) {
            const containerWidth = containerRef.current.offsetWidth;
            const maxWidth = Math.min(containerWidth - 32, 800); // 32px for padding
            const minWidth = 320;
            const responsiveWidth = Math.max(minWidth, maxWidth);
            const responsiveHeight = responsiveWidth;

            setCanvasSize({
                width: responsiveWidth,
                height: responsiveHeight,
            });
        }
    }, []);

    useEffect(() => {
        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);
        return () => window.removeEventListener('resize', updateCanvasSize);
    }, [updateCanvasSize]);

    // Convert activeConfiguration score_levels to RiskLevel format
    const riskLevels: RiskLevel[] = (activeConfiguration.score_levels || [])
        .sort((a, b) => a.order - b.order)
        .map(level => ({
            name: level.label,
            color: level.color,
            min: level.min,
            max: level.max,
        }));

    const getRiskLevelForScore = (score: number): RiskLevel | null => {
        // For non-overlapping intervals, find the exact level that contains the score
        // Use the original score_levels for proper ordering
        const sortedScoreLevels = [...(activeConfiguration.score_levels || [])].sort((a, b) => a.order - b.order);
        
        // Find the level that contains this score
        const matchingLevel = sortedScoreLevels.find(level => 
            score >= level.min && score <= level.max
        );
        
        if (matchingLevel) {
            return {
                name: matchingLevel.label,
                color: matchingLevel.color,
                min: matchingLevel.min,
                max: matchingLevel.max,
            };
        }
        
        return null;
    };

    const calculateScore = (likelihood: number, consequence: number): number => {
        // Always use multiplication (likelihood * consequence)
        return likelihood * consequence;
    };

    const getCellInfo = (likelihood: number, consequence: number): CellInfo => {
        const key = `${likelihood}-${consequence}`;
        let cellInfo = cellInfoCache.current.get(key);

        if (!cellInfo) {
            const score = calculateScore(likelihood, consequence);
            const riskLevel = getRiskLevelForScore(score);
            cellInfo = { likelihood, consequence, score, riskLevel };
            cellInfoCache.current.set(key, cellInfo);
        }

        return cellInfo;
    };

    const getLikelihoodLabel = (likelihood: number): string => {
        const probability = activeConfiguration.probabilities.find(p => parseFloat(p.score) === likelihood);
        return probability?.label || `Level ${likelihood}`;
    };

    const getConsequenceLabel = (consequence: number): string => {
        const impact = activeConfiguration.impacts.find(i => parseFloat(i.score) === consequence);
        return impact?.label || `Level ${consequence}`;
    };

    const updateTooltipPosition = (x: number, y: number) => {
        if (tooltipRef.current) {
            const transform = `translate3d(${x + 10}px, ${y - 60}px, 0)`;
            tooltipRef.current.style.transform = transform;
        }
    };

    const showTooltip = (x: number, y: number) => {
        if (tooltipRef.current) {
            tooltipRef.current.style.left = `${x + 10}px`;
            tooltipRef.current.style.top = `${y - 60}px`;
            tooltipRef.current.style.display = 'block';
        }
    };

    const hideTooltip = () => {
        if (tooltipRef.current) {
            tooltipRef.current.style.display = 'none';
        }
    };

    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Update tooltip position and show it
        showTooltip(event.clientX, event.clientY);

        // Scale coordinates to canvas size
        const canvasX = (x / rect.width) * width;
        const canvasY = (y / rect.height) * height;

        const cellWidth = width / columns;
        const cellHeight = height / rows;

        const col = Math.floor(canvasX / cellWidth);
        const row = Math.floor(canvasY / cellHeight);

        // Check if mouse is within canvas bounds
        if (col >= 0 && col < columns && row >= 0 && row < rows) {
            const likelihood = rows - row;
            const consequence = col + 1;
            const cellKey = `${likelihood}-${consequence}`;

            // Only update React state when cell actually changes
            if (currentCellKey.current !== cellKey) {
                currentCellKey.current = cellKey;
                const cellInfo = getCellInfo(likelihood, consequence);

                setTooltipInfo({
                    visible: true,
                    likelihood: cellInfo.likelihood,
                    consequence: cellInfo.consequence,
                    score: cellInfo.score,
                    riskLevel: cellInfo.riskLevel,
                });
            }
        } else {
            if (currentCellKey.current !== null) {
                currentCellKey.current = null;
                setTooltipInfo((prev) => ({ ...prev, visible: false }));
            }
        }
    };

    const handleMouseLeave = () => {
        currentCellKey.current = null;
        setTooltipInfo((prev) => ({ ...prev, visible: false }));
        hideTooltip();
    };

    const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas || !onCellClick) return;

        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Scale coordinates to canvas size
        const canvasX = (x / rect.width) * canvasSize.width;
        const canvasY = (y / rect.height) * canvasSize.height;

        const cellWidth = canvasSize.width / columns;
        const cellHeight = canvasSize.height / rows;

        const col = Math.floor(canvasX / cellWidth);
        const row = Math.floor(canvasY / cellHeight);

        // Check if click is within canvas bounds
        if (col >= 0 && col < columns && row >= 0 && row < rows) {
            const likelihood = rows - row;
            const consequence = col + 1;
            const score = calculateScore(likelihood, consequence);

            onCellClick(likelihood, consequence, score);
        }
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width: canvasWidth, height: canvasHeight } = canvasSize;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        const cellWidth = canvasWidth / columns;
        const cellHeight = canvasHeight / rows;

        const interpolateColor = (
            color1: string,
            color2: string,
            t: number,
        ): string => {
            const r1 = Number.parseInt(color1.slice(1, 3), 16);
            const g1 = Number.parseInt(color1.slice(3, 5), 16);
            const b1 = Number.parseInt(color1.slice(5, 7), 16);

            const r2 = Number.parseInt(color2.slice(1, 3), 16);
            const g2 = Number.parseInt(color2.slice(3, 5), 16);
            const b2 = Number.parseInt(color2.slice(5, 7), 16);

            const r = Math.round(r1 + (r2 - r1) * t);
            const g = Math.round(g1 + (g2 - g1) * t);
            const b = Math.round(b1 + (b2 - b1) * t);

            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        };

        const getColorForScore = (score: number): string => {
            // Find which risk levels this score falls between
            for (let i = 0; i < riskLevels.length; i++) {
                const level = riskLevels[i];

                if (score >= level.min && score <= level.max) {
                    // Interpolate within this level
                    const levelProgress =
                        (score - level.min) / (level.max - level.min);

                    if (i < riskLevels.length - 1) {
                        // Interpolate between current and next level color
                        return interpolateColor(
                            level.color,
                            riskLevels[i + 1].color,
                            levelProgress,
                        );
                    } else {
                        return level.color;
                    }
                }
            }

            return riskLevels[0].color;
        };

        const imageData = ctx.createImageData(canvasWidth, canvasHeight);
        const data = imageData.data;

        for (let py = 0; py < canvasHeight; py++) {
            for (let px = 0; px < canvasWidth; px++) {
                // Calculate which cell this pixel belongs to
                const col = Math.floor(px / cellWidth);
                const row = Math.floor(py / cellHeight);

                // Calculate position within the cell (0-1)
                const cellX = (px % cellWidth) / cellWidth;
                const cellY = (py % cellHeight) / cellHeight;

                // Get scores for the four corners of the current cell
                const likelihood = rows - row;
                const consequence = col + 1;
                const score = calculateScore(likelihood, consequence);

                // Get scores for neighboring cells for interpolation
                const likelihoodNext = Math.max(1, rows - row - 1);
                const consequenceNext = Math.min(columns, col + 2);

                const scoreTopLeft = score;
                const scoreTopRight = calculateScore(likelihood, consequenceNext);
                const scoreBottomLeft = calculateScore(likelihoodNext, consequence);
                const scoreBottomRight = calculateScore(likelihoodNext, consequenceNext);

                // Bilinear interpolation of scores
                const scoreTop =
                    scoreTopLeft + (scoreTopRight - scoreTopLeft) * cellX;
                const scoreBottom =
                    scoreBottomLeft +
                    (scoreBottomRight - scoreBottomLeft) * cellX;
                const interpolatedScore =
                    scoreTop + (scoreBottom - scoreTop) * cellY;

                // Get color for interpolated score
                const color = getColorForScore(interpolatedScore);

                // Parse hex color to RGB
                const r = Number.parseInt(color.slice(1, 3), 16);
                const g = Number.parseInt(color.slice(3, 5), 16);
                const b = Number.parseInt(color.slice(5, 7), 16);

                // Set pixel color
                const index = (py * canvasWidth + px) * 4;
                data[index] = r;
                data[index + 1] = g;
                data[index + 2] = b;
                data[index + 3] = 255;
            }
        }

        ctx.putImageData(imageData, 0, 0);

        // Draw grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 2;

        for (let i = 1; i < columns; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellWidth, 0);
            ctx.lineTo(i * cellWidth, canvasHeight);
            ctx.stroke();
        }

        for (let i = 1; i < rows; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * cellHeight);
            ctx.lineTo(canvasWidth, i * cellHeight);
            ctx.stroke();
        }

        if (showScores) {
            // Responsive font sizing based on cell dimensions
            const baseFontSize = Math.max(
                8,
                Math.min(Math.min(cellWidth / 4, cellHeight / 4), 32),
            );
            const fontSize = Math.max(
                baseFontSize,
                canvasWidth < 400 ? 10 : 12,
            );
            ctx.font = `600 ${fontSize}px "Inter", "SF Pro Display", "Segoe UI", system-ui, -apple-system, sans-serif`;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';
            ctx.shadowBlur = Math.max(2, fontSize / 4);
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < columns; col++) {
                    const likelihood = rows - row;
                    const consequence = col + 1;
                    const score = calculateScore(likelihood, consequence);

                    const x = col * cellWidth + cellWidth / 2;
                    const y = row * cellHeight + cellHeight / 2;

                    ctx.fillText(score.toString(), x, y);
                }
            }

            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }

        // Draw axis labels with responsive typography
        const labelFontSize = Math.max(14, Math.min(canvasWidth / 30, 24));
        ctx.font = `600 ${labelFontSize}px "Inter", "SF Pro Display", "Segoe UI", system-ui, -apple-system, sans-serif`;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = Math.max(2, labelFontSize / 6);
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        const labelOffset = Math.max(15, labelFontSize);

        ctx.save();
        ctx.translate(labelOffset, canvasHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Likelihood', 0, 0);
        ctx.restore();

        ctx.fillText(
            'Consequence',
            canvasWidth / 2,
            canvasHeight - labelOffset,
        );

        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }, [
        rows,
        columns,
        canvasSize.width,
        canvasSize.height,
        maxScore,
        riskLevels,
        showScores,
    ]);

    // Clear cache when matrix dimensions change
    useEffect(() => {
        cellInfoCache.current.clear();
    }, [rows, columns, riskLevels]);

    return (
        <div
            className={`flex flex-col items-center gap-4 px-4 py-2 ${className}`}
        >
            <div className="space-y-2 text-center">
                <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                    {activeConfiguration.name} ({rows}×{columns})
                </h1>
                <p className="text-sm font-medium text-muted-foreground sm:text-base">
                    {riskLevels.length} Risk Levels | Score Range: 1-{maxScore}
                </p>
            </div>

            <div ref={containerRef} className="w-full max-w-4xl">
                <div className="relative flex justify-center">
                    <canvas
                        ref={canvasRef}
                        width={canvasSize.width}
                        height={canvasSize.height}
                        className="h-auto max-w-full cursor-pointer rounded-lg border-2 border-border"
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        onClick={handleClick}
                        style={{
                            maxWidth: '100%',
                            height: 'auto',
                            aspectRatio: '1',
                        }}
                    />
                    <div
                        ref={tooltipRef}
                        className="pointer-events-none fixed z-50 rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md sm:px-3 sm:py-2 sm:text-sm"
                        style={{
                            display: 'none',
                            position: 'fixed',
                            zIndex: 9999,
                        }}
                    >
                        <div className="space-y-1">
                            <div className="font-medium">
                                Risk Level:{' '}
                                {tooltipInfo.riskLevel?.name || 'Unknown'}
                            </div>
                            <div className="hidden sm:block">
                                Likelihood: {tooltipInfo.likelihood} (
                                {getLikelihoodLabel(tooltipInfo.likelihood)})
                            </div>
                            <div className="hidden sm:block">
                                Consequence: {tooltipInfo.consequence} (
                                {getConsequenceLabel(tooltipInfo.consequence)})
                            </div>
                            <div className="sm:hidden">
                                L:{tooltipInfo.likelihood} C:
                                {tooltipInfo.consequence}
                            </div>
                            <div>Score: {tooltipInfo.score}</div>
                            {tooltipInfo.riskLevel && (
                                <div className="flex items-center gap-2 border-t pt-1">
                                    <div
                                        className="h-2 w-2 rounded sm:h-3 sm:w-3"
                                        style={{
                                            backgroundColor:
                                                tooltipInfo.riskLevel.color,
                                        }}
                                    />
                                    <span className="text-xs">
                                        Range: {tooltipInfo.riskLevel.min}-
                                        {tooltipInfo.riskLevel.max}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-4xl">
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
                    {riskLevels.map((level) => (
                        <div
                            key={level.name}
                            className="flex min-w-0 flex-shrink-0 items-center gap-1.5 rounded-md bg-background/50 px-2 py-1.5 text-center shadow-sm ring-1 ring-border sm:gap-2 sm:px-3 sm:py-2"
                        >
                            <div
                                className="h-3 w-3 flex-shrink-0 rounded-full sm:h-4 sm:w-4"
                                style={{ backgroundColor: level.color }}
                            />
                            <span className="min-w-0 text-xs font-medium tracking-wide sm:text-sm">
                                <span className="block truncate sm:inline">
                                    {level.name}
                                </span>
                                <span className="block text-xs text-muted-foreground sm:ml-1 sm:inline">
                                    ({level.min}-{level.max})
                                </span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}