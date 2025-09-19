-- Migration 037: Add delivery_tax and service_tax columns to settings table
-- Date: 2024-01-XX
-- Description: Add delivery tax and service tax fields to settings table for finance configuration

-- Add delivery_tax column
ALTER TABLE settings ADD COLUMN delivery_tax NUMERIC DEFAULT 0;

-- Add service_tax column  
ALTER TABLE settings ADD COLUMN service_tax NUMERIC DEFAULT 0;
