import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { ArrowRight, Sparkles, Coffee, Utensils, Users, Clock, X, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useHotelStatus } from '../../hooks/useHotelStatus';
import { div } from 'three/tsl';

const WelcomeScreen = () => {
    const navigate = useNavigate();
    const { themeColors } = useTheme();
    const [currentTime, setCurrentTime] = useState(new Date());
    const [view, setView] = useState("welcome"); // "welcome" | "billing" | "thankyou"

    return (
        <div
            className="min-h-screen relative"
            style={{ backgroundColor: themeColors.dashboardBackground }}
        >
            <div>
                <button
                    onClick={() => {
                        if (!document.fullscreenElement) {
                            document.documentElement.requestFullscreen();
                        } else {
                            document.exitFullscreen();
                        }
                    }}
                    className="absolute top-5 right-5 bg-[#176B87] text-white rounded-lg p-3 text-lg hover:bg-[#0f4c75] transition-transform transform hover:scale-105 z-20"
                >
                    ⛶
                </button>
                {/* Header */}
                <div className="bg-[#176B87] text-white text-center p-5 shadow-md">
                    <h1 className="text-2xl font-bold mb-1">Customer Display</h1>
                    <div className="text-sm opacity-90">
                        Midway Kebabish - Quality and Taste Together
                    </div>
                </div>

            </div>


            <div className="">
                {/* Welcome Screen */}
                {view === "welcome" && (
                    <div className='flex flex-1 justify-center'>
                        <div className="flex flex-col items-center">
                            <div className="text-center mt-5">
                                <div className="w-30 h-30 md:w-52 md:h-52 rounded-full flex items-center justify-center bg-gradient-to-br from-[#176B87] to-[#0f4c75] shadow-lg relative overflow-hidden mx-auto mb-6">
                                    <span className="text-white font-extrabold text-2xl z-10">MK</span>
                                </div>
                            </div>

                            <div className="text-center">
                                <h2 className="text-4xl md:text-5xl font-extrabold text-[#176B87] mb-5 drop-shadow">
                                    Welcome To Midway Kebabish
                                </h2>
                                <div className="text-xl text-gray-600 font-semibold mb-4">
                                    Quality and Taste Together
                                </div>
                                <div className="text-base text-gray-700 font-medium leading-relaxed">
                                    Experience the finest flavors crafted with passion and tradition.
                                    Our authentic recipes and fresh ingredients create unforgettable
                                    dining moments.
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* Thank You Screen */}
                {view === "thankyou" && (
                    <div className="min-h-screen bg-green-500 pt-2">
                        <div className='flex flex-col items-center justify-center'>
                            <div className="w-28 h-28 bg-white/30 rounded-full flex items-center justify-center mb-8 animate-pulse">
                                <span className="text-5xl">✔</span>
                            </div>
                            <h1 className="text-5xl  text-white font-extrabold mb-4 drop-shadow">
                                Thank You!
                            </h1>
                            <div className="text-2xl text-white font-semibold mb-6 opacity-90">
                                Your order has been placed
                            </div>
                            <p className="text-lg text-white text-center opacity-80 leading-relaxed">
                                We're preparing your delicious meal with care. <br />
                                Please wait while we process your order.
                            </p>

                            <div className="bg-white/30 rounded-xl  text-center p-6 mt-8 backdrop-blur-md">
                                <div className="text-lg text-white font-bold mb-2">Order #001</div>
                                <div className="text-sm text-white opacity-90">
                                    Estimated time: 15-20 minutes
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* Billing Display */}
                {view === "billing" && (
                    <div className="grid grid-cols-5">
                        {/* Items */}
                        <div className="col-span-3 flex-grow bg-gray-100 p-6 overflow-y-auto">
                            <div className="grid grid-cols-5 gap-5 font-bold text-lg text-[#176B87] border-b-4 border-[#176B87] pb-4 mb-6">
                                <div>Item</div>
                                <div>Price</div>
                                <div>Quantity</div>
                                <div>Discount</div>
                                <div>Sub Total</div>
                            </div>
                            {/* Example Item */}
                            <div className="grid grid-cols-5 gap-5 py-4 border-b border-gray-200 hover:bg-[#176B87]/5 transition">
                                <div>
                                    <div className="font-semibold text-gray-900">Chicken Kebab</div>
                                    <div className="text-sm text-gray-600 italic">With garlic sauce</div>
                                </div>
                                <div className="text-right font-semibold text-gray-800">5.00</div>
                                <div className="text-right font-semibold text-gray-800">2</div>
                                <div className="text-right font-semibold text-gray-800">0.00</div>
                                <div className="text-right font-semibold text-gray-800">10.00</div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="col-span-2 flex-col justify-between flex-1 bg-white p-6 border-l border-gray-300">
                            <div>
                                <div className="flex justify-between py-3 border-b text-sm">
                                    <span className="text-gray-600 font-medium">Total Item:</span>
                                    <span className="font-bold text-gray-900">1(2)</span>
                                </div>
                                <div className="flex justify-between py-3 border-b text-sm">
                                    <span className="text-gray-600 font-medium">Sub Total:</span>
                                    <span className="font-bold text-gray-900">10.00</span>
                                </div>
                                <div className="flex justify-between py-3 border-b text-sm">
                                    <span className="text-gray-600 font-medium">In Global:</span>
                                    <span className="font-bold text-gray-900">2.80</span>
                                </div>
                                <div className="flex justify-between py-3 border-b text-sm">
                                    <span className="text-gray-600 font-medium">Tax:</span>
                                    <span className="font-bold text-gray-900">2.80</span>
                                </div>
                                <div className="flex justify-between py-3 border-b text-sm">
                                    <span className="text-gray-600 font-medium">Charge:</span>
                                    <span className="font-bold text-gray-900">2.80</span>
                                </div>
                                <div className="flex justify-between py-3 border-b text-sm">
                                    <span className="text-gray-600 font-medium">Tips:</span>
                                    <span className="font-bold text-gray-900">2.80</span>
                                </div>
                            </div>

                            <div className="mt-6 bg-gradient-to-br from-[#176B87] to-[#0f4c75] text-white rounded-xl text-center py-6 shadow-lg">
                                <div className="text-lg font-semibold">Total Payable:</div>
                                <div className="text-3xl font-extrabold">12.80</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Notification */}
            <div className="fixed top-5 right-5 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transform translate-x-[400px] transition-transform">
                Item added to cart!
            </div>
        </div>
    );
};

export default WelcomeScreen;
