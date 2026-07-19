import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgClass: string;
  valueStyle?: React.CSSProperties;
  trend?: string;
}

export default function StatCard({ title, value, icon, iconBgClass, valueStyle, trend }: StatCardProps) {
  return (
    <div className="arena-card flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="section-heading">{title}</p>
        <span className={`p-1.5 rounded-lg ${iconBgClass}`}>
          {icon}
        </span>
      </div>
      <p className="stat-number" style={valueStyle}>{value}</p>
      {trend && <p className="text-xs text-slate-400 mt-1">{trend}</p>}
    </div>
  );
}
