import React from "react";
import {
    Utensils,
    ShoppingBag,
    Truck,
    Printer,
    FileText,
    Receipt,
    ChevronDown,
    ChevronUp,
} from "lucide-react";

const PlaceOrderComponent = ({
    placedOrders = [],
    runningOrdersSearchQuery = "",
    currentTime = new Date(),
    expandedOrders,
    selectedPlacedOrder,
    setSelectedPlacedOrder,
    handleToggleOrderExpansion,
    getStatusBadgeStyle,
    foodDetails,
    handleConvertDraftToOrder,
    handleOpenStatusUpdateModal,
}) => {
    return (
        <div className="flex-1">
            {placedOrders.length > 0 ? (
                placedOrders
                    .filter(order => {
                        if (!runningOrdersSearchQuery.trim()) return true;
                        const searchTerm = runningOrdersSearchQuery.toLowerCase().trim();
                        return order.orderNumber.toString().toLowerCase().includes(searchTerm);
                    })
                    .map((order) => {
                        // Calculate time elapsed (static calculation, no auto-update)
                        const orderTime = new Date(order.placedAt);
                        const diffMs = currentTime - orderTime;
                        const diffMins = Math.floor(diffMs / (1000 * 60));
                        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                        let timeAgo;
                        if (diffDays > 0) {
                            timeAgo = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
                        } else if (diffHours > 0) {
                            timeAgo = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
                        } else if (diffMins > 0) {
                            timeAgo = `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
                        } else {
                            timeAgo = 'Just now';
                        }

                        // Get order type styling
                        const getOrderTypeStyle = (type) => {
                            switch (type) {
                                case 'Dine In':
                                    return {
                                        bgColor: 'bg-blue-100',
                                        textColor: 'text-blue-700',
                                        icon: <Utensils size={12} />
                                    };
                                case 'Collection':
                                    return {
                                        bgColor: 'bg-orange-100',
                                        textColor: 'text-orange-700',
                                        icon: <ShoppingBag size={12} />
                                    };
                                case 'Delivery':
                                    return {
                                        bgColor: 'bg-green-100',
                                        textColor: 'text-green-700',
                                        icon: <Truck size={12} />
                                    };
                                case 'In Store':
                                    return {
                                        bgColor: 'bg-purple-100',
                                        textColor: 'text-purple-700',
                                        icon: <Printer size={12} />
                                    };
                                case 'Draft':
                                    return {
                                        bgColor: 'bg-yellow-100',
                                        textColor: 'text-yellow-700',
                                        icon: <FileText size={12} />
                                    };
                                default:
                                    return {
                                        bgColor: 'bg-gray-100',
                                        textColor: 'text-gray-700',
                                        icon: <Receipt size={12} />
                                    };
                            }
                        };

                        const orderTypeStyle = getOrderTypeStyle(order.orderType);

                        return (
                            <div
                                key={order.id}
                                className={`relative bg-white border border-gray-200 hover:border-primary hover:shadow-md rounded-lg p-2 cursor-pointer transition-all duration-200 ${selectedPlacedOrder?.id === order.id
                                    ? 'border-primary b-2 bg-primaryExtraLight shadow-md'
                                    : 'hover:bg-gray-50'
                                    }`}
                                onClick={() => setSelectedPlacedOrder(order)}
                            >
                                {/* Dropdown arrow */}
                                <div
                                    className="absolute top-3 right-3 cursor-pointer"
                                    onClick={(e) => handleToggleOrderExpansion(order.id, e)}
                                >
                                    {expandedOrders.has(order.id) ? (
                                        <ChevronUp size={20} className="text-blue-500" />
                                    ) : (
                                        <ChevronDown size={20} className="text-gray-400" />
                                    )}
                                </div>

                                {/* Order header */}
                                <div className={`flex items-start justify-between ${expandedOrders.has(order.id) ? 'bg-blue-50 p-3 border-b border-blue-200  -m-3 rounded-t-lg' : ''}`}>
                                    <div className="flex-1">
                                        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-2 mb-2">
                                            <h3 className="font-semibold text-gray-800 text-xs sm:text-xs md:text-xs lg:text-sm">
                                                #{order.orderNumber}
                                            </h3>
                                            <div>
                                                <span className={`inline-flex items-center gap-1 p-1 rounded-full text-xs font-medium ${orderTypeStyle.bgColor} ${orderTypeStyle.textColor}`}>
                                                    {orderTypeStyle.icon}
                                                    {order.orderType === 'Dine In' ? `${order.orderType} - ${order.table}` : order.orderType}
                                                </span>

                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="">
                                                <p className="text-xs sm:text-xs md:text-xs lg:text-sm font-medium text-gray-800">
                                                    {order.customer.name}
                                                </p>
                                                <p className="text-xs text-gray-500">{timeAgo}</p>
                                            </div>
                                            <span className={`inline-block px-1 py-1 text-xs font-medium rounded-full ${getStatusBadgeStyle(order.status || 'Pending')}`}>
                                                {order.status === 'new'
                                                    ? 'New'
                                                    : order.status === 'in_progress'
                                                        ? 'Progress'
                                                        : order.status || 'PENDING'}
                                            </span>
                                        </div>

                                    </div>

                                </div>

                                {/* Expanded Order Details */}
                                {expandedOrders.has(order.id) && (
                                    <div className="pt-4">
                                        {/* Order Items */}
                                        <div className="space-y-2 mb-4">
                                            <h4 className="text-xs sm:text-xs md:text-xs lg:text-xs xl:text-sm font-semibold text-gray-800 mb-2">Order Items:</h4>
                                            {order.items.map((item, index) => (
                                                <div key={index} className="flex justify-between items-start text-xs sm:text-xs md:text-xs lg:text-xs xl:text-sm">
                                                    <div className="flex-1">
                                                        <div className="flex items-center">
                                                            <span className="font-medium text-gray-800"><span className="text-blue-600 ml-1">x{item.quantity}</span> {item.food?.name || 'Unknown Food'}</span>
                                                        </div>

                                                        {/* Show variations if any */}
                                                        {item.variations && Object.keys(item.variations).length > 0 && (
                                                            <div className="text-xs text-gray-600 mt-1">
                                                                {Object.entries(item.variations).map(([variationId, selectedOption]) => {
                                                                    const variation = foodDetails?.variations?.find(v => v.id === parseInt(variationId));
                                                                    const variationName = variation?.name || variationId;
                                                                    const selections = Array.isArray(selectedOption) ? selectedOption : [selectedOption];

                                                                    return (
                                                                        <div key={variationId} className="flex items-center gap-1">
                                                                            <span className="text-gray-500">• {variationName}:</span>
                                                                            <span className="text-gray-700">
                                                                                {selections.map((optionId, idx) => {
                                                                                    const option = variation?.options?.find(o => o.id === parseInt(optionId));
                                                                                    return (
                                                                                        <span key={optionId}>
                                                                                            {option?.option_name || optionId}
                                                                                            {idx < selections.length - 1 ? ', ' : ''}
                                                                                        </span>
                                                                                    );
                                                                                })}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}

                                                        {/* Show addons if any */}
                                                        {item.adons && item.adons.length > 0 && (
                                                            <div className="text-xs text-gray-600 mt-1">
                                                                {item.adons.map((addonId, idx) => {
                                                                    const addon = foodDetails?.adons?.find(a => a.id === parseInt(addonId));
                                                                    const addonName = addon?.name || addonId;
                                                                    const addonPrice = addon?.price;

                                                                    return (
                                                                        <div key={idx} className="flex items-center gap-1">
                                                                            <span className="text-gray-500">• Addon:</span>
                                                                            <span className="text-gray-700">{addonName}</span>
                                                                            {addonPrice && <span className="text-gray-500">(+€{addonPrice.toFixed(2)})</span>}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-gray-800">€{item.totalPrice.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Total Section */}
                                        <div className="border-t border-gray-200 pt-2 mb-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs sm:text-xs md:text-xs lg:text-xs xl:text-sm font-semibold text-gray-800">Total:</span>
                                                <span className="text-xs sm:text-xs md:text-sm lg:text-sm xl:text-md font-bold text-gray-800">€{order.total.toFixed(2)}</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        {/* <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 gap-3">
                                            {order.isDraft ? (
                                                // Draft order actions
                                                <>
                                                    <button
                                                        className="bg-gray-600 text-white text-xs sm:text-xs md:text-xs lg:text-xs font-medium p-1 rounded-lg hover:bg-gray-700 transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Handle view details
                                                            setSelectedPlacedOrder(order);
                                                        }}
                                                    >
                                                        View Details
                                                    </button>
                                                    <button
                                                        className="bg-green-600 text-white text-xs sm:text-sm md:text-xs lg:text-xs font-medium p-1 rounded-lg hover:bg-green-700 transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Handle convert to order
                                                            handleConvertDraftToOrder(order);
                                                        }}
                                                    >
                                                        Convert to Order
                                                    </button>
                                                </>
                                            ) : (
                                                // Regular order actions
                                                <>
                                                    <button
                                                        className="flex-1 bg-gray-600 text-white text-xs sm:text-sm md:text-xs lg:text-sm font-medium py-1 rounded-lg hover:bg-gray-700 transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Handle view details
                                                            setSelectedPlacedOrder(order);
                                                        }}
                                                    >
                                                        View Details
                                                    </button>
                                                    <button
                                                        className="flex-1 bg-blue-600 text-white text-xs sm:text-sm md:text-xs lg:text-sm font-medium p-1 rounded-lg hover:bg-blue-700 transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Handle mark as action
                                                            handleOpenStatusUpdateModal(order, e);
                                                        }}
                                                    >
                                                        Mark As
                                                    </button>
                                                </>
                                            )}
                                        </div> */}
                                    </div>
                                )}
                            </div>
                        );
                    })
            ) : (
                <div className="text-center py-8">
                    <div className="text-gray-500 text-xs sm:text-sm md:text-xs lg:text-sm">No active orders</div>
                    <div className="text-gray-400 text-xs mt-2">Place orders to see active orders here</div>
                </div>
            )}
        </div>
    );

};

export default PlaceOrderComponent;