import React, { useMemo } from 'react';

/**
 * PrintableInvoice
 * - Standalone, presentation-only invoice component
 * - Controlled entirely via props so RunningOrders can pass values later
 * - Does NOT depend on app state; safe to import anywhere
 *
 * Props:
 * - isOpen: boolean (if you want to show as a modal overlay)
 * - onClose: function
 * - onPrint: function (optional; if not provided, window.print() is used)
 * - header: { title, subtitle, logoTextTop, logoTextBottom }
 * - meta: { orderType, orderNumber, createdAt, placedAt }
 * - customer: { name, phone, email, address, table }
 * - items: Array<{ quantity, name, note?, totalPrice: number, variations?: Record<string, number|number[]>, addons?: Array<{ name: string, price?: number }> }>
 * - totals: { subtotal, bagFee, serviceFee, deliveryCharge, tax, total, currencySymbol }
 * - paymentStatus: 'PAID' | 'UNPAID' | string
 * - notes: string
 */
const PrintableInvoice = ({
	isOpen = true,
	onClose,
	onPrint,
	header = {
		title: 'Saffron Indian Cuisine Cashel',
		subtitle: 'Tel: 06262080',
		logoTextTop: 'G',
		logoTextBottom: 'POS',
	},
	meta = {
		orderType: 'Dine In',
		orderNumber: '0000',
		createdAt: new Date().toISOString(),
		placedAt: undefined,
	},
	customer = {
		name: 'Walk-in Customer',
		phone: '',
		email: '',
		address: '',
		table: '',
	},
	items = [],
	totals,
	paymentStatus = 'PAID',
	notes = '',
}) => {
	const currencySymbol = totals?.currencySymbol ?? '€';

	// Derived totals if not fully provided
	const computed = useMemo(() => {
		const subtotal = totals?.subtotal ?? items.reduce((sum, it) => sum + (Number(it.totalPrice) || 0), 0);
		
		// Get settings for calculations
		const settings = typeof window !== 'undefined' ? (window.appSettings?.current || {}) : {};
		const taxRate = parseFloat(settings?.standard_tax || settings?.food_tax || 13.5);
		const deliveryFeePerKm = parseFloat(settings?.delivery_fee_per_km || 2.0);
		
		const bagFee = totals?.bagFee ?? 0.22;
		const serviceFee = totals?.serviceFee ?? (meta.orderType === 'Delivery' ? 0.75 : 0);
		const deliveryCharge = totals?.deliveryCharge ?? (meta.orderType === 'Delivery' ? deliveryFeePerKm : 0);
		const tax = totals?.tax ?? (subtotal * taxRate / 100);
		const total = totals?.total ?? (subtotal + bagFee + serviceFee + deliveryCharge + tax);
		return { subtotal, bagFee, serviceFee, deliveryCharge, tax, total };
	}, [items, meta.orderType, totals]);

	const formatDate = (iso) => {
		const d = new Date(iso || Date.now());
		return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
	};
	const formatTime = (iso) => {
		const d = new Date(iso || Date.now());
		return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
	};

	if (!isOpen) return null;

	const handlePrint = () => {
		if (onPrint) onPrint(); else window.print();
	};

	return (
		<div className="fixed inset-0 bg-[#00000089] bg-opacity-50 flex items-center justify-center z-50 p-4 print:bg-transparent print:p-0">
			<div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col print:shadow-none print:max-h-none print:max-w-none print:w-[80mm]">
				{/* Header */}
				<div className="p-4 border-b border-gray-200 flex justify-between items-center print:hidden">
					<h2 className="text-lg font-bold text-gray-800">Print Invoice</h2>
					<button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">✕</button>
				</div>

				{/* Content */}
				<div className="flex-1 overflow-y-auto p-4 print:p-0">
					<div className="bg-white border border-gray-300 rounded-lg p-6 print:p-2 print:border-0">
						{/* Logo */}
						<div className="text-center mb-4">
							<div className="w-16 h-16 mx-auto rounded-lg border-2 flex flex-col items-center justify-center mb-2 shadow-md">
								<span className="text-black font-bold text-2xl">{header.logoTextTop}</span>
								<span className="text-black font-medium text-xs">{header.logoTextBottom}</span>
							</div>
							<div className="text-center">
								<h1 className="text-lg font-bold text-gray-800">{header.title}</h1>
								<p className="text-sm text-gray-600">{header.subtitle}</p>
							</div>
						</div>

						<div className="border-t border-gray-300 my-4"></div>

						{/* Meta */}
						<div className="text-center mb-4">
							<h2 className="text-lg font-bold text-gray-800 uppercase">{meta.orderType}</h2>
							<p className="text-sm text-gray-600">Due: {formatDate(meta.placedAt || meta.createdAt)} ({formatTime(meta.placedAt || meta.createdAt)})</p>
							<p className="text-sm font-medium text-gray-800"># {meta.orderNumber}</p>
						</div>

						<div className="border-t border-gray-300 my-4"></div>

						{/* Items */}
						<div className="mb-4">
							{items.length > 0 ? items.map((item, idx) => (
								<div key={idx} className="flex justify-between items-start mb-2">
									<div className="flex-1">
										<div className="flex items-center">
											<span className="text-sm font-medium text-gray-800">{item.quantity} x {item.name}</span>
										</div>
										{item.variations && Object.keys(item.variations).length > 0 && (
											<div className="text-xs text-gray-600 ml-4 mt-1">
												{Object.entries(item.variations).map(([varName, selection]) => {
													const selections = Array.isArray(selection) ? selection : [selection];
													return (
														<div key={String(varName)} className="flex items-center gap-1">
															<span>• {String(varName)}:</span>
															<span>{selections.join(', ')}</span>
														</div>
													);
												})}
											</div>
										)}
										{item.addons && item.addons.length > 0 && (
											<div className="text-xs text-gray-600 ml-4 mt-1">
												{item.addons.map((ad, i2) => (
													<div key={i2} className="flex items-center gap-1">
														<span>• Addon: {ad.name}</span>
														{(ad.price != null) && <span>({currencySymbol}{Number(ad.price).toFixed(2)})</span>}
													</div>
												))}
											</div>
										)}
										{item.note && (
											<div className="text-xs text-gray-600 ml-4 mt-1">• {item.note}</div>
										)}
									</div>
									<span className="text-sm font-medium text-gray-800 ml-4">{currencySymbol}{Number(item.totalPrice || 0).toFixed(2)}</span>
								</div>
							)) : (
								<p className="text-center text-gray-500">No items</p>
							)}
						</div>

						<div className="border-t border-gray-300 my-4"></div>

						{/* Totals */}
						<div className="space-y-2 text-sm">
							<div className="flex justify-between">
								<span className="text-gray-600">Subtotal:</span>
								<span className="font-medium">{currencySymbol}{computed.subtotal.toFixed(2)}</span>
							</div>
							<div className="flex justify-between">
								<span className="text-gray-600">Bag Fee:</span>
								<span className="font-medium">{currencySymbol}{computed.bagFee.toFixed(2)}</span>
							</div>
							{meta.orderType === 'Delivery' && (
								<>
									<div className="flex justify-between">
										<span className="text-gray-600">Service Fee:</span>
										<span className="font-medium">{currencySymbol}{computed.serviceFee.toFixed(2)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-600">Delivery Charge:</span>
										<span className="font-medium">{currencySymbol}{computed.deliveryCharge.toFixed(2)}</span>
									</div>
								</>
							)}
							<div className="border-t border-gray-300 pt-2">
								<div className="flex justify-between">
									<span className="font-bold text-gray-800">TOTAL (Incl. VAT):</span>
									<span className="font-bold text-gray-800">{currencySymbol}{computed.total.toFixed(2)}</span>
								</div>
							</div>
						</div>

						<div className="border-t border-gray-300 my-4"></div>

						{/* Payment Status */}
						<div className="text-center mb-4">
							<div className={"text-lg font-bold " + (paymentStatus === 'PAID' ? 'text-green-600' : 'text-red-600')}>***** {paymentStatus} *****</div>
						</div>

						<div className="border-t border-gray-300 my-4"></div>

						{/* Customer */}
						<div className="mb-4">
							<h3 className="font-bold text-gray-800 mb-2">Customer Info:</h3>
							<div className="text-sm space-y-1">
								<div><span className="font-medium">Name:</span> {customer.name || 'Walk-in Customer'}</div>
								{(meta.orderType === 'Delivery' || customer.phone) && (
									<div><span className="font-medium">Phone:</span> {customer.phone || 'N/A'}</div>
								)}
								{customer.email && (<div><span className="font-medium">Email:</span> {customer.email}</div>)}
								{meta.orderType === 'Delivery' && (
									<div><span className="font-medium">Delivery Address:</span> {customer.address || 'N/A'}</div>
								)}
								{meta.orderType !== 'Delivery' && customer.table && customer.table !== 'None' && (
									<div><span className="font-medium">Table:</span> {customer.table}</div>
								)}
							</div>
						</div>

						<div className="border-t border-gray-300 my-4"></div>

						{/* Notes */}
						{notes && (
							<>
								<div className="mb-4">
									<h3 className="font-bold text-gray-800 mb-2">Notes:</h3>
									<p className="text-sm text-gray-700">{notes}</p>
								</div>
								<div className="border-t border-gray-300 my-4"></div>
							</>
						)}

						{/* Footer */}
						<div className="text-center">
							<p className="text-sm font-medium text-gray-800 mb-1">Thank You For Ordering!</p>
							<p className="text-xs text-gray-600">Powered By G Tech Nexa Limited</p>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="p-4 border-t border-gray-200 flex gap-3 print:hidden">
					<button onClick={handlePrint} className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:opacity-90 transition-colors font-medium">Print</button>
					<button onClick={onClose} className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">Close</button>
				</div>
			</div>
		</div>
	);
};

export default PrintableInvoice;

/**
 * printInvoiceNow
 * - Directly opens a new window with a lightweight HTML receipt and prints it
 * - Useful when you want to bypass React modal flow and just print
 */
export function printInvoiceNow({
	header = { title: 'Saffron Indian Cuisine Cashel', subtitle: 'Tel: 06262080' },
	meta = { orderType: 'Dine In', orderNumber: '0000', createdAt: new Date().toISOString() },
	customer = { name: 'Walk-in Customer', phone: '', email: '', address: '', table: '' },
	items = [],
	totals,
	paymentStatus = 'PAID',
	currencySymbol = '€',
	notes = '',
}) {
	const subtotal = totals?.subtotal ?? items.reduce((s, it) => s + (Number(it.totalPrice) || 0), 0);
	const bagFee = totals?.bagFee ?? 0.22;
	const serviceFee = totals?.serviceFee ?? (meta.orderType === 'Delivery' ? 0.75 : 0);
	const deliveryCharge = totals?.deliveryCharge ?? (meta.orderType === 'Delivery' ? 2.0 : 0);
	const tax = totals?.tax ?? ((subtotal * 0.135) / 1.135);
	const total = totals?.total ?? (subtotal + bagFee + serviceFee + deliveryCharge + tax);

	const formatDate = (iso) => {
		const d = new Date(iso || Date.now());
		return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
	};
	const formatTime = (iso) => {
		const d = new Date(iso || Date.now());
		return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
	};

	const w = window.open('', 'PRINT', 'height=600,width=400');
	if (!w) return;
	w.document.write(`<!doctype html><html><head><meta charset="utf-8" />
		<title>Invoice #${meta.orderNumber}</title>
		<style>
			*{box-sizing:border-box} body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#111}
			.wrapper{width:78mm;padding:8mm 4mm}
			.center{text-align:center}
			.h{font-weight:700}
			.small{font-size:12px;color:#555}
			.divider{border-top:1px solid #ddd;margin:8px 0}
			.row{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
			.item{margin:6px 0}
			.badge{font-weight:700;}
			.green{color:#16a34a}
			.red{color:#dc2626}
		</style></head><body>
		<div class="wrapper">
			<div class="center">
				<div class="h" style="font-size:18px">${header.title}</div>
				<div class="small">${header.subtitle || ''}</div>
			</div>
			<div class="divider"></div>
			<div class="center">
				<div class="h" style="text-transform:uppercase">${meta.orderType}</div>
				<div class="small">Due: ${formatDate(meta.placedAt || meta.createdAt)} (${formatTime(meta.placedAt || meta.createdAt)})</div>
				<div class="small h"># ${meta.orderNumber}</div>
			</div>
			<div class="divider"></div>
			<div>
				${items.map(it => `
					<div class="row item">
						<div style="flex:1">
							<div class="h">${it.quantity} x ${it.name}</div>
							${it.variations ? Object.entries(it.variations).map(([k,v])=>`<div class="small">• ${k}: ${Array.isArray(v)?v.join(', '):v}</div>`).join('') : ''}
							${it.addons ? it.addons.map(a=>`<div class="small">• Addon: ${a.name}${a.price!=null?` (${currencySymbol}${Number(a.price).toFixed(2)})`:''}</div>`).join('') : ''}
							${it.note ? `<div class="small">• ${it.note}</div>` : ''}
						</div>
						<div class="h">${currencySymbol}${Number(it.totalPrice||0).toFixed(2)}</div>
					</div>
				`).join('')}
			</div>
			<div class="divider"></div>
			<div class="small row"><div>Subtotal:</div><div class="h">${currencySymbol}${subtotal.toFixed(2)}</div></div>
			<div class="small row"><div>Bag Fee:</div><div class="h">${currencySymbol}${bagFee.toFixed(2)}</div></div>
			${meta.orderType==='Delivery' ? `
				<div class="small row"><div>Service Fee:</div><div class="h">${currencySymbol}${serviceFee.toFixed(2)}</div></div>
				<div class="small row"><div>Delivery Charge:</div><div class="h">${currencySymbol}${deliveryCharge.toFixed(2)}</div></div>
			` : ''}
			<div class="divider"></div>
			<div class="row"><div class="h">TOTAL (Incl. VAT):</div><div class="h">${currencySymbol}${total.toFixed(2)}</div></div>
			<div class="divider"></div>
			<div class="center ${paymentStatus==='PAID'?'green':'red'} badge">***** ${paymentStatus} *****</div>
			<div class="divider"></div>
			<div class="small">
				<div><span class="h">Name:</span> ${customer.name || 'Walk-in Customer'}</div>
				${(meta.orderType==='Delivery'||customer.phone)?`<div><span class="h">Phone:</span> ${customer.phone||'N/A'}</div>`:''}
				${customer.email?`<div><span class="h">Email:</span> ${customer.email}</div>`:''}
				${meta.orderType!=='Delivery' && customer.table && customer.table!=='None' ? `<div><span class="h">Table:</span> ${customer.table}</div>`:''}
				${meta.orderType==='Delivery'?`<div><span class="h">Delivery Address:</span> ${customer.address||'N/A'}</div>`:''}
			</div>
			${notes?`<div class="divider"></div><div class="small"><div class="h">Notes:</div><div>${notes}</div></div>`:''}
			<div class="divider"></div>
			<div class="center small">Thank You For Ordering!<br/>Powered By G Tech Nexa Limited</div>
		</div>
	</body></html>`);
	w.document.close();
	w.focus();
	w.print();
	w.close();
}
