import React, { useEffect, useState } from "react";
import { fetchWeeklyTabUsage } from "../../../services/api";
import { useAuth } from "../../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import ExportButton from "../common/ExportButton";
import { exportTabUsageAsCSV, exportTabUsageAsJSON } from "../../../utils/exportUtils";

const TabUsageAnalytics: React.FC = () => {
    const { user } = useAuth();
    const [tabUsage, setTabUsage] = useState<{ date: string; domains: { domain: string; seconds: number }[] }[]>([]);
    const [selectedDay, setSelectedDay] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;
        fetchWeeklyTabUsage(user.token).then(res => {
            setTabUsage(res.data || []);
            if (res.data && res.data.length > 0) setSelectedDay(res.data[res.data.length - 1].date);
        });
    }, [user]);

    const weeklyData = tabUsage.map(day => ({
        date: day.date,
        totalSeconds: day.domains.reduce((sum, d) => sum + d.seconds, 0),
    }));

    const todayData = weeklyData.length ? weeklyData[weeklyData.length - 1] : null;
    const selectedPresence = weeklyData.find(d => d.date === selectedDay);
    const selectedTabUsage = tabUsage.find(d => d.date === selectedDay);

    const weeklyAverage = weeklyData.length > 0 
        ? weeklyData.reduce((sum, day) => sum + day.totalSeconds, 0) / weeklyData.length 
        : 0;

    function formatDuration(seconds: number) {
        const hrs = Math.floor(seconds / 3600);
        const min = Math.floor((seconds % 3600) / 60);
        if (hrs > 0) return `${hrs} hr${hrs > 1 ? "s" : ""}${min > 0 ? ` ${min} min` : ""}`;
        return `${min} min`;
    }

    if (!tabUsage.length) {
        return (
            <div className="text-center py-8">
                <div className="text-gray-500">Loading weekly analytics...</div>
            </div>
        );
    }

    const selectedSeconds = selectedPresence?.totalSeconds || 0;
    const progressPercentage = weeklyAverage > 0 ? Math.min((selectedSeconds / weeklyAverage) * 100, 100) : 0;
    const isAboveAverage = selectedSeconds > weeklyAverage;

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-700">
                        {selectedDay === todayData?.date ? "Today" : new Date(selectedDay || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="text-sm text-gray-600">
                        {formatDuration(selectedSeconds)}
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                                isAboveAverage ? 'bg-blue-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${Math.max(progressPercentage, 5)}%` }}
                        ></div>
                    </div>
                    {/* Average line marker */}
                    <div className="absolute top-0 left-0 w-full h-2 pointer-events-none">
                        <div 
                            className="absolute top-0 w-0.5 h-2 bg-orange-400"
                            style={{ left: '100%' }}
                        ></div>
                    </div>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">0</span>
                    <span className="text-xs text-orange-600">Weekly Avg {formatDuration(weeklyAverage)}</span>
                    <span className={`text-xs font-medium ${isAboveAverage ? 'text-blue-600' : 'text-gray-500'}`}>
                        {isAboveAverage ? `+${Math.round(((selectedSeconds - weeklyAverage) / weeklyAverage) * 100)}%` : 
                         selectedSeconds > 0 ? `${Math.round((selectedSeconds / weeklyAverage) * 100)}%` : '0%'}
                    </span>
                </div>
            </div>

            {/* Weekly Tab Usage Chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-700">Weekly Tab Usage</h3>
                    <div className="flex items-center space-x-2">
                        <ExportButton
                            onExportCSV={() => exportTabUsageAsCSV(tabUsage)}
                            onExportJSON={() => exportTabUsageAsJSON(tabUsage)}
                            label="Export"
                            variant="secondary"
                            size="sm"
                        />
                    </div>
                </div>
                <div className="mb-2">
                    <span className="text-xs text-gray-500">Click bars to view details</span>
                </div>
                
                <ResponsiveContainer width="100%" height={180}>
                    <BarChart
                        data={weeklyData.map(d => ({
                            ...d,
                            hours: +(d.totalSeconds / 3600).toFixed(2),
                        }))}
                        onClick={state => {
                            if (state && state.activeLabel) setSelectedDay(state.activeLabel);
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        />
                        <YAxis 
                            label={{ value: "Hours", angle: -90, position: "insideLeft" }}
                            tick={{ fontSize: 11 }}
                            width={35}
                        />
                        <Tooltip 
                            formatter={(value: any) => [`${value} hrs`, 'Online Time']}
                            labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                month: 'short', 
                                day: 'numeric' 
                            })}
                        />
                        <Bar 
                            dataKey="hours" 
                            fill="#3182ce"
                            radius={[2, 2, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Daily Tab Usage */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-700 mb-3">
                    {selectedDay === todayData?.date ? "Today's" : `${new Date(selectedDay || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}'s`} Tab Usage
                </h3>
                
                <div className="space-y-2">
                    {selectedTabUsage?.domains?.length ? (
                        selectedTabUsage.domains
                            .sort((a, b) => b.seconds - a.seconds)
                            .slice(0, selectedTabUsage.domains?.length)
                            .map((tab, index) => (
                                <div key={tab.domain} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                            index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                            index === 1 ? 'bg-gray-100 text-gray-700' :
                                            index === 2 ? 'bg-orange-100 text-orange-700' :
                                            'bg-blue-50 text-blue-600'
                                        }`}>
                                            {index + 1}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 text-sm">{tab.domain}</div>
                                            <div className="text-xs text-gray-500">
                                                {((tab.seconds / (selectedPresence?.totalSeconds || 1)) * 100).toFixed(1)}% of total time
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-medium text-gray-700">
                                        {formatDuration(tab.seconds)}
                                    </div>
                                </div>
                            ))
                    ) : (
                        <div className="text-center py-6 text-gray-400">
                            <div className="text-sm">No tab usage data for this day</div>
                        </div>
                    )}
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                    <span className="text-xs text-gray-500">
                        Total online time: {formatDuration(selectedPresence?.totalSeconds || 0)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default TabUsageAnalytics;