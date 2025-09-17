import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic path resolution for both development and production
const getDynamicPath = (relativePath) => {
  try {
    // Match hotel model resolution: src/database/<file> in dev
    const devPath = path.join(__dirname, '../../', relativePath);
    const prodPath = path.join(__dirname, '../../../', relativePath);
    if (fs.existsSync(devPath)) {
      return devPath;
    } else if (fs.existsSync(prodPath)) {
      return prodPath;
    } else {
      return devPath;
    }
  } catch (error) {
    console.error(`Failed to resolve path: ${relativePath}`, error);
    return path.join(__dirname, '../../', relativePath);
  }
};

const dbPath = getDynamicPath('pos.db');
const db = new Database(dbPath);
const uploadsDir = getDynamicPath('uploads');
const settingsImagesDir = path.join(uploadsDir, 'settings');

// Ensure uploads/settings directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(settingsImagesDir)) {
  fs.mkdirSync(settingsImagesDir, { recursive: true });
}

function ensureSettingsTable() {
  try {
    const createSql = `
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        business_name TEXT,
        phone_number TEXT,
        country TEXT,
        description TEXT,
        logo_file TEXT,
        logo_preview TEXT,
        address TEXT,
        latitude REAL,
        longitude REAL,
        currency TEXT,
        currency_symbol_position TEXT,
        digit_after_decimal_point INTEGER,
        tax_rate NUMERIC,
        standard_tax NUMERIC,
        food_tax NUMERIC,
        time_zone TEXT,
        time_format TEXT,
        minimum_order_amount NUMERIC,
        order_place_setting TEXT,
        delivery_min_time INTEGER,
        delivery_max_time INTEGER,
        delivery_unit TEXT,
        dine_in_time INTEGER,
        dine_in_unit TEXT,
        dine_in_orders BOOLEAN,
        in_store_orders BOOLEAN,
        takeaway_orders BOOLEAN,
        delivery_orders BOOLEAN,
        cashier_can_cancel_order TEXT,
        free_delivery_in NUMERIC,
        delivery_fee_per_km NUMERIC,
        maximum_delivery_range NUMERIC,
        minimum_delivery_order_amount NUMERIC,
        monday_open TEXT,
        monday_close TEXT,
        tuesday_open TEXT,
        tuesday_close TEXT,
        wednesday_open TEXT,
        wednesday_close TEXT,
        thursday_open TEXT,
        thursday_close TEXT,
        friday_open TEXT,
        friday_close TEXT,
        saturday_open TEXT,
        saturday_close TEXT,
        sunday_open TEXT,
        sunday_close TEXT,
        default_theme TEXT,
        select_keyboard TEXT,
        select_order_bell TEXT,
        auto_save_interval INTEGER,
        sound_alert BOOLEAN,
        notifications BOOLEAN,
        isSyncronized BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME
      )
    `;
    db.exec(createSql);
  } catch (err) {
    console.error('Failed ensuring settings table:', err);
  }
}

function saveLogoFile(base64OrPath, originalFilename) {
  try {
    const timestamp = Date.now();
    const ext = path.extname(originalFilename || 'image.png') || '.png';
    const filename = `logo_${timestamp}${ext}`;
    const filePath = path.join(settingsImagesDir, filename);

    if (base64OrPath && typeof base64OrPath === 'string' && base64OrPath.startsWith('data:image')) {
      const base64Data = base64OrPath.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, buffer);
    } else if (base64OrPath && typeof base64OrPath === 'string') {
      if (fs.existsSync(base64OrPath)) {
        fs.copyFileSync(base64OrPath, filePath);
      } else {
        const buffer = Buffer.from(base64OrPath, 'base64');
        fs.writeFileSync(filePath, buffer);
      }
    }
    return `uploads/settings/${filename}`;
  } catch (err) {
    console.error('Error saving settings logo:', err);
    return null;
  }
}

export function errorResponse(message) {
  return { success: false, message };
}

function getExistingSettingsInternal() {
  ensureSettingsTable();
  const stmt = db.prepare('SELECT * FROM settings LIMIT 1');
  return stmt.get();
}

export function getSettings() {
  try {
    ensureSettingsTable();
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
    ensureSettingsTable();
    const existing = getExistingSettingsInternal();

    // Normalize keys from renderer to DB column names
    // Business Information
    const toNum = (v) => {
      if (v === undefined || v === null || v === '') return null;
      const n = Number(v);
      return Number.isNaN(n) ? null : n;
    };
    const toInt = (v) => {
      if (v === undefined || v === null || v === '') return null;
      const n = parseInt(v, 10);
      return Number.isNaN(n) ? null : n;
    };
    const toBoolInt = (v, def=false) => {
      const b = typeof v === 'boolean' ? v : (v === 'true' ? true : (v === 'false' ? false : (v ?? def)));
      return b ? 1 : 0;
    };

    const data = {
      business_name: settingsData.business_name ?? settingsData.businessName ?? null,
      phone_number: settingsData.phone_number ?? settingsData.phoneNumber ?? null,
      country: settingsData.country ?? null,
      description: settingsData.description ?? null,
      logo_file: settingsData.logo_file ?? null,
      logo_preview: settingsData.logo_preview ?? null,
      address: settingsData.address ?? null,
      latitude: toNum(settingsData.latitude),
      longitude: toNum(settingsData.longitude),
      // Finance & Tax
      currency: settingsData.currency ?? null,
      currency_symbol_position: settingsData.currency_symbol_position ?? settingsData.currencySymbolPosition ?? null,
      digit_after_decimal_point: toInt(settingsData.digit_after_decimal_point ?? settingsData.digitAfterDecimalPoint),
      tax_rate: toNum(settingsData.tax_rate ?? settingsData.taxRate),
      standard_tax: toNum(settingsData.standard_tax ?? settingsData.standardTax),
      food_tax: toNum(settingsData.food_tax ?? settingsData.foodTax),
      time_zone: settingsData.time_zone ?? settingsData.timeZone ?? null,
      time_format: settingsData.time_format ?? settingsData.timeFormat ?? null,
      // Order Configuration
      minimum_order_amount: toNum(settingsData.minimum_order_amount ?? settingsData.minimumOrderAmount),
      order_place_setting: settingsData.order_place_setting ?? settingsData.orderPlaceSetting ?? null,
      delivery_min_time: toInt(settingsData.delivery_min_time ?? settingsData.deliveryMinTime),
      delivery_max_time: toInt(settingsData.delivery_max_time ?? settingsData.deliveryMaxTime),
      delivery_unit: settingsData.delivery_unit ?? settingsData.deliveryUnit ?? null,
      dine_in_time: toInt(settingsData.dine_in_time ?? settingsData.dineInTime),
      dine_in_unit: settingsData.dine_in_unit ?? settingsData.dineInUnit ?? null,
      dine_in_orders: toBoolInt(settingsData.dine_in_orders ?? settingsData.dineInOrders, true),
      in_store_orders: toBoolInt(settingsData.in_store_orders ?? settingsData.inStoreOrders, true),
      takeaway_orders: toBoolInt(settingsData.takeaway_orders ?? settingsData.takeawayOrders, true),
      delivery_orders: toBoolInt(settingsData.delivery_orders ?? settingsData.deliveryOrders, true),
      cashier_can_cancel_order: settingsData.cashier_can_cancel_order ?? settingsData.cashierCanCancelOrder ?? null,
      // Delivery Management
      free_delivery_in: toNum(settingsData.free_delivery_in ?? settingsData.freeDeliveryIn),
      delivery_fee_per_km: toNum(settingsData.delivery_fee_per_km ?? settingsData.deliveryFeePerKm),
      maximum_delivery_range: toNum(settingsData.maximum_delivery_range ?? settingsData.maximumDeliveryRange),
      minimum_delivery_order_amount: toNum(settingsData.minimum_delivery_order_amount ?? settingsData.minimumDeliveryOrderAmount),
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
      auto_save_interval: toInt(settingsData.auto_save_interval ?? settingsData.autoSaveInterval),
      sound_alert: toBoolInt(settingsData.sound_alert ?? settingsData.soundAlert, false),
      notifications: toBoolInt(settingsData.notifications, true),
      isSyncronized: toBoolInt(settingsData.isSyncronized, false),
    };

    if (existing) {
      // Handle logo upload if provided
      if (settingsData.logoFile && settingsData.originalLogoFilename) {
        const storedPath = saveLogoFile(settingsData.logoFile, settingsData.originalLogoFilename);
        if (storedPath) {
          data.logo_file = storedPath;
          data.logo_preview = null;
        }
      }
      const entries = Object.entries(data).filter(([, v]) => v !== undefined);
      const fields = entries.map(([k]) => `${k} = ?`);
      const values = entries.map(([, v]) => v);
      const sql = `UPDATE settings SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
      const stmt = db.prepare(sql);
      const result = stmt.run(...values, existing.id);
      return { success: result.changes > 0, message: result.changes > 0 ? 'Settings updated' : 'No changes applied', changes: result.changes };
    } else {
      // Handle logo upload on insert
      if (settingsData.logoFile && settingsData.originalLogoFilename) {
        const storedPath = saveLogoFile(settingsData.logoFile, settingsData.originalLogoFilename);
        if (storedPath) {
          data.logo_file = storedPath;
          data.logo_preview = null;
        }
      }
      const entries = Object.entries(data).filter(([, v]) => v !== undefined);
      const cols = entries.map(([k]) => k);
      const placeholders = cols.map(() => '?').join(', ');
      const values = entries.map(([, v]) => v);
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


