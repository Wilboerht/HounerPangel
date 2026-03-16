"use client";

import React, { useMemo } from 'react';
import { 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

interface TrafficChartProps {
    rawData?: any[];
}

export default function TrafficChart({ rawData = [] }: TrafficChartProps) {
    // Process raw logs into 24-hour time slots
    const chartData = useMemo(() => {
        if (!rawData || rawData.length === 0) {
            // Return empty baseline if no data
            return Array.from({ length: 7 }).map((_, i) => ({
                time: `${String(i * 4).padStart(2, '0')}:00`,
                total: 0,
                main: 0,
                research: 0
            }));
        }

        // Grouping logic (simplified for 4-hour slots)
        const slots = [0, 4, 8, 12, 16, 20, 24];
        return slots.map(hour => {
            const timeLabel = `${String(hour === 24 ? 23 : hour).padStart(2, '0')}:${hour === 24 ? '59' : '00'}`;
            const limit = new Date();
            limit.setHours(hour, 0, 0, 0);

            // In a real app, you'd filter logs that fall into this time bucket
            // For now, we count logs matching the host
            const countTotal = rawData.filter(log => {
                const logDate = new Date(log.created_at);
                return logDate.getHours() <= hour && logDate.getHours() > (hour - 4);
            }).length;

            const countMain = rawData.filter(log => {
                const logDate = new Date(log.created_at);
                return (logDate.getHours() <= hour && logDate.getHours() > (hour - 4)) && 
                       (!log.url.startsWith('/research'));
            }).length;

            const countResearch = countTotal - countMain;

            return {
                time: timeLabel,
                total: countTotal,
                main: countMain,
                research: countResearch
            };
        });
    }, [rawData]);

    return (
        <div className="w-full">
            <ResponsiveContainer width="100%" height={340}>
                <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#18181b" stopOpacity={0.05}/>
                            <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.05}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid 
                        strokeDasharray="3 3" 
                        vertical={false} 
                        stroke="#f1f1f1" 
                    />
                    <XAxis 
                        dataKey="time" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#a1a1aa', fontWeight: 600 }}
                        dy={10}
                    />
                    <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#a1a1aa', fontWeight: 600 }}
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '16px',
                            border: '1px solid rgba(0,0,0,0.04)',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
                            fontSize: '12px',
                            fontWeight: '600',
                            padding: '12px'
                        }}
                    />
                    <Area 
                        name="总访问量"
                        type="monotone" 
                        dataKey="total" 
                        stroke="#18181b" 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#colorTotal)" 
                        animationDuration={1500}
                    />
                    <Area 
                        name="主域名"
                        type="monotone" 
                        dataKey="main" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorMain)" 
                        animationDuration={2000}
                    />
                    <Area 
                        name="子项目"
                        type="monotone" 
                        dataKey="research" 
                        stroke="#6366f1" 
                        strokeWidth={2}
                        fill="none" 
                        strokeDasharray="5 5"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
