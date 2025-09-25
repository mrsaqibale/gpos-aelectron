import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamic path resolution for both development and production
const getDynamicPath = (relativePath) => {
  try {
    // Check if we're in a built app (app.asar) or have resourcesPath
    const isBuiltApp = __dirname.includes('app.asar') || process.resourcesPath;
    
    // Current location: src/database/models/hotel/
    // Target: src/database/ (go up 2 levels)
    const devPath = path.join(__dirname, '../../', relativePath);
    
    // For built app: resources/database/models/hotel -> resources/database
    const builtPath = path.join(process.resourcesPath || '', 'database', relativePath);
    
    console.log(`[hotel.js] Looking for: ${relativePath}`);
    console.log(`[hotel.js] Current dir: ${__dirname}`);
    console.log(`[hotel.js] isBuiltApp: ${isBuiltApp}`);
    console.log(`[hotel.js] Dev path: ${devPath}`);
    console.log(`[hotel.js] Built path: ${builtPath}`);
    
    if (isBuiltApp && process.resourcesPath && fs.existsSync(builtPath)) {
      console.log(`✅ [hotel.js] Found at built path: ${builtPath}`);
      return builtPath;
    } else if (fs.existsSync(devPath)) {
      console.log(`✅ [hotel.js] Found at dev path: ${devPath}`);
      return devPath;
    } else {
      console.log(`❌ [hotel.js] Not found, using dev path: ${devPath}`);
      return devPath;
    }
  } catch (error) {
    console.error(`[hotel.js] Failed to resolve path: ${relativePath}`, error);
    return path.join(__dirname, '../../', relativePath);
  }
};

const dbPath = getDynamicPath('pos.db');
const db = new Database(dbPath);

// Universal error response
export function errorResponse(message) {
  return { success: false, message };
}

// Check hotel status - returns true if status is 90500 (licensed), false otherwise
export function checkHotelStatus() {
  try {
    const stmt = db.prepare('SELECT status FROM hotel WHERE isDelete = 0 LIMIT 1');
    const result = stmt.get();
    
    if (!result) {
      console.log('No hotel record found');
      return { success: true, isLicensed: false, status: null };
    }
    
    const isLicensed = result.status === 90500;
    console.log(`Hotel status: ${result.status}, Licensed: ${isLicensed}`);
    
    return { 
      success: true, 
      isLicensed: isLicensed, 
      status: result.status 
    };
  } catch (err) {
    console.error('Error checking hotel status:', err);
    return errorResponse(err.message);
  }
}

// Get hotel information
export function getHotelInfo() {
  try {
    const stmt = db.prepare('SELECT * FROM hotel WHERE isDelete = 0 LIMIT 1');
    const hotel = stmt.get();
    
    if (!hotel) {
      return errorResponse('No hotel record found');
    }
    
    return { success: true, data: hotel };
  } catch (err) {
    console.error('Error getting hotel info:', err);
    return errorResponse(err.message);
  }
}

// Create or update hotel record
export function createOrUpdateHotel(hotelData) {
  try {
    // Check if hotel record exists
    const existingHotel = getHotelInfo();
    
    if (existingHotel.success) {
      // Update existing hotel
      const fields = [];
      const values = [];
      
      for (const key in hotelData) {
        if (key !== 'id') { // Don't update the ID
          fields.push(`${key} = ?`);
          values.push(hotelData[key]);
        }
      }
      
      if (fields.length === 0) {
        return errorResponse('No valid fields to update.');
      }
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      const sql = `UPDATE hotel SET ${fields.join(', ')} WHERE id = ?`;
      values.push(existingHotel.data.id);
      
      const stmt = db.prepare(sql);
      const result = stmt.run(...values);
      
      if (result.changes === 0) {
        return errorResponse('No hotel record updated.');
      }
      
      return { success: true, message: 'Hotel updated successfully' };
    } else {
      // Create new hotel record
      const stmt = db.prepare(`
        INSERT INTO hotel (
          name, description, phone, email, logo, latitude, longitude, address,
          footer_text, minimum_order, comission, schedule_order, opening_time,
          closeing_time, status, vendor_id, free_delivery, rating, cover_photo,
          delivery, take_away, food_section, tax, zone_id, reviews_section,
          active, off_day, gst, self_delivery_system, pos_system,
          minimum_shipping_charge, delivery_time, veg, non_veg, order_count,
          total_order, per_km_shipping_charge, restaurant_model,
          maximum_shipping_charge, slug, order_subscription_active, cutlery,
          meta_title, meta_description, meta_image, announcement,
          announcement_message, qr_code, free_delivery_distance,
          additional_data, additional_documents, package_id, bgimg, icon,
          loyal_limit, isDelete, isSyncronized
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const values = [
        hotelData.name || null,
        hotelData.description || null,
        hotelData.phone || null,
        hotelData.email || null,
        hotelData.logo || null,
        hotelData.latitude || null,
        hotelData.longitude || null,
        hotelData.address || null,
        hotelData.footer_text || null,
        hotelData.minimum_order || null,
        hotelData.comission || null,
        hotelData.schedule_order || null,
        hotelData.opening_time || null,
        hotelData.closeing_time || null,
        hotelData.status || 0,
        hotelData.vendor_id || null,
        hotelData.free_delivery || null,
        hotelData.rating || null,
        hotelData.cover_photo || null,
        hotelData.delivery || null,
        hotelData.take_away || null,
        hotelData.food_section || null,
        hotelData.tax || null,
        hotelData.zone_id || null,
        hotelData.reviews_section || null,
        hotelData.active || null,
        hotelData.off_day || null,
        hotelData.gst || null,
        hotelData.self_delivery_system || null,
        hotelData.pos_system || null,
        hotelData.minimum_shipping_charge || null,
        hotelData.delivery_time || null,
        hotelData.veg || null,
        hotelData.non_veg || null,
        hotelData.order_count || null,
        hotelData.total_order || null,
        hotelData.per_km_shipping_charge || null,
        hotelData.restaurant_model || null,
        hotelData.maximum_shipping_charge || null,
        hotelData.slug || null,
        hotelData.order_subscription_active || null,
        hotelData.cutlery || null,
        hotelData.meta_title || null,
        hotelData.meta_description || null,
        hotelData.meta_image || null,
        hotelData.announcement || null,
        hotelData.announcement_message || null,
        hotelData.qr_code || null,
        hotelData.free_delivery_distance || null,
        hotelData.additional_data || null,
        hotelData.additional_documents || null,
        hotelData.package_id || null,
        hotelData.bgimg || null,
        hotelData.icon || null,
        hotelData.loyal_limit || 0,
        hotelData.isDelete || 0,
        hotelData.isSyncronized || 0
      ];
      
      const info = stmt.run(...values);
      const hotelId = info.lastInsertRowid;
      
      return { 
        success: true, 
        id: hotelId,
        message: 'Hotel created successfully' 
      };
    }
  } catch (err) {
    console.error('Error creating/updating hotel:', err);
    return errorResponse(err.message);
  }
}

// Update hotel status
export function updateHotelStatus(status) {
  try {
    const stmt = db.prepare('UPDATE hotel SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE isDelete = 0');
    const result = stmt.run(status);
    
    if (result.changes === 0) {
      return errorResponse('No hotel record found to update.');
    }
    
    return { 
      success: true, 
      message: 'Hotel status updated successfully',
      status: status
    };
  } catch (err) {
    console.error('Error updating hotel status:', err);
    return errorResponse(err.message);
  }
}

// Check if hotel table exists and has data
export function checkHotelTable() {
  try {
    const stmt = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='hotel'");
    const tableExists = stmt.get();
    
    if (!tableExists) {
      return { success: true, tableExists: false, hasData: false };
    }
    
    const dataStmt = db.prepare('SELECT COUNT(*) as count FROM hotel WHERE isDelete = 0');
    const dataResult = dataStmt.get();
    
    return { 
      success: true, 
      tableExists: true, 
      hasData: dataResult.count > 0 
    };
  } catch (err) {
    console.error('Error checking hotel table:', err);
    return errorResponse(err.message);
  }
}
