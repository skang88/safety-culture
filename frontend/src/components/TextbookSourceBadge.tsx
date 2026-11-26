"use client";

import React from "react";
import { BookOpen, Scale, Target, Sparkles } from "lucide-react";

interface TextbookSourceBadgeProps {
  chapter: string;
  title: string;
  law?: string;
  kpi?: string;
  isResearcherAdded?: boolean;
}

export default function TextbookSourceBadge({
  chapter,
  title,
  law,
  kpi,
  isResearcherAdded = false,
}: TextbookSourceBadgeProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-extrabold">
          <BookOpen className="w-3.5 h-3.5" />
          교재 출처: {chapter}
        </span>
        {isResearcherAdded && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
            <Sparkles className="w-3 h-3" />
            연구자 추가 확장 포함
          </span>
        )}
        <span className="text-xs font-bold text-slate-800">{title}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        {kpi && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
            <Target className="w-3 h-3 text-emerald-600" />
            KPI: {kpi}
          </span>
        )}
        {law && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
            <Scale className="w-3 h-3 text-amber-600" />
            법령: {law}
          </span>
        )}
      </div>
    </div>
  );
}
