import { useState } from "react";

export default function ManageOrderDetailsModal({
    order,
    isOpen,
    onClose,
    foodDetails
}) {
    if (!isOpen) return null;
    console.log(order);
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-3 relative">
                {/* Close Button */}
                <h2 className="text-xl font-bold">Order Details</h2>

                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>

                {/* Header */}
                <div className="my-4 border-t">
                    <h2 className="font-semibold text-lg">
                        ORG-{order.id} • {order.order_type}
                    </h2>
                    <p className="text-sm text-gray-500">{order.orderDate} {order.orderTime}</p>
                </div>

                {/* Items */}
                <div className="mb-4">
                    <h3 className="font-semibold mb-2">Items</h3>
                    {/* {order} */}
                    {foodDetails.map((it, idx) => {
                        const details = JSON.parse(it.food_details);

                        return (
                            <div
                                key={idx}
                                className="flex justify-between text-sm py-1"
                            >
                                <span>
                                    {it.quantity} × {details.food.name}
                                </span>
                                <span>
                                    &euro; &nbsp;
                                    {(it.quantity * it.price).toFixed(2)}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                        <h3 className="font-semibold">Payment</h3>
                        <p>Method: {order.payment_method || "—"}</p>
                        <p>
                            Amount: &euro;
                            {order.order_amount.toFixed(2)}
                        </p>
                        <p>
                            Status:{" "}
                            <span
                                className={
                                    order.paymentStatus === "paid" ? "text-green-600 capitalize" : "text-red-600 capitalize"
                                }
                            >
                                {order.paymentStatus}
                            </span>
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold">Customer</h3>
                        <p>{order.customerData?.name}</p>
                        <p>{order.customerData?.phone}</p>
                        <p>{order.order_type === "instore" ? "-" : order.customerData?.address}</p>
                    </div>
                </div>

                {/* Status */}
                <div className="mb-4">
                    <span
                        className={`px-3 py-1 rounded text-xs font-medium 
                            ${order.order_status === "in-progress"
                                ? "bg-blue-100 text-blue-700"
                                : order.order_status === "cancel"
                                    ? "bg-red-100 text-red-700"
                                    : order.order_status === "new"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-green-100 text-green-700"}`}
                    >
                        {order.order_status}
                    </span>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 justify-end gap-3">
                    <button className="px-4 py-2 bg-primary text-white rounded hover:bg-blue-700">
                        Update Status
                    </button>
                    <button className="px-4 py-2 bg-primary text-white rounded hover:bg-green-700">
                        Pay
                    </button>
                    <button className="px-4 py-2 bg-primary text-white rounded hover:bg-gray-700">
                        Print Invoice
                    </button>
                </div>
            </div>
        </div>
    );
}
