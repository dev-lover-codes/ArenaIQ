import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgClass: string;
  valueStyle?: React.CSSProperties;
}

export default function StatCard({ title, value, icon, iconBgClass, valueStyle }: StatCardProps) {
  return (
    <div className="arena-card flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="section-heading">{title}</p>
        <span className={`p-1.5 rounded-lg ${iconBgClass}`}>
          {icon}
        </span>
      </div>
      <p className="stat-number" style={valueStyle}>{value}</p>
    </div>
  );
}
