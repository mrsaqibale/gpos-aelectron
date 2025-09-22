import { useCallback } from 'react';

export const useOrderTypeSettings = () => {
  const getOrderTypeSettings = useCallback(() => {
    try {
      // Get settings from global context
      const settings = window.appSettings?.current;
      return {
        dineInOrders: settings?.dine_in_orders === 1 || settings?.dine_in_orders === true,
        inStoreOrders: settings?.in_store_orders === 1 || settings?.in_store_orders === true,
        takeawayOrders: settings?.takeaway_orders === 1 || settings?.takeaway_orders === true,
        deliveryOrders: settings?.delivery_orders === 1 || settings?.delivery_orders === true,
      };
    } catch (error) {
      console.log('Failed to get order type settings:', error);
      // Default fallback - show all order types
      return {
        dineInOrders: true,
        inStoreOrders: true,
        takeawayOrders: true,
        deliveryOrders: true,
      };
    }
  }, []);

  const shouldShowOrderType = useCallback((orderType) => {
    const settings = getOrderTypeSettings();
    
    switch (orderType) {
      case 'table':
        return settings.dineInOrders;
      case 'instore':
        return settings.inStoreOrders;
      case 'collection':
        return settings.takeawayOrders;
      case 'delivery':
        return settings.deliveryOrders;
      default:
        return true;
    }
  }, [getOrderTypeSettings]);

  return {
    getOrderTypeSettings,
    shouldShowOrderType,
    orderTypeSettings: getOrderTypeSettings()
  };
};
