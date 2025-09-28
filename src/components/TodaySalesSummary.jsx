import React from "react";
import { X, CheckCircle, Activity, Landmark, TrendingDown, TrendingUp, Download, RefreshCcw } from "lucide-react";

const TodaySalesSummary = ({
    isOpen,
    onClose,
}) => {
    if (!isOpen) return null; // modal toggle

    return (
        <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-xl flex flex-col">
                <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-xl flex-shrink-0">
                    <h2 className="text-xl font-bold">Today's Sales Summary</h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full transition-colors text-red-500 hover:text-red-300 hover:bg-white hover:bg-opacity-20"
                    >
                        X Cancel
                    </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div class="bg-green-50 shadow border-l-4 border-green-500 rounded-lg p-2">
                            <h4 class="flex items-center text-lg font-semibold text-green-600 mb-4 gap-1">
                                <TrendingUp size={16} />
                                Payment IN
                            </h4>

                            <div class="space-y-1">
                                <div class="flex justify-between text-xs sm:text-xs md:text-xs lg:text-xs xl:text-sm bg-white p-2">
                                    <span class="font-medium">Opening Balance:</span>
                                    <span id="openingBalance">€0.00</span>
                                </div>
                                <div class="flex justify-between text-xs sm:text-xs md:text-xs lg:text-xs xl:text-sm bg-white p-2">
                                    <span class="font-medium">Due Received:</span>
                                    <span id="dueReceived">€0.00</span>
                                </div>
                                <div class="flex justify-between text-xs sm:text-xs md:text-xs lg:text-xs xl:text-sm bg-white p-2">
                                    <span class="font-medium">Transactions (With Tax):</span>
                                    <span id="transactionsWithTax">€0.00</span>
                                </div>
                                <div class="flex justify-between text-xs sm:text-xs md:text-xs lg:text-xs xl:text-sm bg-white p-2">
                                    <span class="font-medium">Credit Payments:</span>
                                    <span id="creditAmount">€0.00</span>
                                </div>
                                <div class="flex justify-between text-xs sm:text-xs md:text-xs lg:text-xs xl:text-sm bg-white p-2">
                                    <span class="font-medium">Cash Payments:</span>
                                    <span id="cashAmount">€0.00</span>
                                </div>
                            </div>
                        </div>

                        <div class="bg-red-50 shadow border-l-4 border-red-500 rounded-xl p-2">
                            <h4 class="flex items-center text-lg font-semibold text-red-600 mb-4">
                                <TrendingDown size={16} />
                                Payment OUT
                            </h4>

                            <div class="space-y-1">
                                <div class="flex justify-between text-xs sm:text-xs md:text-xs lg:text-xs xl:text-sm bg-white p-2">
                                    <span class="font-medium">Debit Paid:</span>
                                    <span id="debitPaid">€0.00</span>
                                </div>
                                <div class="flex justify-between text-xs sm:text-xs md:text-xs lg:text-xs xl:text-sm bg-white p-2">
                                    <span class="font-medium">Outstanding Due:</span>
                                    <span id="dueAmount">€0.00</span>
                                </div>
                                <div class="flex justify-between text-xs sm:text-xs md:text-xs lg:text-xs xl:text-sm bg-white p-2">
                                    <span class="font-medium">Refunds Issued:</span>
                                    <span id="refundAmount">€0.00</span>
                                </div>
                                <div class="flex justify-between text-xs sm:text-xs md:text-xs lg:text-xs xl:text-sm bg-white p-2">
                                    <span class="font-medium">Tax Collected:</span>
                                    <span id="taxAmount">€0.00</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="bg-blue-50 border border-blue-400 border-l-4 rounded-lg p-6 shadow-sm mt-2">
                        <h4 class="flex justify-center items-center text-lg text-center font-semibold text-blue-900 mb-4 border-b border-blue-300 pb-2">
                            {/* <span class="material-icons text-blue-800 mr-2">account_balance</span> */}
                            <Landmark size={16} />
                            Net Position
                        </h4>

                        <div class="flex justify-between items-center bg-white border-2 border-blue-400 rounded-lg px-4 py-1 mb-4 shadow-sm">
                            <span class="font-medium text-blue-900">Closing Balance (With Tax):</span>
                            <span id="closingBalanceWithTax" class="text-lg font-bold text-blue-900">€0.00</span>
                        </div>

                        <div class="flex justify-between items-center bg-white border-2 border-blue-400 rounded-lg px-4 py-1 shadow-sm">
                            <span class="font-medium text-blue-900">Closing Balance (Without Tax):</span>
                            <span id="closingBalanceWithoutTax" class="text-lg font-bold text-blue-900">€0.00</span>
                            
                        </div>
                    </div>
                    <div className="p-3 border-t border-gray-200 flex gap-4">
                        <button
                            className="flex-1 px-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCcw size={20} />
                            Refresh Data
                        </button>
                        <button
                            className="flex-1 px-2 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                        >
                            <Download size={20} />
                            Export Data
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TodaySalesSummary;
