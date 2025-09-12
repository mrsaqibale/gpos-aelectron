import React from 'react';

const LabelRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 text-sm">
    <span className="text-gray-600">{label}</span>
    <span className="text-gray-900 font-medium">{value ?? '—'}</span>
  </div>
);

const DividerHeading = ({ children }) => (
  <div className="border-b border-gray-200 pb-2 mb-3">
    <span className="text-[13px] font-semibold text-gray-700">{children}</span>
  </div>
);

const Badge = ({ ok }) => (
  <span className={`inline-flex items-center justify-center h-7 px-3 rounded-full text-xs font-semibold ${
    ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'
  }`}>
    {ok ? 'YES' : 'NO'}
  </span>
);

const CustomerInformation = ({ isOpen, onClose, customer, onEditCustomer, onChangeCustomer }) => {
  if (!isOpen) return null;

  const customerName = customer?.name ?? 'N/A';
  const customerPhone = customer?.phone ?? 'N/A';
  const customerEmail = customer?.email ?? 'N/A';
  const totalOrders = customer?.orderCount ?? 0;
  const isLoyal = Boolean(customer?.isLoyal);
  const lastOrderDate = customer?.lastOrderDate ?? '—';
  const addresses = (customer?.addresses ?? []).slice(0, 3);

  return (
    <div className="fixed inset-0 bg-black/40 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl">
        {/* Header */}
        <div className="bg-black text-white px-4 py-3 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full" />
            <h3 className="font-semibold">Customer Information</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white">✕</button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Personal Information */}
            <div className="border border-gray-200 rounded-lg p-4">
              <DividerHeading>Personal Information</DividerHeading>
              <LabelRow label="Name:" value={customerName} />
              <LabelRow label="Phone:" value={customerPhone} />
              <LabelRow label="Email:" value={customerEmail} />
            </div>

            {/* Order Information */}
            <div className="border border-gray-200 rounded-lg p-4">
              <DividerHeading>Order Information</DividerHeading>
              <LabelRow label="Total Orders:" value={totalOrders} />
              <div className="flex items-center justify-between py-2 text-sm">
                <span className="text-gray-600">Loyalty Status:</span>
                <Badge ok={isLoyal} />
              </div>
              <LabelRow label="Last Order:" value={lastOrderDate} />
            </div>
          </div>

          {/* Address Information */}
          <div className="border border-gray-200 rounded-lg p-4">
            <DividerHeading>Address Information</DividerHeading>
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="flex items-center justify-between py-2 text-sm">
                <span className="text-gray-600">{`Delivery Address ${idx + 1}:`}</span>
                <span className="text-gray-900 font-medium text-right">
                  {addresses[idx]?.address ?? '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 pt-2 grid grid-cols-4 gap-3">
          <button onClick={onClose} className="col-span-1 h-11 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300">Back</button>
          <button onClick={onChangeCustomer} className="col-span-1 h-11 rounded-md bg-gray-600 text-white hover:bg-gray-700">Change Customer</button>
          <button onClick={() => onEditCustomer?.(customer)} className="col-span-1 h-11 rounded-md bg-black text-white hover:bg-black/90">Edit Customer</button>
          <button onClick={onClose} className="col-span-1 h-11 rounded-md bg-black text-white hover:bg-black/90">OK</button>
        </div>
      </div>
    </div>
  );
};

export default CustomerInformation;