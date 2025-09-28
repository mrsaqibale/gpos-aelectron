import React from "react";

const InvoiceOptions = ({
    resetFinalizeSaleModalForSinglePay,
    setIsSinglePayMode,
    selectedPlacedOrder,
    setCartItems,
    setCartItemId,
    setSelectedCustomer,
    setAppliedCoupon,
    setShowFinalizeSaleModal,
    setShowInvoiceOptions,
    handleOpenSplitBillModal,
}) => {
    const handleSinglePay = () => {
        resetFinalizeSaleModalForSinglePay();
        setIsSinglePayMode(false);

        if (selectedPlacedOrder && selectedPlacedOrder.items) {
            const cartItemsFromOrder = selectedPlacedOrder.items.map((item, index) => {
                let variations = {};
                let adons = [];

                try {
                    variations =
                        typeof item.variations === "string"
                            ? JSON.parse(item.variations)
                            : item.variations || {};

                    adons =
                        typeof item.adons === "string"
                            ? JSON.parse(item.adons)
                            : item.adons || [];
                } catch (error) {
                    console.error("Error parsing variations/addons for item:", item, error);
                }

                return {
                    id: Date.now() + index,
                    food: item.food,
                    variations,
                    adons,
                    quantity: item.quantity,
                    totalPrice: item.totalPrice,
                    addedAt: new Date().toISOString(),
                };
            });

            setCartItems(cartItemsFromOrder);
            setCartItemId(Date.now() + cartItemsFromOrder.length + 1);

            if (selectedPlacedOrder.customer) {
                setSelectedCustomer(selectedPlacedOrder.customer);
            }

            if (selectedPlacedOrder.coupon) {
                setAppliedCoupon(selectedPlacedOrder.coupon);
            }
        }

        setShowFinalizeSaleModal(true);
        setShowInvoiceOptions(false);
    };

    return (
        <div data-invoice-options className="absolute bottom-32 h-15 left-10 transform -translate-x-7 bg-gray-200 rounded-lg p-2 shadow-lg z-10">
            <div className="flex flex-col gap-1">
                <button
                    onClick={() => {
                        resetFinalizeSaleModalForSinglePay();
                        setIsSinglePayMode(false); // Don't set to true for existing orders
                        // Load the selected order's data into the cart for payment processing
                        if (selectedPlacedOrder && selectedPlacedOrder.items) {
                            // Convert order items back to cart items format
                            const cartItemsFromOrder = selectedPlacedOrder.items.map((item, index) => {
                                // Parse variations and addons from JSON if they're strings
                                let variations = {};
                                let adons = [];

                                try {
                                    if (typeof item.variations === 'string') {
                                        variations = JSON.parse(item.variations);
                                    } else {
                                        variations = item.variations || {};
                                    }

                                    if (typeof item.adons === 'string') {
                                        adons = JSON.parse(item.adons);
                                    } else {
                                        adons = item.adons || [];
                                    }
                                } catch (error) {
                                    console.error('Error parsing variations/addons for item:', item, error);
                                }

                                return {
                                    id: Date.now() + index, // Generate unique IDs
                                    food: item.food,
                                    variations: variations,
                                    adons: adons,
                                    quantity: item.quantity,
                                    totalPrice: item.totalPrice,
                                    addedAt: new Date().toISOString()
                                };
                            });

                            // Load order data into cart for payment processing
                            setCartItems(cartItemsFromOrder);
                            setCartItemId(Date.now() + cartItemsFromOrder.length + 1);

                            // Load customer information
                            if (selectedPlacedOrder.customer) {
                                setSelectedCustomer(selectedPlacedOrder.customer);
                            }

                            // Load applied coupon if any
                            if (selectedPlacedOrder.coupon) {
                                setAppliedCoupon(selectedPlacedOrder.coupon);
                            }
                        }
                        setShowFinalizeSaleModal(true);
                        setShowInvoiceOptions(false);
                    }}
                    className="w-32 bg-gray-300 text-black font-medium rounded px-1 text-center hover:bg-gray-400 transition-colors text-xs">
                    Single Pay
                </button>
                {selectedPlacedOrder.items.length > 1 && (
                    <button
                        onClick={handleOpenSplitBillModal}
                        className="w-32 bg-gray-300 text-black font-medium rounded px-1 text-center hover:bg-gray-400 transition-colors text-xs">
                        Split Bill
                    </button>
                )}
            </div>
        </div>
    );
};

export default InvoiceOptions;
