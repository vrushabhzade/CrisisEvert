import React, { useEffect, useState, useMemo } from 'react';
import io from 'socket.io-client';
import { GoogleMap, useJsApiLoader, Marker, Circle, Polyline, InfoWindow } from '@react-google-maps/api';
import { Activity, ShieldAlert, Wind, CloudRain, MessageSquare, Map as MapIcon, Target, Brain, Radio, CheckCircle, FileText, Zap, Bell, Volume2, VolumeX, Mic, MicOff, User, LogOut } from 'lucide-react';
import ResponseConsole from './ResponseConsole';
import LayerControl from './LayerControl';
import TimelineSlider from './TimelineSlider';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import UserStatusPanel from './UserStatusPanel';

const socket = io('http://localhost:3005');
// Production: const socket = io('https://crisisavert-backend.onrender.com');


const MAP_CONTAINER_STYLE = {
    width: '100%',
    height: '100%',
    borderRadius: '0.75rem',
};

const MAP_OPTIONS = {
    disableDefaultUI: true,
    mapTypeId: 'satellite',
    styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#d59563" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#38414e" }] },
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#17263c" }] }
    ]
};

// Phase Visualization Component
const PhaseDisplay = ({ currentPhase }) => {
    const phases = [
        { id: 'PHASE 1: DETECTION & MONITORING', label: 'MONITOR', color: 'text-crisis-success' },
        { id: 'PHASE 2: THREAT ASSESSMENT', label: 'ASSESS', color: 'text-crisis-warning' },
        { id: 'PHASE 3: RESPONSE PLANNING', label: 'PLAN', color: 'text-alert' },
        { id: 'PHASE 4: EXECUTION & COORDINATION', label: 'EXECUTE', color: 'text-red-600' },
        { id: 'PHASE 5: LEARNING & IMPROVEMENT', label: 'REVIEW', color: 'text-blue-400' }
    ];

    return (
        <div className="flex justify-between items-center mb-6 glass-panel p-4 rounded-xl">
            {phases.map((p, idx) => {
                const isActive = currentPhase === p.id;
                return (
                    <div key={idx} className={`flex flex-col items-center ${isActive ? 'opacity-100 scale-110' : 'opacity-40'} transition-all duration-300`}>
                        <div className={`w-3 h-3 rounded-full mb-2 ${isActive ? 'bg-current animate-pulse' : 'bg-gray-600'} ${p.color}`}></div>
                        <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-white' : 'text-gray-500'}`}>{p.label}</span>
                    </div>
                );
            })}
            {/* Login Modal */}
            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </div>
    );
};

// Content Renderer based on Phase
const PhaseContent = ({ data }) => {
    if (!data) return <div className="text-center text-gray-500 animate-pulse mt-10">Initializing Oracle Link...</div>;

    const { phase, content } = data;

    if (phase.includes('PHASE 1')) {
        return (
            <div className="space-y-4">
                <div className="glass-panel p-4 border-l-4 border-crisis-success">
                    <h3 className="text-crisis-success font-mono font-bold flex items-center"><Radio size={18} className="mr-2" /> MONITORING ACTIVE</h3>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="bg-black/20 p-2 rounded">
                            <p className="text-xs text-gray-400">WEATHER PARAMS</p>
                            <p className="text-sm font-bold">{content.weather.temp}°C | {content.weather.condition}</p>
                            <p className="text-xs text-blue-400">Wind: {content.weather.wind} km/h</p>
                        </div>
                        <div className="bg-black/20 p-2 rounded">
                            <p className="text-xs text-gray-400">AGENCY ALERTS</p>
                            <p className="text-sm font-bold">{content.metrics.noaa}</p>
                            <p className="text-xs text-green-400">Seismic: {content.metrics.seismic}</p>
                        </div>
                    </div>
                    {content.intel && content.intel.length > 0 && (
                        <div className="mt-4">
                            <p className="text-xs text-crisis-accent mb-2 flex items-center"><Brain size={12} className="mr-1" /> INTEL DISCOVERED</p>
                            <div className="space-y-2">
                                {content.intel.map((news, i) => (
                                    <div key={i} className="text-xs bg-crisis-accent/10 border border-crisis-accent/20 p-2 rounded">
                                        <p className="font-bold text-white">{news.title}</p>
                                        <div className="flex justify-between text-gray-400">
                                            <span>{news.source}</span>
                                            <span>{news.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    if (phase.includes('PHASE 2')) {
        return (
            <div className="space-y-4">
                <div className="glass-panel p-4 border-l-4 border-alert bg-alert/5">
                    <h3 className="text-alert font-mono font-bold flex items-center animate-pulse"><ShieldAlert size={18} className="mr-2" /> THREAT DETECTED</h3>
                    <p className="text-xl font-bold mt-2">{content.threat.name}</p>
                    <p className="text-sm text-gray-300">Severity: {content.severity} | Conf: {content.confidence}</p>

                    {content.reasoning && (
                        <div className="mt-4 mb-4">
                            <p className="text-xs text-orange-400 mb-2 flex items-center"><Brain size={12} className="mr-1" /> ORACLE THOUGHT PROCESS</p>
                            <div className="bg-black/40 p-3 rounded font-mono text-xs space-y-1 text-gray-300 max-h-32 overflow-y-auto custom-scrollbar">
                                {content.reasoning.map((thought, i) => (
                                    <div key={i} className="flex"><span className="text-gray-600 mr-2">Step {i + 1}:</span> {thought}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-4 p-3 bg-black/40 rounded">
                        <p className="text-xs text-gray-400 mb-1">IMPACT FORECAST</p>
                        <ul className="text-sm space-y-1">
                            <li>📍 Zone: {content.impactForecast.zone}</li>
                            <li>👥 Risk: {content.impactForecast.populationAtRisk}</li>
                            <li>⚠️ Impact: {content.timeline.expectedImpact}</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    if (phase.includes('PHASE 3')) {
        return (
            <div className="space-y-4">
                <div className="glass-panel p-4 border-l-4 border-crisis-warning">
                    <h3 className="text-crisis-warning font-mono font-bold flex items-center"><Brain size={18} className="mr-2" /> GENERATING RESPONSE PLAN</h3>

                    <div className="mt-2 space-y-2">
                        {content.objectives.map((obj, i) => (
                            <div key={i} className="flex items-center text-sm"><Target size={14} className="mr-2 text-crisis-accent" /> {obj}</div>
                        ))}
                    </div>

                    <div className="mt-4">
                        <p className="text-xs text-gray-400 mb-2">RESOURCE ALLOCATION</p>
                        {content.resources.map((res, i) => (
                            <div key={i} className="flex justify-between text-sm bg-black/20 p-2 rounded mb-1">
                                <span>{res.item}</span>
                                <span className="font-bold text-crisis-accent">{res.quantity}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (phase.includes('PHASE 4')) {
        return (
            <div className="space-y-4">
                <div className="glass-panel p-4 border-l-4 border-red-600">
                    <h3 className="text-red-500 font-mono font-bold flex items-center"><Activity size={18} className="mr-2" /> EXECUTION IN PROGRESS</h3>

                    <div className="mt-4 space-y-2">
                        {content.actionsTaken.map((action, i) => (
                            <div key={i} className="flex items-center text-sm text-green-400"><CheckCircle size={14} className="mr-2" /> {action}</div>
                        ))}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="bg-black/30 p-2 rounded text-center">
                            <p className="text-xs text-gray-500">DEPLOYED</p>
                            <p className="font-bold text-lg">{content.resources.deployed}</p>
                        </div>
                        <div className="bg-black/30 p-2 rounded text-center">
                            <p className="text-xs text-gray-500">CASUALTIES</p>
                            <p className="font-bold text-lg text-green-500">{content.casualties}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (phase.includes('PHASE 5')) {
        return (
            <div className="space-y-4">
                <div className="glass-panel p-4 border-l-4 border-blue-400">
                    <h3 className="text-blue-400 font-mono font-bold flex items-center"><FileText size={18} className="mr-2" /> AFTER ACTION REVIEW</h3>

                    <p className="mt-2 text-sm">Prediction Accuracy: <span className="text-green-400">{content.predictionAccuracy}</span></p>

                    <div className="mt-4">
                        <p className="text-xs text-gray-400 mb-1">LESSONS LEARNED</p>
                        {content.lessons.map((lesson, i) => (
                            <div key={i} className="text-sm bg-blue-500/10 p-2 rounded border border-blue-500/20">{lesson}</div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default function Dashboard() {
    useEffect(() => {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, []);

    const [latestData, setLatestData] = useState(null);
    const [dataHistory, setDataHistory] = useState([]);
    const [status, setStatus] = useState('CONNECTING...');

    // Auth State
    const { user, logout } = useAuth();
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    // Audio Staterts, setAlerts] = useState([]);
    const [isMuted, setIsMuted] = useState(false); // Voice Control
    const [isListening, setIsListening] = useState(false); // STT State

    // Multi-layer map state
    const [layers, setLayers] = useState({
        threat: true,
        shelters: true,
        routes: false
    });
    const [phaseHistory, setPhaseHistory] = useState([]);
    const [timelineIndex, setTimelineIndex] = useState(0);
    const [selectedShelter, setSelectedShelter] = useState(null);

    // Only load Google Maps in development (localhost)
    const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: isDevelopment ? import.meta.env.VITE_GOOGLE_MAPS_API_KEY : '',
        skipLoading: !isDevelopment // Skip loading in production
    });

    useEffect(() => {
        socket.on('connect', () => {
            setStatus('ONLINE');
        });
        socket.on('disconnect', () => setStatus('OFFLINE'));

        socket.on('oracle-stream', (data) => {
            setLatestData(data);
            setDataHistory(prev => [data, ...prev].slice(0, 20)); // Keep last 20 for feed

            // Track phase history for timeline
            setPhaseHistory(prev => {
                const updated = [...prev, data];
                if (updated.length > 10) updated.shift(); // Keep last 10
                setTimelineIndex(updated.length - 1); // Auto-advance to latest
                return updated;
            });
        });

        // Listen for High-Priority Alerts
        socket.on('alert-stream', (alert) => {
            setAlerts(prev => [alert, ...prev].slice(0, 5)); // Keep last 5
            // Native Notification (optional)
            if (Notification.permission === "granted") {
                new Notification(`⚠️ ${alert.type} ALERT`, { body: alert.message });
            }
        });

        return () => socket.off();
    }, []);

    // Extract location for map if available in threat data
    const activeThreatLocation = useMemo(() => {
        if (latestData?.content?.threat?.location?.coords) {
            const [lat, lng] = latestData.content.threat.location.coords.split(',').map(c => parseFloat(c));
            return { lat, lng };
        }
        return { lat: 32.2190, lng: 76.3234 }; // Default Center (Dharamshala)
    }, [latestData]);

    const activeThreatRadius = useMemo(() => {
        return latestData?.content?.threat?.impactRadius || 0;
    }, [latestData]);

    // TTS Engine
    const speak = (text) => {
        if (isMuted || !text) return;
        // Cancel previous speech to avoid overlap
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        // Try to find a good voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('David')) || voices[0];
        utterance.voice = preferredVoice;

        window.speechSynthesis.speak(utterance);
    };

    // Voice Triggers: Phase Changes
    useEffect(() => {
        if (latestData?.phase) {
            const phaseName = latestData.phase.split(':')[1] || latestData.phase;
            speak(`Initiating ${phaseName}`);
        }
    }, [latestData?.phase]);

    // Voice Triggers: Alerts
    useEffect(() => {
        if (alerts.length > 0) {
            const newestAlert = alerts[0];
            // Only speak recent alerts (avoid speaking old ones on reload)
            if (Date.now() - new Date(newestAlert.timestamp).getTime() < 5000) {
                speak(`Attention. ${newestAlert.message}`);
            }
        }
    }, [alerts]);

    const injectThreat = (type) => {
        socket.emit('inject-threat', type);
    };

    // Voice Command Engine (STT)
    useEffect(() => {
        let recognition = null;
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = 'en-US';
            recognition.interimResults = false;

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);

            recognition.onresult = (event) => {
                const command = event.results[0][0].transcript.toLowerCase();
                console.log("Voice Command:", command);

                // Command Processing
                if (command.includes('fire') || command.includes('wildfire')) {
                    speak("Command Accepted. Initiating Wildfire Protocol.");
                    injectThreat('WILDFIRE');
                } else if (command.includes('flood') || command.includes('water')) {
                    speak("Command Accepted. Initiating Flood Protocol.");
                    injectThreat('FLOOD');
                } else if (command.includes('earthquake') || command.includes('quake')) {
                    speak("Command Accepted. Initiating Seismic Protocol.");
                    injectThreat('EARTHQUAKE');
                } else if (command.includes('silence') || command.includes('mute')) {
                    setIsMuted(true);
                } else if (command.includes('speak') || command.includes('audio') || command.includes('unmute')) {
                    setIsMuted(false);
                    speak("Audio Systems Online.");
                } else {
                    speak("Command not recognized.");
                }
            };
        }

        if (isListening && recognition) {
            try { recognition.start(); } catch (e) { console.error(e); }
        }

        return () => {
            if (recognition) recognition.stop();
        };
    }, [isListening]);

    const toggleMic = () => {
        setIsListening(!isListening);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen flex flex-col">
            {/* Header */}
            <header className="flex justify-between items-center mb-6 glass-panel p-4 rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-crisis-accent/10 to-transparent pointer-events-none"></div>
                <div className="flex items-center space-x-3 z-10">
                    <Activity className="text-crisis-accent animate-pulse" />
                    <h1 className="text-2xl font-bold tracking-widest text-white">
                        CRISIS<span className="text-crisis-accent">AVERT</span> <span className="text-xs font-mono text-gray-500 ml-2">ORACLE NETWORK v1.0</span>
                    </h1>
                </div>
                <div className="flex items-center space-x-4 z-10">
                    <button
                        onClick={toggleMic}
                        className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-600 text-white animate-pulse shadow-[0_0_15px_#dc2626]' : 'text-crisis-accent hover:text-white bg-crisis-accent/10'}`}
                        title={isListening ? "Listening..." : "Enable Voice Command"}
                    >
                        {isListening ? <Mic size={18} /> : <MicOff size={18} />}
                    </button>
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-2 rounded-full transition-colors ${isMuted ? 'text-gray-500 hover:text-white' : 'text-crisis-accent hover:text-white bg-crisis-accent/10'}`}
                        title={isMuted ? "Unmute Voice" : "Mute Voice"}
                    >
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <div className="flex items-center space-x-2">
                        <span className={`h-2 w-2 rounded-full ${status === 'ONLINE' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'} animate-ping`}></span>
                        <span className="text-xs font-mono text-gray-400">{status}</span>
                    </div>

                    {/* User Auth Button */}
                    <button
                        onClick={() => user ? logout() : setIsLoginOpen(true)}
                        className={`p-2 rounded-full transition-colors ${user ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-crisis-accent/10 text-crisis-accent hover:bg-crisis-accent/20'}`}
                        title={user ? "Sign Out" : "Sign In"}
                    >
                        {user ? <LogOut size={18} /> : <User size={18} />}
                    </button>

                </div>
            </header>

            {/* Phase Visualizer */}
            <PhaseDisplay currentPhase={latestData?.phase} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">

                {/* Left Column: Context & Analysis */}
                <div className="lg:col-span-1 flex flex-col space-y-6">

                    {/* User Status Panel */}
                    <UserStatusPanel currentThreat={latestData?.content?.threat} />

                    {/* Live Phase Content */}
                    <PhaseContent data={latestData} />

                    {/* Simulation Control */}
                    <div className="glass-panel p-4 rounded-xl">
                        <h4 className="text-xs font-mono text-gray-500 mb-3 flex items-center"><Zap size={14} className="mr-1" /> THREAT INJECTION CONTROL</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={() => injectThreat('EARTHQUAKE')} className="bg-amber-900/50 hover:bg-amber-700/50 border border-amber-700/50 text-[10px] py-2 rounded text-amber-200 transition-colors">
                                🏜️ QUAKE
                            </button>
                            <button onClick={() => injectThreat('WILDFIRE')} className="bg-orange-900/50 hover:bg-orange-700/50 border border-orange-700/50 text-[10px] py-2 rounded text-orange-200 transition-colors">
                                🔥 FIRE
                            </button>
                            <button onClick={() => injectThreat('FLOOD')} className="bg-blue-900/50 hover:bg-blue-700/50 border border-blue-700/50 text-[10px] py-2 rounded text-blue-200 transition-colors">
                                🌊 FLOOD
                            </button>
                        </div>
                    </div>

                    {/* ALERT CENTER */}
                    {alerts.length > 0 && (
                        <div className="glass-panel p-4 rounded-xl animate-slide-in border-l-4 border-red-500 bg-red-950/20">
                            <h3 className="text-red-400 font-mono font-bold mb-3 flex items-center text-xs">
                                <Bell size={14} className="mr-2 animate-bounce" /> PRIORITY ALERTS
                            </h3>
                            <div className="space-y-2">
                                {alerts.map((alert) => (
                                    <div key={alert.id} className="bg-black/40 border border-red-500/30 p-2 rounded relative">
                                        <div className="flex justify-between items-start">
                                            <span className="text-[9px] bg-red-600 text-white px-1 rounded">{alert.type}</span>
                                            <span className="text-[9px] text-gray-500">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-xs text-gray-300 mt-1 leading-tight">{alert.message}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Response Console (The Hand) */}
                    <div className="flex-none">
                        <ResponseConsole />
                    </div>

                    {/* Recent Log */}
                    <div className="flex-1 overflow-hidden flex flex-col glass-panel p-4 rounded-xl max-h-[200px]">
                        <h4 className="text-xs font-mono text-gray-500 mb-2">SYSTEM LOG</h4>
                        <div className="overflow-y-auto custom-scrollbar space-y-1 text-xs font-mono text-gray-400">
                            {dataHistory.map(item => (
                                <div key={item.id}>
                                    <span className="text-crisis-accent">[{new Date(item.timestamp).toLocaleTimeString()}]</span> {item.phase.split(':')[0]}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Map / Visualization Column */}
                <div className="lg:col-span-2 flex flex-col">
                    <div className="glass-panel flex-1 min-h-[500px] rounded-xl relative overflow-hidden group border-crisis-accent/20">
                        {!isDevelopment ? (
                            // Production: Show placeholder instead of map
                            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                <MapIcon size={64} className="text-crisis-accent/30 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Map Visualization</h3>
                                <p className="text-gray-400 text-sm max-w-md">
                                    Interactive map is available in development mode only.
                                    <br />
                                    Threat locations and impact zones are visualized here during local testing.
                                </p>
                            </div>
                        ) : isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={MAP_CONTAINER_STYLE}
                                center={activeThreatLocation}
                                zoom={latestData?.phase?.includes('MONITORING') ? 5 : 9}
                                options={MAP_OPTIONS}
                            >
                                {/* Threat Zone (if layer enabled) */}
                                {layers.threat && latestData?.content?.threat && (
                                    <>
                                        <Marker
                                            position={activeThreatLocation}
                                            animation={window.google?.maps?.Animation?.BOUNCE}
                                            icon={{
                                                path: window.google?.maps?.SymbolPath?.CIRCLE,
                                                scale: 12,
                                                fillColor: latestData.severityColor || '#ef4444',
                                                fillOpacity: 1,
                                                strokeColor: '#ffffff',
                                                strokeWeight: 2
                                            }}
                                        />
                                        {activeThreatRadius > 0 && (
                                            <Circle
                                                center={activeThreatLocation}
                                                radius={activeThreatRadius}
                                                options={{
                                                    fillColor: latestData.severityColor || '#ef4444',
                                                    fillOpacity: 0.3,
                                                    strokeColor: latestData.severityColor || '#ef4444',
                                                    strokeOpacity: 0.8,
                                                    strokeWeight: 2,
                                                }}
                                            />
                                        )}
                                    </>
                                )}

                                {/* Shelter Markers (if layer enabled) */}
                                {layers.shelters && latestData?.shelters?.map(shelter => (
                                    <Marker
                                        key={shelter.id}
                                        position={{ lat: shelter.lat, lng: shelter.lon }}
                                        icon={{
                                            url: 'data:image/svg+xml;base64,' + btoa(`
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2">
                                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                                </svg>
                                            `),
                                            scaledSize: new window.google.maps.Size(24, 24)
                                        }}
                                        onClick={() => setSelectedShelter(shelter)}
                                    />
                                ))}

                                {/* Shelter Info Window */}
                                {selectedShelter && (
                                    <InfoWindow
                                        position={{ lat: selectedShelter.lat, lng: selectedShelter.lon }}
                                        onCloseClick={() => setSelectedShelter(null)}
                                    >
                                        <div className="p-2 text-black">
                                            <h3 className="font-bold text-sm mb-1">{selectedShelter.name}</h3>
                                            <p className="text-xs text-gray-600 mb-2">{selectedShelter.distance?.toFixed(1)} km away</p>
                                            <div className="text-xs space-y-1">
                                                <div className="flex justify-between">
                                                    <span>Capacity:</span>
                                                    <span className="font-semibold">{selectedShelter.available}/{selectedShelter.capacity}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className="bg-blue-500 h-2 rounded-full"
                                                        style={{ width: `${(selectedShelter.current / selectedShelter.capacity) * 100}%` }}
                                                    ></div>
                                                </div>
                                                <div className="flex gap-2 mt-2">
                                                    {selectedShelter.petFriendly && <span className="bg-green-100 text-green-800 px-1 rounded text-[10px]">🐕 Pets OK</span>}
                                                    {selectedShelter.accessible && <span className="bg-blue-100 text-blue-800 px-1 rounded text-[10px]">♿ Accessible</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </InfoWindow>
                                )}

                                {/* Evacuation Routes (if layer enabled) */}
                                {layers.routes && latestData?.evacuationRoutes?.map((route, idx) => (
                                    <Polyline
                                        key={idx}
                                        path={route.coordinates.map(c => ({ lat: c.lat, lng: c.lon }))}
                                        options={{
                                            strokeColor: route.status === 'open' ? '#10b981' : route.status === 'congested' ? '#f59e0b' : '#ef4444',
                                            strokeOpacity: 0.8,
                                            strokeWeight: 3,
                                            icons: [{
                                                icon: { path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW },
                                                offset: '100%'
                                            }]
                                        }}
                                    />
                                ))}
                            </GoogleMap>
                        ) : (
                            <div className="flex items-center justify-center h-full text-crisis-accent animate-pulse">
                                Loading Secure Satellite Link...
                            </div>
                        )}

                        {/* Overlay: Phase Title */}
                        {latestData && (
                            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-4 py-2 rounded border-l-2 border-crisis-accent">
                                <p className="text-xs text-gray-400">CURRENT OPERATION</p>
                                <p className="font-bold text-white">{latestData.phase}</p>
                            </div>
                        )}

                        {/* Layer Control (development only) */}
                        {isDevelopment && isLoaded && (
                            <LayerControl
                                layers={layers}
                                onToggle={(layerId) => setLayers(prev => ({ ...prev, [layerId]: !prev[layerId] }))}
                            />
                        )}

                        {/* Timeline Slider (development only) */}
                        {isDevelopment && isLoaded && phaseHistory.length > 1 && (
                            <TimelineSlider
                                phaseHistory={phaseHistory}
                                currentIndex={timelineIndex}
                                onSeek={(index) => {
                                    setTimelineIndex(index);
                                    setLatestData(phaseHistory[index]);
                                }}
                            />
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
