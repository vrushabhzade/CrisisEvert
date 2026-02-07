import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, ShieldCheck, MapPin, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function UserStatusPanel({ currentThreat }) {
    const { user, updateStatus } = useAuth();
    const [distance, setDistance] = useState(null);
    const [riskLevel, setRiskLevel] = useState('SAFE');
    const [isMarkingSafe, setIsMarkingSafe] = useState(false);

    // Calculate risk when threat changes
    useEffect(() => {
        if (!user || !user.location || !currentThreat) {
            setRiskLevel('SAFE');
            setDistance(null);
            return;
        }

        const userLat = user.location.lat;
        const userLon = user.location.lon;

        // Parse threat coords
        let threatLat, threatLon;
        if (typeof currentThreat.location.coords === 'string') {
            threatLat = parseFloat(currentThreat.location.coords.split('°')[0]);
            threatLon = parseFloat(currentThreat.location.coords.split(',')[1].split('°')[0]);
        } else {
            // Fallback or handle object format
            return;
        }

        const dist = getDistanceFromLatLonInKm(userLat, userLon, threatLat, threatLon);
        setDistance(dist);

        const impactRadiusKm = (currentThreat.impactRadius || 10000) / 1000;

        if (dist <= impactRadiusKm) {
            setRiskLevel('DANGER');
            // Auto-update status to DANGER if not already
            if (user.status !== 'DANGER' && user.status !== 'SAFE') {
                updateStatus('DANGER');
            }
        } else if (dist <= impactRadiusKm * 2) {
            setRiskLevel('CAUTION');
        } else {
            setRiskLevel('SAFE');
        }

    }, [currentThreat, user]);

    const handleMarkSafe = async () => {
        setIsMarkingSafe(true);
        await updateStatus('SAFE');
        setTimeout(() => setIsMarkingSafe(false), 2000);
    };

    if (!user) return null;

    // Helper: Haversine
    function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    const getStatusColor = () => {
        if (riskLevel === 'DANGER') return 'bg-red-500 text-white';
        if (riskLevel === 'CAUTION') return 'bg-yellow-500 text-black';
        return 'bg-green-500 text-white';
    };

    const getStatusIcon = () => {
        if (riskLevel === 'DANGER') return <ShieldAlert size={24} />;
        if (riskLevel === 'CAUTION') return <Shield size={24} />;
        return <ShieldCheck size={24} />;
    };

    return (
        <div className="glass-panel p-4 rounded-xl mb-4">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        {user.name}
                    </h3>
                    <p className="text-xs text-gray-400 flex items-center mt-1">
                        <MapPin size={10} className="mr-1" />
                        {user.location.lat ? `${user.location.lat.toFixed(2)}, ${user.location.lon.toFixed(2)}` : 'Location Pending'}
                    </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 ${getStatusColor()}`}>
                    {getStatusIcon()}
                    {riskLevel}
                </div>
            </div>

            {currentThreat && distance !== null && (
                <div className="mb-4 text-sm text-gray-300 bg-white/5 p-3 rounded-lg">
                    You are <span className="font-bold text-white">{distance.toFixed(1)} km</span> from the {currentThreat.type.toLowerCase()}.
                    {riskLevel === 'DANGER' && (
                        <p className="text-red-400 font-bold mt-1">⚠️ YOU ARE IN THE IMPACT ZONE</p>
                    )}
                </div>
            )}

            <button
                onClick={handleMarkSafe}
                disabled={user.status === 'SAFE' || isMarkingSafe}
                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${user.status === 'SAFE'
                        ? 'bg-green-600/50 text-green-200 cursor-default'
                        : 'bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20 active:scale-95'
                    }`}
            >
                {user.status === 'SAFE' ? (
                    <>
                        <CheckCircle size={20} />
                        MARKED AS SAFE
                    </>
                ) : (
                    <>
                        <CheckCircle size={20} />
                        MARK I'M SAFE
                    </>
                )}
            </button>
            <p className="text-[10px] text-gray-500 text-center mt-2">
                Updating status will notify your emergency contacts.
            </p>
        </div>
    );
}
