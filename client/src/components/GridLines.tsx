interface GridLinesProps {
    timeMarkers: number[];
    timeToPixel: (time: number) => number;
}

export function GridLines({ timeMarkers, timeToPixel }: GridLinesProps) {
    return (
        <div className="absolute inset-0 pointer-events-none">
            {timeMarkers.map((time) => {
                const left = timeToPixel(time);
                return (
                    <div
                        key={`grid-${time}`}
                        className="absolute top-0 bottom-0 w-px bg-gray-100"
                        style={{ left: `${left}px` }}
                    />
                );
            })}
        </div>
    );
}