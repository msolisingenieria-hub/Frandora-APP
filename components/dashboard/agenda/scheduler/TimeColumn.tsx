"use client";

import { useEffect, useState } from "react";
import { getHours, getMinutes } from "date-fns";
import { minutesToTop } from "./schedulerUtils";

interface Props {
  hourHeight:  number;
  startHour:   number;
  endHour:     number;
}

export function TimeColumn({ hourHeight, startHour, endHour }: Props) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);
  const totalHeight = (endHour - startHour) * hourHeight;

  const nowMinutes = getHours(now) * 60 + getMinutes(now);
  const showLine   = nowMinutes >= startHour * 60 && nowMinutes <= endHour * 60;
  const lineTop    = minutesToTop(nowMinutes, startHour, hourHeight);

  return (
    <div className="relative w-16 flex-shrink-0" style={{ height: totalHeight }}>
      {hours.map((h) => (
        <div
          key={h}
          className="absolute w-full flex items-center justify-end pr-2"
          style={{ top: (h - startHour) * hourHeight - 8, height: hourHeight }}
        >
          <span className="text-[10px] text-slate-400 font-body select-none">
            {String(h).padStart(2, "0")}:00
          </span>
        </div>
      ))}

      {showLine && (
        <div className="absolute right-0 left-0 z-10 pointer-events-none" style={{ top: lineTop }}>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
            <div className="flex-1 h-px bg-rose-500" />
          </div>
        </div>
      )}
    </div>
  );
}
