import React from 'react';
import { Clock, Flame, Globe2, Wind } from 'lucide-react';
import { GEOLOGICAL_ERAS } from '../data/geologicalEras';
import { GeologicalEraId } from '../types/atlas';

interface GeologicalTimelineProps {
  selectedEra: GeologicalEraId;
  onSelectEra: (era: GeologicalEraId) => void;
}

export const GeologicalTimeline: React.FC<GeologicalTimelineProps> = ({
  selectedEra,
  onSelectEra,
}) => {
  const currentEra =
    GEOLOGICAL_ERAS.find((e) => e.id === selectedEra) || GEOLOGICAL_ERAS[0];

  return (
    <section
      aria-label="Geological Time Machine Scrubber"
      className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200">
            Deep-Time Geological Scrubber (541 Million Years Ago → Today)
          </h2>
        </div>
        <span className="text-xs text-emerald-400 font-semibold">
          Active Epoch: {currentEra.name} ({currentEra.periodSpan})
        </span>
      </div>

      {/* Horizontal Era Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5">
        {GEOLOGICAL_ERAS.map((era) => {
          const isSelected = era.id === selectedEra;
          return (
            <button
              key={era.id}
              type="button"
              onClick={() => onSelectEra(era.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-bold shadow-lg scale-105'
                  : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              <div>{era.name}</div>
              <div
                className={`text-[10px] ${
                  isSelected ? 'text-slate-900 font-semibold' : 'text-slate-400'
                }`}
              >
                {era.myaNumeric > 0 ? `${era.myaNumeric} MYA` : 'Present / All'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Paleo-Earth Telemetry Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 pt-1">
        <div className="md:col-span-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-200">
          <span className="font-bold text-amber-300">{currentEra.name}: </span>
          {currentEra.kidDescription}
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs flex items-center gap-2">
          <Wind className="w-4 h-4 text-sky-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400">Atmospheric Oxygen</div>
            <div className="font-bold text-sky-300">{currentEra.oxygenPercent}</div>
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-400 shrink-0" />
          <div>
            <div className="text-[10px] text-slate-400">
              Global Temp &amp; Continents
            </div>
            <div className="font-bold text-orange-300 flex items-center gap-1">
              <Globe2 className="w-3 h-3" />
              {currentEra.globalTempAvgC}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
