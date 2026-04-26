"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Bed, Bath, Square, Calendar, User, Phone, CheckCircle2 } from 'lucide-react';
import { Property } from '../types';

interface PropertyDetailsModalProps {
    property: Property;
    onClose: () => void;
}

const PropertyDetailsModal = ({ property, onClose }: PropertyDetailsModalProps) => {
    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                />
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                >
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur rounded-full text-gray-500 hover:text-gray-900 transition-colors shadow-sm"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Image Section */}
                    <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100">
                        <img 
                            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80" 
                            alt={property.title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Content Section */}
                    <div className="w-full md:w-1/2 p-8 overflow-y-auto">
                        <div className="mb-6">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-widest">
                                {property.action}
                            </span>
                            <h2 className="text-2xl font-bold text-gray-900 mt-3">{property.title}</h2>
                            <div className="flex items-center gap-2 text-gray-500 mt-2">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">{property.city}</span>
                            </div>
                        </div>

                        <div className="text-3xl font-bold text-slate-800 mb-8">
                            ₹{property.price?.toLocaleString() || 'Price on request'}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                                <Bed className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-400">Bedrooms</p>
                                    <p className="text-sm font-bold text-gray-900">{property.bedrooms} BHK</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                                <Square className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-400">Total Area</p>
                                    <p className="text-sm font-bold text-gray-900">{property.area_sqft} sqft</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span>Verified Listing by {property.listed_by}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <span>Listed on {property.created_at ? new Date(property.created_at).toLocaleDateString() : 'Recent'}</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button className="flex-1 py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-900 transition-colors shadow-lg shadow-slate-100">
                                Contact Agent
                            </button>
                            <button className="p-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
                                <Phone className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default PropertyDetailsModal;
