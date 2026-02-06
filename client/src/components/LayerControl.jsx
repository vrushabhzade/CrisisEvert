import React from 'react';
import { Layers, MapPin, Route, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function LayerControl({ layers, onToggle }) {
    const layerConfig = [
        { id: 'threat', icon: AlertTriangle, label: 'Threat Zones', color: 'text-red-400' },
        { id: 'shelters', icon: MapPin, label: 'Shelters', color: 'text-blue-400' },
        { id: 'routes', icon: Route, label: 'Evac Routes', color: 'text-green-400' }
    ];

    return (
        <div className="glass-panel p-3 rounded-xl absolute top-4 right-4 z-10 min-w-[180px]">
            <div className="flex items-center mb-3 pb-2 border-b border-white/10">
                <Layers size={14} className="text-crisis-accent mr-2" />
                <h3 className="text-xs font-mono font-bold text-white">MAP LAYERS</h3>
            </div>

            <div className="space-y-2">
                {layerConfig.map(layer => (
                    <button
                        key={layer.id}
                        onClick={() => onToggle(layer.id)}
                        className={`w-full flex items-center justify-between p-2 rounded transition-colors ${layers[layer.id]
                                ? 'bg-white/10 hover:bg-white/15'
                                : 'bg-black/20 hover:bg-black/30'
                            }`}
                    >
                        <div className="flex items-center">
                            <layer.icon size={14} className={`mr-2 ${layer.color}`} />
                            <span className="text-xs text-gray-300">{layer.label}</span>
                        </div>
                        {layers[layer.id] ? (
                            <Eye size={12} className="text-crisis-accent" />
                        ) : (
                            <EyeOff size={12} className="text-gray-500" />
                        )}
                    </button>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-[9px] font-mono text-gray-500 mb-2">SEVERITY</p>
                <div className="space-y-1">
                    <div className="flex items-center text-[9px]">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-gray-400">Safe</span>
                    </div>
                    <div className="flex items-center text-[9px]">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        <span className="text-gray-400">Caution</span>
                    </div>
                    <div className="flex items-center text-[9px]">
                        <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                        <span className="text-gray-400">Warning</span>
                    </div>
                    <div className="flex items-center text-[9px]">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                        <span className="text-gray-400">Danger</span>
                    </div>
                    <div className="flex items-center text-[9px]">
                        <div className="w-3 h-3 rounded-full bg-black mr-2 border border-white/30"></div>
                        <span className="text-gray-400">Extreme</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
