import React, { useState } from 'react';
import { Truck, ShieldCheck, Plane } from 'lucide-react';

export default function ResponseConsole() {
    const [log, setLog] = useState([]);

    const dispatch = (type) => {
        const entry = {
            id: Date.now(),
            type,
            time: new Date().toLocaleTimeString(),
            status: 'DISPATCHED'
        };
        setLog(prev => [entry, ...prev]);
    };

    return (
        <div className="glass-panel p-4 rounded-xl flex flex-col h-full">
            <h2 className="text-lg font-mono mb-4 flex items-center text-crisis-accent">
                <ShieldCheck size={16} className="mr-2" /> RESPONSE CONSOLE ("The Hand")
            </h2>

            <div className="grid grid-cols-3 gap-2 mb-4">
                <button onClick={() => dispatch('LOGISTICS')}
                    className="p-3 bg-blue-900/40 border border-blue-500/30 hover:bg-blue-500/20 rounded flex flex-col items-center transition-all group">
                    <Truck className="mb-1 text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] md:text-xs font-mono mt-1">SUPPLY</span>
                </button>
                <button onClick={() => dispatch('MEDICAL')}
                    className="p-3 bg-green-900/40 border border-green-500/30 hover:bg-green-500/20 rounded flex flex-col items-center transition-all group">
                    <Truck className="mb-1 text-green-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] md:text-xs font-mono mt-1">MEDICAL</span>
                </button>
                <button onClick={() => dispatch('AERIAL')}
                    className="p-3 bg-red-900/40 border border-red-500/30 hover:bg-red-500/20 rounded flex flex-col items-center transition-all group">
                    <Plane className="mb-1 text-red-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] md:text-xs font-mono mt-1">AERIAL</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20 rounded p-2 min-h-[100px]">
                {log.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center mt-4 italic">No units currently active.</p>
                ) : log.map(entry => (
                    <div key={entry.id} className="flex justify-between items-center text-xs font-mono mb-2 border-b border-white/5 pb-1 animate-fade-in">
                        <span className="text-crisis-accent">[{entry.time}]</span>
                        <span className="text-gray-300">{entry.type} UNIT</span>
                        <span className="text-green-400 font-bold">{entry.status}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
