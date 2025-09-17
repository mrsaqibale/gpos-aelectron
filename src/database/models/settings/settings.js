import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic path resolution for both development and production
const getDynamicPath = (relativePath) => {
  try {
    const devPath = path.join(__dirname, '../../../', relativePath);
    const prodPath = path.join(__dirname, '../../../../', relativePath);
    if (fs.existsSync(devPath)) {
      return devPath;
    } else if (fs.existsSync(prodPath)) {
      return prodPath;
    } else {
      return devPath;
    }
  } catch (error) {
    console.error(`Failed to resolve path: ${relativePath}`, error);
    return path.join(__dirname, '../../../', relativePath);
  }
};

const dbPath = getDynamicPath('pos.db');
const db = new Database(dbPath);

export function errorResponse(message) {
  return { success: false, message };
}

function getExistingSettingsInternal() {
  const stmt = db.prepare('SELECT * FROM settings LIMIT 1');
  return stmt.get();
}

export function getSettings() {
  try {
    const row = getExistingSettingsInternal();
    if (!row) return { success: true, data: null };
    return { success: true, data: row };
  } catch (err) {
    console.error('Error getting settings:', err);
    return errorResponse(err.message);
  }
}

export function upsertSettings(settingsData) {
  try {
    const existing = getExistingSettingsInternal();

    // Normalize keys from renderer to DB column names
    // Business Information
    const data = {
      business_name: settingsData.business_name ?? settingsData.businessName ?? null,
      phone_number: settingsData.phone_number ?? settingsData.phoneNumber ?? null,
      country: settingsData.country ?? null,
      description: settingsData.description ?? null,
      logo_file: settingsData.logo_file ?? null,
      logo_preview: settingsData.logo_preview ?? null,
      address: settingsData.address ?? null,
      latitude: settingsData.latitude ?? null,
      longitude: settingsData.longitude ?? null,
      // Finance & Tax
      currency: settingsData.currency ?? null,
      currency_symbol_position: settingsData.currency_symbol_position ?? settingsData.currencySymbolPosition ?? null,
      digit_after_decimal_point: settingsData.digit_after_decimal_point ?? settingsData.digitAfterDecimalPoint ?? null,
      tax_rate: settingsData.tax_rate ?? settingsData.taxRate ?? null,
      standard_tax: settingsData.standard_tax ?? settingsData.standardTax ?? null,
      food_tax: settingsData.food_tax ?? settingsData.foodTax ?? null,
      time_zone: settingsData.time_zone ?? settingsData.timeZone ?? null,
      time_format: settingsData.time_format ?? settingsData.timeFormat ?? null,
      // Order Configuration
      minimum_order_amount: settingsData.minimum_order_amount ?? settingsData.minimumOrderAmount ?? null,
      order_place_setting: settingsData.order_place_setting ?? settingsData.orderPlaceSetting ?? null,
      delivery_min_time: settingsData.delivery_min_time ?? settingsData.deliveryMinTime ?? null,
      delivery_max_time: settingsData.delivery_max_time ?? settingsData.deliveryMaxTime ?? null,
      delivery_unit: settingsData.delivery_unit ?? settingsData.deliveryUnit ?? null,
      dine_in_time: settingsData.dine_in_time ?? settingsData.dineInTime ?? null,
      dine_in_unit: settingsData.dine_in_unit ?? settingsData.dineInUnit ?? null,
      dine_in_orders: settingsData.dine_in_orders ?? settingsData.dineInOrders ?? null,
      in_store_orders: settingsData.in_store_orders ?? settingsData.inStoreOrders ?? null,
      takeaway_orders: settingsData.takeaway_orders ?? settingsData.takeawayOrders ?? null,
      delivery_orders: settingsData.delivery_orders ?? settingsData.deliveryOrders ?? null,
      cashier_can_cancel_order: settingsData.cashier_can_cancel_order ?? settingsData.cashierCanCancelOrder ?? null,
      // Delivery Management
      free_delivery_in: settingsData.free_delivery_in ?? settingsData.freeDeliveryIn ?? null,
      delivery_fee_per_km: settingsData.delivery_fee_per_km ?? settingsData.deliveryFeePerKm ?? null,
      maximum_delivery_range: settingsData.maximum_delivery_range ?? settingsData.maximumDeliveryRange ?? null,
      minimum_delivery_order_amount: settingsData.minimum_delivery_order_amount ?? settingsData.minimumDeliveryOrderAmount ?? null,
      // Schedule
      monday_open: settingsData.monday_open ?? settingsData?.schedule?.monday?.open ?? settingsData?.monday?.open ?? null,
      monday_close: settingsData.monday_close ?? settingsData?.schedule?.monday?.close ?? settingsData?.monday?.close ?? null,
      tuesday_open: settingsData.tuesday_open ?? settingsData?.schedule?.tuesday?.open ?? settingsData?.tuesday?.open ?? null,
      tuesday_close: settingsData.tuesday_close ?? settingsData?.schedule?.tuesday?.close ?? settingsData?.tuesday?.close ?? null,
      wednesday_open: settingsData.wednesday_open ?? settingsData?.schedule?.wednesday?.open ?? settingsData?.wednesday?.open ?? null,
      wednesday_close: settingsData.wednesday_close ?? settingsData?.schedule?.wednesday?.close ?? settingsData?.wednesday?.close ?? null,
      thursday_open: settingsData.thursday_open ?? settingsData?.schedule?.thursday?.open ?? settingsData?.thursday?.open ?? null,
      thursday_close: settingsData.thursday_close ?? settingsData?.schedule?.thursday?.close ?? settingsData?.thursday?.close ?? null,
      friday_open: settingsData.friday_open ?? settingsData?.schedule?.friday?.open ?? settingsData?.friday?.open ?? null,
      friday_close: settingsData.friday_close ?? settingsData?.schedule?.friday?.close ?? settingsData?.friday?.close ?? null,
      saturday_open: settingsData.saturday_open ?? settingsData?.schedule?.saturday?.open ?? settingsData?.saturday?.open ?? null,
      saturday_close: settingsData.saturday_close ?? settingsData?.schedule?.saturday?.close ?? settingsData?.saturday?.close ?? null,
      sunday_open: settingsData.sunday_open ?? settingsData?.schedule?.sunday?.open ?? settingsData?.sunday?.open ?? null,
      sunday_close: settingsData.sunday_close ?? settingsData?.schedule?.sunday?.close ?? settingsData?.sunday?.close ?? null,
      // Appearance
      default_theme: settingsData.default_theme ?? settingsData.defaultTheme ?? null,
      select_keyboard: settingsData.select_keyboard ?? settingsData.selectKeyboard ?? null,
      select_order_bell: settingsData.select_order_bell ?? settingsData.selectOrderBell ?? null,
      auto_save_interval: settingsData.auto_save_interval ?? settingsData.autoSaveInterval ?? null,
      sound_alert: settingsData.sound_alert ?? settingsData.soundAlert ?? null,
      notifications: settingsData.notifications ?? null,
      isSyncronized: settingsData.isSyncronized ?? 0,
    };

    if (existing) {
      // Update existing row
      const fields = Object.keys(data).map((k) => `${k} = ?`);
      const values = Object.values(data);
      const sql = `UPDATE settings SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      const stmt = db.prepare(sql);
      const result = stmt.run(...values, existing.id);
      return { success: true, message: 'Settings updated', changes: result.changes };
    } else {
      // Insert new row
      const cols = Object.keys(data);
      const placeholders = cols.map(() => '?').join(', ');
      const values = Object.values(data);
      const sql = `INSERT INTO settings (${cols.join(', ')}) VALUES (${placeholders})`;
      const stmt = db.prepare(sql);
      const info = stmt.run(...values);
      return { success: true, message: 'Settings created', id: info.lastInsertRowid };
    }
  } catch (err) {
    console.error('Error upserting settings:', err);
    return errorResponse(err.message);
  }
}

export function checkSettingsTable() {
  try {
    const tableStmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='settings'");
    const tableExists = tableStmt.get();
    if (!tableExists) return { success: true, tableExists: false, hasData: false };
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM settings');
    const result = countStmt.get();
    return { success: true, tableExists: true, hasData: result.count > 0 };
  } catch (err) {
    console.error('Error checking settings table:', err);
    return errorResponse(err.message);
  }
}


