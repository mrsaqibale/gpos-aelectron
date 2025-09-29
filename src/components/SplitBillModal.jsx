import React from "react";
import { X, CheckCircle } from "lucide-react";

const SplitBillModal = ({
    isOpen,
    onClose,
    splitItems,
    splitBills,
    selectedSplitBill,
    setSelectedSplitBill,
    totalSplit,
    setTotalSplit,
    handleSplitGo,
    handleRemoveItemFromSplit,
    handleAddItemToSplit,
    handleRemoveSplitBill,
    handleSplitBillCustomerChange,
    areAllItemsDistributed,
    calculateMaxSplits,
    getRemainingQuantity,
    getItemQuantityInSplit,
    selectedPlacedOrder,
    getTaxRate,
    setSplitBillToRemove,
    resetFinalizeSaleModalForSplitBill,
    setIsSinglePayMode,
    setShowFinalizeSaleModal,
    // Customer selection props
    selectedCustomer,
    setSelectedCustomer,
    selectedOrderType,
    setSelectedOrderType,
    showCustomerModal,
    setShowCustomerModal,
    showCustomerSearchModal,
    setShowCustomerSearchModal,
    handleCustomerSelect,
    handleEditCustomer
}) => {
    if (!isOpen) return null; // modal toggle

    return (
        <div className="fixed inset-0 bg-[#00000089] bg-opacity-30 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl h-[95vh] flex flex-col">
                {/* Header */}
                <div className="bg-primary text-white p-4 flex justify-between items-center rounded-t-xl flex-shrink-0">
                    <h2 className="text-xl font-bold">Split Bill</h2>
                    <button
                        onClick={onClose}
                        className="text-red-500 hover:text-red-300 hover:bg-white hover:bg-opacity-20 p-1 rounded-full transition-colors"
                    >
                        X Cancel
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-8">
                        {/* Left Section - Order Items */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Order Items
                            </h3>

                            {/* Items Table */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr className="text-sm font-medium text-gray-700">
                                            <th className="px-3 py-2 text-left">Item Name</th>
                                            <th className="px-3 py-2 text-center">Price</th>
                                            <th className="px-3 py-2 text-center">Qty</th>
                                            <th className="px-3 py-2 text-center">Dis.</th>
                                            <th className="px-3 py-2 text-center">Total</th>
                                            <th className="px-3 py-2 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {splitItems.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-t border-gray-100"
                                            >
                                                <td className="px-3 py-2 text-sm text-gray-800">
                                                    <span className="truncate">
                                                        {item.food?.name || "Unknown Food"}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-sm text-center text-gray-600">
                                                    €{(item.totalPrice / item.quantity).toFixed(2)}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-center text-gray-600">
                                                    {getRemainingQuantity(item.id)}
                                                </td>
                                                <td className="px-3 py-2 text-sm text-center text-gray-600">
                                                    €0.00
                                                </td>
                                                <td className="px-3 py-2 text-sm text-center font-medium text-gray-800">
                                                    €{item.totalPrice.toFixed(2)}
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            onClick={() =>
                                                                handleRemoveItemFromSplit(
                                                                    item.id,
                                                                    selectedSplitBill?.id
                                                                )
                                                            }
                                                            disabled={
                                                                !selectedSplitBill ||
                                                                getItemQuantityInSplit(
                                                                    item.id,
                                                                    selectedSplitBill?.id
                                                                ) === 0
                                                            }
                                                            className={`w-6 h-6 flex items-center justify-center rounded text-sm font-bold transition-colors ${selectedSplitBill &&
                                                                    getItemQuantityInSplit(
                                                                        item.id,
                                                                        selectedSplitBill?.id
                                                                    ) > 0
                                                                    ? "bg-red-500 text-white hover:bg-red-600"
                                                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                                }`}
                                                            title="Remove from selected split"
                                                        >
                                                            -
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                handleAddItemToSplit(
                                                                    item.id,
                                                                    selectedSplitBill?.id
                                                                )
                                                            }
                                                            disabled={
                                                                !selectedSplitBill ||
                                                                getRemainingQuantity(item.id) <= 0
                                                            }
                                                            className={`w-6 h-6 flex items-center justify-center rounded text-sm font-bold transition-colors ${selectedSplitBill &&
                                                                    getRemainingQuantity(item.id) > 0
                                                                    ? "bg-green-500 text-white hover:bg-green-600"
                                                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                                }`}
                                                            title="Add to selected split"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary */}
                            <div className="border-gray-200 pt-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-800">
                                        Total Items:
                                    </span>
                                    <span className="text-sm font-bold text-gray-800">
                                        {splitItems.reduce(
                                            (sum, item) => sum + item.quantity,
                                            0
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-800">
                                        Sub Total:
                                    </span>
                                    <span className="text-sm font-bold text-gray-800">
                                        €
                                        {splitItems.length > 0
                                            ? (
                                                splitItems.reduce((sum, item) => sum + item.totalPrice, 0) /
                                                (1 + getTaxRate() / 100)
                                            ).toFixed(2)
                                            : "0.00"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-800">
                                        Tax:
                                    </span>
                                    <span className="text-sm font-bold text-gray-800">
                                        €
                                        {splitItems.length > 0
                                            ? (
                                                (splitItems.reduce((sum, item) => sum + item.totalPrice, 0) *
                                                    getTaxRate()) /
                                                100 /
                                                (1 + getTaxRate() / 100)
                                            ).toFixed(2)
                                            : "0.00"}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-800">
                                        Total Payable:
                                    </span>
                                    <span className="text-lg font-bold text-primary">
                                        €
                                        {splitItems.length > 0
                                            ? splitItems.reduce((sum, item) => sum + item.totalPrice, 0).toFixed(2)
                                            : "0.00"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right Section - Split Bills */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Split Bills
                            </h3>

                            {/* Split Creation */}
                            {splitBills.length === 0 && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="text-sm text-blue-800 font-medium mb-2">
                                        Maximum Split(s): {calculateMaxSplits()}
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            min="1"
                                            max={calculateMaxSplits()}
                                            value={totalSplit}
                                            onChange={(e) => setTotalSplit(e.target.value)}
                                            placeholder="Enter number of splits"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                                        />
                                        <button
                                            onClick={handleSplitGo}
                                            disabled={
                                                !totalSplit ||
                                                parseInt(totalSplit) <= 0 ||
                                                parseInt(totalSplit) > calculateMaxSplits()
                                            }
                                            className={`px-6 py-2 font-medium rounded-lg transition-colors ${totalSplit &&
                                                    parseInt(totalSplit) > 0 &&
                                                    parseInt(totalSplit) <= calculateMaxSplits()
                                                    ? "bg-primary text-white hover:bg-primary/90"
                                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                }`}
                                        >
                                            Go
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Split Bills Display */}
                            {splitBills.length > 0 && (
                                <div className="grid grid-cols-2 gap-4">
                                    {splitBills.map((splitBill) => (
                                        <div
                                            key={splitBill.id}
                                            className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${selectedSplitBill?.id === splitBill.id
                                                    ? "border-primary bg-primary/5"
                                                    : "border-gray-200 hover:border-gray-300"
                                                }`}
                                            onClick={() => setSelectedSplitBill(splitBill)}
                                        >
                                            {/* Header */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-gray-800">
                                                        Split Bill {splitBill.id}
                                                    </span>
                                                    {selectedSplitBill?.id === splitBill.id && (
                                                        <CheckCircle
                                                            size={16}
                                                            className="text-green-600"
                                                        />
                                                    )}
                                                    {splitBill.paid && (
                                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                                            PAID
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRemoveSplitBill(splitBill.id);
                                                    }}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>

                                            {/* Customer Selection */}
                                            <div className="mb-3">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Customer:
                                                </label>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowCustomerModal(true);
                                                    }}
                                                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary bg-white hover:bg-gray-50 text-left flex items-center justify-between"
                                                >
                                                    <span className="truncate">
                                                        {selectedCustomer ? selectedCustomer.name : 'Select Customer'}
                                                    </span>
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                            </div>

                                            {/* Summary */}
                                            <div className="text-xs space-y-1">
                                                <div className="flex justify-between">
                                                    <span>Sub Total:</span>
                                                    <span>
                                                        €{(splitBill.subtotal || 0).toFixed(2)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Disc Amt(%):</span>
                                                    <span>
                                                        €{(splitBill.discount || 0).toFixed(2)}X
                                                    </span>
                                                </div>
                                                <div className="flex justify-between font-bold border-t border-gray-200 pt-1">
                                                    <span>Total Payable:</span>
                                                    <span>
                                                        €{(splitBill.total || 0).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Checkout Button */}
                                            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-1">
                                                <button
                                                    disabled={!splitBill.items || splitBill.items.length === 0}
                                                    className={`w-full mt-3 text-xs font-medium py-2 px-3 rounded transition-colors ${areAllItemsDistributed()
                                                            ? "bg-green-500 text-white hover:bg-green-600"
                                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                        }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (areAllItemsDistributed()) {
                                                            setSelectedSplitBill(splitBill);
                                                            setSplitBillToRemove(splitBill.id);
                                                            resetFinalizeSaleModalForSplitBill();
                                                            setIsSinglePayMode(false);
                                                            setShowFinalizeSaleModal(true);
                                                        }
                                                    }}
                                                >
                                                    Ok
                                                </button>
                                                <button
                                                    disabled={!areAllItemsDistributed()}
                                                    className={`w-full mt-3 text-xs font-medium py-2 px-3 rounded transition-colors ${areAllItemsDistributed()
                                                            ? "bg-green-500 text-white hover:bg-green-600"
                                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                        }`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (areAllItemsDistributed()) {
                                                            setSelectedSplitBill(splitBill);
                                                            setSplitBillToRemove(splitBill.id);
                                                            resetFinalizeSaleModalForSplitBill();
                                                            setIsSinglePayMode(false);
                                                            setShowFinalizeSaleModal(true);
                                                        }
                                                    }}
                                                >
                                                    Print
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SplitBillModal;
