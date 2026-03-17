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
    // List of colors for dynamic subdomain lines
    const colors = ['#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

    // Identify unique subdomains and process data
    const { chartData, subdomains } = useMemo(() => {
        const MAIN_DOMAIN = 'wilboerht.com';
        
        // Find all unique subdomains in the raw data (e.g., 'blog', 'docs')
        const uniqueSubdomains = Array.from(new Set(
            rawData
                .map(log => log.host?.toLowerCase())
                .filter(h => h?.endsWith(`.${MAIN_DOMAIN}`) && h !== `www.${MAIN_DOMAIN}`)
        )) as string[];

        if (!rawData || rawData.length === 0) {
            return {
                chartData: Array.from({ length: 7 }).map((_, i) => {
                    const data: any = {
                        time: `${String(i * 4).padStart(2, '0')}:00`,
                        total: 0,
                        main: 0
                    };
                    uniqueSubdomains.forEach(sd => data[sd] = 0);
                    return data;
                }),
                subdomains: uniqueSubdomains
            };
        }

        const slots = [0, 4, 8, 12, 16, 20, 24];
        const processedData = slots.map(hour => {
            const timeLabel = `${String(hour === 24 ? 23 : hour).padStart(2, '0')}:${hour === 24 ? '59' : '00'}`;
            
            const bucketLogs = rawData.filter(log => {
                const logDate = new Date(log.created_at);
                return logDate.getHours() <= hour && logDate.getHours() > (hour - 4);
            });

            const countTotal = bucketLogs.length;

            const countMain = bucketLogs.filter(log => {
                const h = log.host?.toLowerCase();
                return h === MAIN_DOMAIN || h === `www.${MAIN_DOMAIN}` || h?.includes('localhost');
            }).length;

            const data: any = {
                time: timeLabel,
                total: countTotal,
                main: countMain,
            };

            // Calculate hits for each specific subdomain
            uniqueSubdomains.forEach(sd => {
                data[sd] = bucketLogs.filter(log => log.host?.toLowerCase() === sd).length;
            });

            return data;
        });

        return { chartData: processedData, subdomains: uniqueSubdomains };
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
                    
                    {/* Render each detected subdomain as a separate line */}
                    {subdomains.map((sd, index) => (
                        <Area 
                            key={sd}
                            name={`子域名: ${sd}`}
                            type="monotone" 
                            dataKey={sd} 
                            stroke={colors[index % colors.length]} 
                            strokeWidth={2}
                            fill="none" 
                            strokeDasharray="5 5"
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
