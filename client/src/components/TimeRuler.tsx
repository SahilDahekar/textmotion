
interface TimeRulerProps {
    timeMarkers: number[];
    timeToPixel: (time: number) => number;
}

export function TimeRuler({ timeMarkers, timeToPixel }: TimeRulerProps) {
    return (
        <div className="relative h-8 bg-white border-b border-gray-200 mb-2">
            {timeMarkers.map((time) => {
                const left = timeToPixel(time);
                return (
                    <div
                        key={time}
                        className="absolute top-0 h-full flex flex-col items-center"
                        style={{ left: `${left}px`, transform: 'translateX(-50%)' }}
                    >
                        <div className="w-px h-4 bg-gray-400 mt-auto" />
                        <span className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                            {time}s
                        </span>
                    </div>
                );
            })}
        </div>
    );
}