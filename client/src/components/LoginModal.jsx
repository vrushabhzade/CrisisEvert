import React, { useState } from 'react';
import { X, User, Lock, MapPin, Phone, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginModal({ isOpen, onClose }) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        phone: '',
        locationCoords: ''
    });
    const [error, setError] = useState('');
    const { login, register } = useAuth();

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        let result;
        if (isLogin) {
            result = await login(formData.email, formData.password);
        } else {
            // Basic location parsing (simulated for now)
            const location = {
                name: 'Custom Location',
                lat: 0,
                lon: 0
            };

            // Try to get real location if possible, or just default
            if (formData.locationCoords) {
                const [lat, lon] = formData.locationCoords.split(',').map(c => parseFloat(c.trim()));
                if (!isNaN(lat) && !isNaN(lon)) {
                    location.lat = lat;
                    location.lon = lon;
                }
            }

            result = await register({
                email: formData.email,
                password: formData.password,
                name: formData.name,
                phone: formData.phone,
                location
            });
        }

        if (result.success) {
            onClose();
        } else {
            setError(result.error);
        }
    };

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setFormData({
                    ...formData,
                    locationCoords: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
                });
            }, () => {
                setError('Unable to retrieve location');
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-bold text-white mb-6 font-display">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-mono text-gray-400 mb-1">FULL NAME</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 text-gray-500" size={16} />
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-crisis-accent"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1">EMAIL ADDRESS</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 text-gray-500" size={16} />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-crisis-accent"
                                placeholder="john@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-gray-400 mb-1">PASSWORD</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 text-gray-500" size={16} />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-crisis-accent"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {!isLogin && (
                        <>
                            <div>
                                <label className="block text-xs font-mono text-gray-400 mb-1">PHONE (FOR ALERTS)</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 text-gray-500" size={16} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-crisis-accent"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-mono text-gray-400 mb-1">HOME LOCATION</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <MapPin className="absolute left-3 top-2.5 text-gray-500" size={16} />
                                        <input
                                            type="text"
                                            name="locationCoords"
                                            value={formData.locationCoords}
                                            onChange={handleChange}
                                            className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-crisis-accent"
                                            placeholder="Lat, Lon"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={getLocation}
                                        className="bg-white/10 hover:bg-white/20 text-white px-3 rounded-lg transition-colors"
                                    >
                                        <MapPin size={20} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-crisis-accent hover:bg-opacity-90 text-black font-bold py-3 rounded-lg transition-all transform active:scale-95"
                    >
                        {isLogin ? 'Sign In' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );
}
