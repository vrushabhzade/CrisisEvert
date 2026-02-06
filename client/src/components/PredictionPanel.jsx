import React from 'react';
import { TrendingUp, AlertTriangle, Clock, Activity } from 'lucide-react';

export default function PredictionPanel({ predictions, dataMode }) {
    if (!predictions || !predictions.forecast) return null;

    const { forecast, escalation, currentSeverity } = predictions;
    const { forecasts, overallConfidence } = forecast;

    // Severity color mapping
    const severityColors = {
        'EXTREME': 'text-black bg-black/10',
        'HIGH': 'text-red-500 bg-red-500/10',
        'MODERATE': 'text-orange-500 bg-orange-500/10',
        'LOW': 'text-yellow-500 bg-yellow-500/10',
        'SAFE': 'text-green-500 bg-green-500/10'
    };

    return (
        <div className="glass-panel p-4 rounded-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                    <Activity size={16} className="text-crisis-accent mr-2" />
                    <h3 className="text-sm font-mono font-bold text-white">PREDICTIVE ANALYTICS</h3>
                </div>
                {dataMode === 'LIVE' && (
                    <span className="text-[10px] font-mono bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                        LIVE DATA
                    </span>
                )}
            </div>

            {/* Current Severity */}
            <div className="mb-3 pb-3 border-b border-white/10">
                <p className="text-[10px] text-gray-500 font-mono mb-1">CURRENT SEVERITY</p>
                <span className={`text-xs font-bold px-2 py-1 rounded ${severityColors[currentSeverity] || 'text-gray-400'}`}>
                    {currentSeverity}
                </span>
            </div>

            {/* Forecasts */}
            <div className="space-y-2 mb-3">
                <p className="text-[10px] text-gray-500 font-mono mb-2">INTENSITY FORECAST</p>
                {forecasts && forecasts.map((fc, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center">
                            <Clock size={12} className="text-gray-500 mr-2" />
                            <span className="text-gray-400 font-mono">T+{fc.hoursAhead}h</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`font-semibold ${severityColors[fc.intensity]?.split(' ')[0] || 'text-gray-400'}`}>
                                {fc.intensity}
                            </span>
                            {fc.trend === 'INCREASING' && <TrendingUp size={12} className="text-red-400" />}
                            {fc.trend === 'DECREASING' && <TrendingUp size={12} className="text-green-400 rotate-180" />}
                        </div>
                    </div>
                ))}
            </div>

            {/* Confidence Score */}
            <div className="mb-3 pb-3 border-b border-white/10">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-[10px] text-gray-500 font-mono">CONFIDENCE</p>
                    <span className="text-xs text-crisis-accent font-bold">
                        {Math.round(overallConfidence * 100)}%
                    </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                        className="bg-crisis-accent h-2 rounded-full transition-all duration-500"
                        style={{ width: `${overallConfidence * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Escalation Warning */}
            {escalation && escalation.isEscalating && (
                <div className="bg-red-500/10 border border-red-500/30 rounded p-2">
                    <div className="flex items-start">
                        <AlertTriangle size={14} className="text-red-500 mr-2 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-red-400 mb-1">ESCALATION DETECTED</p>
                            <p className="text-[10px] text-gray-400">{escalation.warning}</p>
                            <p className="text-[10px] text-gray-500 mt-1 italic">{escalation.recommendedAction}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Data Points */}
            <div className="mt-3 text-center">
                <p className="text-[9px] text-gray-600 font-mono">
                    Based on {predictions.dataPoints} historical data points
                </p>
            </div>
        </div>
    );
}
