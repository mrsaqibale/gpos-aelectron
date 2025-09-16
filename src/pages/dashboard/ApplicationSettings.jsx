import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  Building,
  Folder,
  Truck,
  Clock,
  ChevronLeft,
  Euro,
  Send,
  Utensils,
  Store,
  Package,
  X,
  Trash2,
  ClipboardList,
  MapPin,
  ShoppingCart,
  Edit,
  Trash,
  Square,
  Upload,
} from "lucide-react";

const ApplicationSettings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("finance");
  const [settings, setSettings] = useState({
    defaultTheme: "Blue Theme",
    selectKeyboard: "System Keyboard",
    selectOrderBell: "Bell 1",
    autoSaveInterval: "5",
    soundAlert: false,
    notifications: true,
  });

  const [businessSettings, setBusinessSettings] = useState({
    businessName: "Restaurant Name",
    currency: "Euro (€)",
    currencySymbolPosition: "Right (123€)",
    digitAfterDecimalPoint: "2",
    taxRate: "23",
    timeZone: "Ireland Dublin",
    timeFormat: "12 hour",
  });

  const [orderSettings, setOrderSettings] = useState({
    minimumOrderAmount: "10.00",
    orderPlaceSetting: "Both",
    deliveryMinTime: "25",
    deliveryMaxTime: "45",
    deliveryUnit: "Minute",
    dineInTime: "0",
    dineInUnit: "Minutes",
    dineInOrders: true,
    inStoreOrders: true,
    takeawayOrders: true,
    deliveryOrders: true,
    cashierCanCancelOrder: "No",
    cashierCanDeleteOrder: "Yes",
    cancellationReasonRequired: "Yes",
  });

  const [deliverySettings, setDeliverySettings] = useState({
    freeDeliveryIn: "5",
    deliveryFeePerKm: "2.50",
    maximumDeliveryRange: "15",
    minimumDeliveryOrderAmount: "20.00",
  });

  const [scheduleSettings, setScheduleSettings] = useState({
    monday: { open: "12:00", close: "23:59" },
    tuesday: { open: "12:00", close: "23:59" },
    wednesday: { open: "12:00", close: "23:59" },
    thursday: { open: "12:00", close: "23:59" },
    friday: { open: "12:00", close: "23:59" },
    saturday: { open: "12:00", close: "23:59" },
    sunday: { open: "12:00", close: "23:59" },
  });

  // Business Information state
  const [businessInfo, setBusinessInfo] = useState({
    businessName: "Restaurant Name",
    phoneNumber: "",
    country: "Ireland",
    description:
      "Welcome to our restaurant! We serve delicious food with excellent service in a warm and welcoming atmosphere.",
    logoFile: null,
    logoPreview: "",
    address: "123 Main Street, Dublin, Ireland",
    latitude: "53.3498",
    longitude: "-6.2603",
  });
  const fileInputRef = useRef(null);

  // Schedule modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingDay, setEditingDay] = useState(null);
  const [tempSchedule, setTempSchedule] = useState({ open: "", close: "" });

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingDay, setDeletingDay] = useState(null);

  const navigationTabs = [
    {
      id: "businessInfo",
      label: "Business Information",
      icon: <Store size={16} />,
    },
    {
      id: "appearance",
      label: "Appearance",
      icon: <Settings size={16} />,
    },
    {
      id: "finance",
      label: "Finance & Tax",
      icon: <Building size={16} />,
    },
    {
      id: "order",
      label: "Order Configuration",
      icon: <Folder size={16} />,
    },
    {
      id: "delivery",
      label: "Delivery Management",
      icon: <Truck size={16} />,
    },
    {
      id: "schedule",
      label: "Time Schedule",
      icon: <Clock size={16} />,
    },
  ];

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleBusinessSettingChange = (key, value) => {
    setBusinessSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleOrderSettingChange = (key, value) => {
    setOrderSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDeliverySettingChange = (key, value) => {
    setDeliverySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleBusinessInfoChange = (key, value) => {
    setBusinessInfo(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleLogoButtonClick = () => {
    fileInputRef?.current?.click();
  };

  const handleLogoChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setBusinessInfo(prev => ({ ...prev, logoFile: file, logoPreview: previewUrl }));
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setBusinessInfo(prev => ({
          ...prev,
          latitude: String(latitude.toFixed(6)),
          longitude: String(longitude.toFixed(6))
        }));
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleOpenInMaps = () => {
    const { latitude, longitude, address } = businessInfo;
    const q = address ? encodeURIComponent(address) : `${latitude},${longitude}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${q}`;
    window.open(url, "_blank");
  };

  const handleScheduleSettingChange = (day, type, value) => {
    setScheduleSettings(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value
      }
    }));
  };

  // Schedule modal handlers
  const handleEditSchedule = (day) => {
    setEditingDay(day);
    setTempSchedule({
      open: scheduleSettings[day].open,
      close: scheduleSettings[day].close
    });
    setShowScheduleModal(true);
  };

  const handleScheduleModalSubmit = () => {
    if (editingDay) {
      setScheduleSettings(prev => ({
        ...prev,
        [editingDay]: {
          ...prev[editingDay],
          open: tempSchedule.open,
          close: tempSchedule.close
        }
      }));
    }
    setShowScheduleModal(false);
    setEditingDay(null);
    setTempSchedule({ open: "", close: "" });
  };

  const handleScheduleModalClose = () => {
    setShowScheduleModal(false);
    setEditingDay(null);
    setTempSchedule({ open: "", close: "" });
  };

  const handleTempScheduleChange = (type, value) => {
    setTempSchedule(prev => ({
      ...prev,
      [type]: value
    }));
  };

  // Delete modal handlers
  const handleDeleteSchedule = (day) => {
    setDeletingDay(day);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    // This is just UI - no actual deletion happens
    console.log(`Delete confirmed for ${deletingDay}`);
    setShowDeleteModal(false);
    setDeletingDay(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setDeletingDay(null);
  };

  const handleSave = () => {
    // Save settings logic here
    if (activeTab === "finance") {
      console.log("Business settings saved:", businessSettings);
    } else if (activeTab === "order") {
      console.log("Order settings saved:", orderSettings);
    } else if (activeTab === "delivery") {
      console.log("Delivery settings saved:", deliverySettings);
    } else if (activeTab === "schedule") {
      console.log("Schedule settings saved:", scheduleSettings);
    } else {
      console.log("Settings saved:", settings);
    }
  };

  const handleReset = () => {
    if (activeTab === "finance") {
      setBusinessSettings({
        businessName: "Restaurant Name",
        currency: "Euro (€)",
        currencySymbolPosition: "Right (123€)",
        digitAfterDecimalPoint: "2",
        taxRate: "23",
        timeZone: "Ireland Dublin",
        timeFormat: "12 hour",
      });
    } else if (activeTab === "order") {
      setOrderSettings({
        minimumOrderAmount: "10.00",
        orderPlaceSetting: "Both",
        deliveryMinTime: "25",
        deliveryMaxTime: "45",
        deliveryUnit: "Minute",
        dineInTime: "0",
        dineInUnit: "Minutes",
        dineInOrders: true,
        inStoreOrders: true,
        takeawayOrders: true,
        deliveryOrders: true,
        cashierCanCancelOrder: "No",
        cashierCanDeleteOrder: "Yes",
        cancellationReasonRequired: "Yes",
      });
    } else if (activeTab === "delivery") {
      setDeliverySettings({
        freeDeliveryIn: "5",
        deliveryFeePerKm: "2.50",
        maximumDeliveryRange: "15",
        minimumDeliveryOrderAmount: "20.00",
      });
    } else if (activeTab === "schedule") {
      setScheduleSettings({
        monday: { open: "12:00", close: "23:59" },
        tuesday: { open: "12:00", close: "23:59" },
        wednesday: { open: "12:00", close: "23:59" },
        thursday: { open: "12:00", close: "23:59" },
        friday: { open: "12:00", close: "23:59" },
        saturday: { open: "12:00", close: "23:59" },
        sunday: { open: "12:00", close: "23:59" },
      });
    } else {
      setSettings({
        defaultTheme: "Blue Theme",
        selectKeyboard: "System Keyboard",
        selectOrderBell: "Bell 1",
        autoSaveInterval: "5",
        soundAlert: false,
        notifications: true,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Navigation Tabs */}
      <div className="bg-white flex justify-center rounded-lg shadow-sm mb-6">
        <div className="flex items-center p-2 ">
          {navigationTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-white bg-primary rounded-lg"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className={activeTab === tab.id ? "text-white" : "text-gray-500"}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
        <div className="bg-white rounded-lg shadow-sm p-8 relative overflow-hidden" style={{
          '--primary': 'var(--color-primary)'
        }}>
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary"></div>
          {/* Header */}
                     <div className="flex items-center gap-3 mb-6">
             <button
               onClick={() => navigate("/dashboard/admin-panel")}
               className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
             >
               <ChevronLeft size={20} className="text-gray-600" />
             </button>
             <div>
                               <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  {activeTab === "businessInfo" ? (
                    <>
                      <Store size={24} className="text-primary" />
                      Business Information
                    </>
                  ) : activeTab === "finance" ? (
                    <>
                      <Building size={24} className="text-primary" />
                      Business Configuration
                    </>
                  ) : activeTab === "order" ? (
                    <>
                      <Folder size={24} className="text-primary" />
                      Order Configuration
                    </>
                  ) : activeTab === "delivery" ? (
                    <>
                      <Truck size={24} className="text-primary" />
                      Delivery Management
                    </>
                  ) : activeTab === "schedule" ? (
                    <>
                      <Clock size={24} className="text-primary" />
                      Schedule Working Hours
                    </>
                  ) : (
                    <>
                      <Settings size={24} className="text-primary" />
                      System Appearance and Preferences
                    </>
                  )}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  {activeTab === "businessInfo" 
                    ? "Configure your business details and location information"
                    : activeTab === "finance" 
                    ? "Set up business-specific settings."
                    : activeTab === "order"
                    ? "Configure order processing and delivery settings."
                    : activeTab === "delivery"
                    ? "Configure delivery settings and fees."
                    : activeTab === "schedule"
                    ? "Set opening and closing times for each day of the week"
                    : "Configure system behavior and performance."
                  }
                </p>
             </div>
           </div>

                     {/* Settings Grid */}
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {activeTab === "businessInfo" ? (
                <>
                  {/* Basic Information */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 md:col-span-2">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
                        <input
                          type="text"
                          value={businessInfo.businessName}
                          onChange={(e) => handleBusinessInfoChange("businessName", e.target.value)}
                          placeholder="Enter business name"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="text"
                          value={businessInfo.phoneNumber}
                          onChange={(e) => handleBusinessInfoChange("phoneNumber", e.target.value)}
                          placeholder="Enter phone number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                        <select
                          value={businessInfo.country}
                          onChange={(e) => handleBusinessInfoChange("country", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                          <option value="Ireland">Ireland</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="United States">United States</option>
                          <option value="Germany">Germany</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200" />

                    <h3 className="text-base font-semibold text-gray-800 mb-4">Address & Location</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                        <input
                          type="text"
                          value={businessInfo.address}
                          onChange={(e) => handleBusinessInfoChange("address", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                        <input
                          type="text"
                          value={businessInfo.latitude}
                          onChange={(e) => handleBusinessInfoChange("latitude", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                        <input
                          type="text"
                          value={businessInfo.longitude}
                          onChange={(e) => handleBusinessInfoChange("longitude", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <button
                        onClick={handleGetCurrentLocation}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                      >
                        <MapPin size={16} /> Get Current Location
                      </button>
                      <button
                        onClick={handleOpenInMaps}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                      >
                        <MapPin size={16} /> Open in Maps
                      </button>
                    </div>
                  </div>

                  {/* Description & Logo */}
                  <div className="bg-white border border-gray-200 rounded-lg p-5 md:col-span-2">
                    <h3 className="text-base font-semibold text-gray-900 mb-5">Description & Logo</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                      {/* Description column (2/3) */}
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <div className="rounded-lg border border-gray-200 overflow-hidden">
                          <textarea
                            rows={8}
                            value={businessInfo.description}
                            onChange={(e) => handleBusinessInfoChange("description", e.target.value)}
                            maxLength={600}
                            placeholder="Tell customers what makes your place special..."
                            className="w-full min-h-[180px] px-4 py-3 outline-none border-0 focus:ring-2 focus:ring-primary"
                          />
                          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                            <span>Tip: Friendly, clear, and under 600 characters.</span>
                            <span>{businessInfo.description?.length || 0}/600</span>
                          </div>
                        </div>
                      </div>

                      {/* Logo column (1/3) */}
                      <div className="lg:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Business Logo</label>
                        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4">
                          <div className="flex flex-col items-center gap-3">
                            <div className="aspect-square w-32 md:w-36 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                              {businessInfo.logoPreview ? (
                                <img src={businessInfo.logoPreview} alt="Logo" className="w-full h-full object-contain" />
                              ) : (
                                <span className="text-xs text-gray-400">No logo</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 h-4 truncate w-full text-center">
                              {businessInfo.logoFile?.name || "No file chosen"}
                            </p>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleLogoChange}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleLogoButtonClick}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                              >
                                <Upload size={16} /> Upload
                              </button>
                              {businessInfo.logoPreview && (
                                <button
                                  onClick={() => handleBusinessInfoChange("logoPreview", "")}
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-white text-gray-700 border border-gray-200 rounded-md hover:bg-gray-100"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 text-center">
                              Use a square image (≥ 256×256). PNG with transparent background looks best.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Removed separate Address & Location card by merging above */}
                </>
              ) : activeTab === "finance" ? (
                // Finance & Tax Settings
                <>
                  {/* Business Name */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name
                    </label>
                    <select
                      value={businessSettings.businessName}
                      onChange={(e) => handleBusinessSettingChange("businessName", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="Restaurant Name">Restaurant Name</option>
                      <option value="Cafe Name">Cafe Name</option>
                      <option value="Bar Name">Bar Name</option>
                    </select>
                  </div>

                  {/* Currency */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency
                    </label>
                    <select
                      value={businessSettings.currency}
                      onChange={(e) => handleBusinessSettingChange("currency", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="Euro (€)">Euro (€)</option>
                      <option value="US Dollar ($)">US Dollar ($)</option>
                      <option value="British Pound (£)">British Pound (£)</option>
                    </select>
                  </div>

                  {/* Currency Symbol Position */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Currency Symbol Position
                    </label>
                    <select
                      value={businessSettings.currencySymbolPosition}
                      onChange={(e) => handleBusinessSettingChange("currencySymbolPosition", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="Right (123€)">Right (123€)</option>
                      <option value="Left (€123)">Left (€123)</option>
                    </select>
                  </div>

                  {/* Digit After Decimal Point */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Digit After Decimal Point
                    </label>
                    <select
                      value={businessSettings.digitAfterDecimalPoint}
                      onChange={(e) => handleBusinessSettingChange("digitAfterDecimalPoint", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="0">0</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </div>

                  {/* Tax Rate */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tax Rate (%)
                    </label>
                    <select
                      value={businessSettings.taxRate}
                      onChange={(e) => handleBusinessSettingChange("taxRate", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="0">0</option>
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="15">15</option>
                      <option value="20">20</option>
                      <option value="23">23</option>
                      <option value="25">25</option>
                    </select>
                  </div>

                  {/* Time Zone */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Zone
                    </label>
                    <select
                      value={businessSettings.timeZone}
                      onChange={(e) => handleBusinessSettingChange("timeZone", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="Ireland Dublin">Ireland Dublin</option>
                      <option value="London">London</option>
                      <option value="New York">New York</option>
                      <option value="Los Angeles">Los Angeles</option>
                    </select>
                  </div>

                  {/* Time Format */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Format
                    </label>
                    <select
                      value={businessSettings.timeFormat}
                      onChange={(e) => handleBusinessSettingChange("timeFormat", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="12 hour">12 hour</option>
                      <option value="24 hour">24 hour</option>
                    </select>
                  </div>
                </>
              ) : activeTab === "order" ? (
                // Order Configuration Settings
                <>
                  {/* Minimum Order Amount */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Euro size={16} className="text-primary" />
                      <label className="block text-sm font-medium text-gray-700">
                        Minimum Order Amount
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Set the minimum amount required for orders.</p>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={orderSettings.minimumOrderAmount}
                        onChange={(e) => handleOrderSettingChange("minimumOrderAmount", e.target.value)}
                        className="flex-1 pl-2 w-full py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-600">
                        €
                      </span>
                    </div>
                  </div>

                  {/* Order Place Setting */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Send size={16} className="text-primary" />
                      <label className="block text-sm font-medium text-gray-700">
                        Order Place Setting
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Choose where orders are sent when placed.</p>
                    <select
                      value={orderSettings.orderPlaceSetting}
                      onChange={(e) => handleOrderSettingChange("orderPlaceSetting", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="Kitchen">Kitchen</option>
                      <option value="Bar">Bar</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>

                  {/* Approximate Delivery Time */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock size={16} className="text-primary" />
                      <label className="block text-sm font-medium text-gray-700">
                        Approximate Delivery Time
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Set the time range for delivery estimates.</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Min Time</label>
                        <input
                          type="text"
                          value={orderSettings.deliveryMinTime}
                          onChange={(e) => handleOrderSettingChange("deliveryMinTime", e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Max Time</label>
                        <input
                          type="text"
                          value={orderSettings.deliveryMaxTime}
                          onChange={(e) => handleOrderSettingChange("deliveryMaxTime", e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Unit</label>
                        <select
                          value={orderSettings.deliveryUnit}
                          onChange={(e) => handleOrderSettingChange("deliveryUnit", e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="Minute">Minute</option>
                          <option value="Hour">Hour</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Minimum Time For Dine-In */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Utensils size={16} className="text-primary" />
                      <label className="block text-sm font-medium text-gray-700">
                        Minimum Time For Dine-In
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Set minimum preparation time for dine-in orders.</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Time</label>
                        <input
                          type="text"
                          value={orderSettings.dineInTime}
                          onChange={(e) => handleOrderSettingChange("dineInTime", e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Unit</label>
                        <select
                          value={orderSettings.dineInUnit}
                          onChange={(e) => handleOrderSettingChange("dineInUnit", e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          <option value="Minutes">Minutes</option>
                          <option value="Hours">Hours</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Dine In Orders */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Utensils size={16} className="text-primary" />
                      <label className="block text-sm font-medium text-gray-700">
                        Dine In Orders
                      </label>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleOrderSettingChange("dineInOrders", !orderSettings.dineInOrders)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          orderSettings.dineInOrders ? "bg-primary" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            orderSettings.dineInOrders ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* In-Store Orders */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Store size={16} className="text-primary" />
                      <label className="block text-sm font-medium text-gray-700">
                        In-Store Orders
                      </label>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleOrderSettingChange("inStoreOrders", !orderSettings.inStoreOrders)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          orderSettings.inStoreOrders ? "bg-primary" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            orderSettings.inStoreOrders ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Takeaway Orders */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Package size={16} className="text-primary" />
                      <label className="block text-sm font-medium text-gray-700">
                        Takeaway Orders
                      </label>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleOrderSettingChange("takeawayOrders", !orderSettings.takeawayOrders)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          orderSettings.takeawayOrders ? "bg-primary" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            orderSettings.takeawayOrders ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                                     {/* Delivery Orders */}
                   <div className="bg-white border border-gray-200 rounded-lg p-4">
                     <div className="flex items-center gap-2 mb-2">
                       <Truck size={16} className="text-primary" />
                       <label className="block text-sm font-medium text-gray-700">
                         Delivery Orders
                       </label>
                     </div>
                     <div className="flex items-center">
                       <button
                         onClick={() => handleOrderSettingChange("deliveryOrders", !orderSettings.deliveryOrders)}
                         className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                           orderSettings.deliveryOrders ? "bg-primary" : "bg-gray-300"
                         }`}
                       >
                         <span
                           className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                             orderSettings.deliveryOrders ? "translate-x-6" : "translate-x-1"
                           }`}
                         />
                       </button>
                     </div>
                   </div>

                   {/* Cashier Can Cancel Order */}
                   <div className="bg-white border border-gray-200 rounded-lg p-4">
                     <div className="flex items-center gap-2 mb-2">
                       <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                         <X size={12} className="text-white" />
                       </div>
                       <label className="block text-sm font-medium text-gray-700">
                         Cashier Can Cancel Order
                       </label>
                     </div>
                     <select
                       value={orderSettings.cashierCanCancelOrder}
                       onChange={(e) => handleOrderSettingChange("cashierCanCancelOrder", e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-primary font-medium"
                     >
                       <option value="No">No</option>
                       <option value="Yes">Yes</option>
                     </select>
                   </div>

                   {/* Cashier Can Delete Order */}
                   <div className="bg-white border border-gray-200 rounded-lg p-4">
                     <div className="flex items-center gap-2 mb-2">
                       <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                         <Trash2 size={12} className="text-white" />
                       </div>
                       <label className="block text-sm font-medium text-gray-700">
                         Cashier Can Delete Order
                       </label>
                     </div>
                     <select
                       value={orderSettings.cashierCanDeleteOrder}
                       onChange={(e) => handleOrderSettingChange("cashierCanDeleteOrder", e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-primary font-medium"
                     >
                       <option value="No">No</option>
                       <option value="Yes">Yes</option>
                     </select>
                   </div>

                   {/* Cancellation Reason Required */}
                   <div className="bg-white border border-gray-200 rounded-lg p-4">
                     <div className="flex items-center gap-2 mb-2">
                       <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                         <ClipboardList size={12} className="text-white" />
                       </div>
                       <label className="block text-sm font-medium text-gray-700">
                         Cancellation Reason Required
                       </label>
                     </div>
                     <select
                       value={orderSettings.cancellationReasonRequired}
                       onChange={(e) => handleOrderSettingChange("cancellationReasonRequired", e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-primary font-medium"
                     >
                       <option value="No">No</option>
                       <option value="Yes">Yes</option>
                                             </select>
                      </div>
                    </>
                  ) : activeTab === "delivery" ? (
                    // Delivery Management Settings
                    <>
                      {/* Free Delivery In (KM) */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Package size={16} className="text-primary" />
                          <label className="block text-sm font-medium text-gray-700">
                            Free Delivery In (KM)
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">Distance within which delivery is free</p>
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={deliverySettings.freeDeliveryIn}
                            onChange={(e) => handleDeliverySettingChange("freeDeliveryIn", e.target.value)}
                            className="flex-1 w-full pl-2 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-600">
                            km
                          </span>
                        </div>
                      </div>

                      {/* Delivery Fee per KM */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Euro size={16} className="text-primary" />
                          <label className="block text-sm font-medium text-gray-700">
                            Delivery Fee per KM
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">Cost per kilometer for delivery</p>
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={deliverySettings.deliveryFeePerKm}
                            onChange={(e) => handleDeliverySettingChange("deliveryFeePerKm", e.target.value)}
                            className="flex-1 w-full pl-2 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-600">
                            €
                          </span>
                        </div>
                      </div>

                      {/* Maximum Delivery Range */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin size={16} className="text-primary" />
                          <label className="block text-sm font-medium text-gray-700">
                            Maximum Delivery Range
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">Maximum distance for delivery service</p>
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={deliverySettings.maximumDeliveryRange}
                            onChange={(e) => handleDeliverySettingChange("maximumDeliveryRange", e.target.value)}
                            className="flex-1 w-full pl-2 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-600">
                            km
                          </span>
                        </div>
                      </div>

                      {/* Minimum Delivery Order Amount */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <ShoppingCart size={16} className="text-primary" />
                          <label className="block text-sm font-medium text-gray-700">
                            Minimum Delivery Order Amount
                          </label>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">Minimum order value for delivery</p>
                        <div className="flex items-center">
                          <input
                            type="text"
                            value={deliverySettings.minimumDeliveryOrderAmount}
                            onChange={(e) => handleDeliverySettingChange("minimumDeliveryOrderAmount", e.target.value)}
                            className="flex-1 w-full pl-2 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                          <span className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-600">
                            €
                          </span>
                        </div>
                      </div>
                    </>
                  ) : activeTab === "schedule" ? (
                    // Time Schedule Settings - 3 Column Layout
                    <div className="col-span-full">
                      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
                        {/* Monday */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">Monday</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Open:</span>
                              <input
                                type="time"
                                value={scheduleSettings.monday.open}
                                onChange={(e) => handleScheduleSettingChange("monday", "open", e.target.value)}
                                className="px-2 py-1 text-sm border border-gray-300 rounded bg-blue-50 focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                              <span className="text-sm text-gray-600">Close:</span>
                              <input
                                type="time"
                                value={scheduleSettings.monday.close}
                                onChange={(e) => handleScheduleSettingChange("monday", "close", e.target.value)}
                                className="px-2 py-1 text-sm border border-gray-300 rounded bg-blue-50 focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => handleDeleteSchedule('monday')}
                                  className="w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                  <Trash size={12} />
                                </button>
                                <button 
                                  onClick={() => handleEditSchedule('monday')}
                                  className="w-6 h-6 bg-primary text-white rounded flex items-center justify-center hover:bg-primary/80 transition-colors"
                                >
                                  <Edit size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Tuesday */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">Tuesday</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Open:</span>
                              <input
                                type="time"
                                value={scheduleSettings.tuesday.open}
                                onChange={(e) => handleScheduleSettingChange("tuesday", "open", e.target.value)}
                                className="px-2 py-1 text-sm border border-gray-300 rounded bg-blue-50 focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                              <span className="text-sm text-gray-600">Close:</span>
                              <input
                                type="time"
                                value={scheduleSettings.tuesday.close}
                                onChange={(e) => handleScheduleSettingChange("tuesday", "close", e.target.value)}
                                className="px-2 py-1 text-sm border border-gray-300 rounded bg-blue-50 focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => handleDeleteSchedule('tuesday')}
                                  className="w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                  <Trash size={12} />
                                </button>
                                <button 
                                  onClick={() => handleEditSchedule('tuesday')}
                                  className="w-6 h-6 bg-primary text-white rounded flex items-center justify-center hover:bg-primary/80 transition-colors"
                                >
                                  <Edit size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Wednesday */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">Wednesday</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Open:</span>
                              <input
                                type="time"
                                value={scheduleSettings.wednesday.open}
                                onChange={(e) => handleScheduleSettingChange("wednesday", "open", e.target.value)}
                                className="px-2 py-1 text-sm border border-gray-300 rounded bg-blue-50 focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                              <span className="text-sm text-gray-600">Close:</span>
                              <input
                                type="time"
                                value={scheduleSettings.wednesday.close}
                                onChange={(e) => handleScheduleSettingChange("wednesday", "close", e.target.value)}
                                className="px-2 py-1 text-sm border border-gray-300 rounded bg-blue-50 focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => handleDeleteSchedule('wednesday')}
                                  className="w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                  <Trash size={12} />
                                </button>
                                <button 
                                  onClick={() => handleEditSchedule('wednesday')}
                                  className="w-6 h-6 bg-primary text-white rounded flex items-center justify-center hover:bg-primary/80 transition-colors"
                                >
                                  <Edit size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Thursday */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">Thursday</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Open:</span>
                              <input
                                type="time"
                                value={scheduleSettings.thursday.open}
                                onChange={(e) => handleScheduleSettingChange("thursday", "open", e.target.value)}
                                className="px-2 py-1 text-sm border border-gray-300 rounded bg-blue-50 focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                              <span className="text-sm text-gray-600">Close:</span>
                              <input
                                type="time"
                                value={scheduleSettings.thursday.close}
                                onChange={(e) => handleScheduleSettingChange("thursday", "close", e.target.value)}
                                className="px-2 py-1 text-sm border border-gray-300 rounded bg-blue-50 focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => handleDeleteSchedule('thursday')}
                                  className="w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                  <Trash size={12} />
                                </button>
                                <button 
                                  onClick={() => handleEditSchedule('thursday')}
                                  className="w-6 h-6 bg-primary text-white rounded flex items-center justify-center hover:bg-primary/80 transition-colors"
                                >
                                  <Edit size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Friday */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">Friday</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Open:</span>
                              <input
                                type="time"
                                value={scheduleSettings.friday.open}
                                onChange={(e) => handleScheduleSettingChange("friday", "open", e.target.value)}
                                className="px-2 py-1 text-sm border border-gray-300 rounded bg-blue-50 focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                              <span className="text-sm text-gray-600">Close:</span>
                              <input
                                type="time"
                                value={scheduleSettings.friday.close}
                                onChange={(e) => handleScheduleSettingChange("friday", "close", e.target.value)}
                                className="px-2 py-1 text-sm border border-gray-300 rounded bg-blue-50 focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => handleDeleteSchedule('friday')}
                                  className="w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                  <Trash size={12} />
                                </button>
                                <button 
                                  onClick={() => handleEditSchedule('friday')}
                                  className="w-6 h-6 bg-primary text-white rounded flex items-center justify-center hover:bg-primary/80 transition-colors"
                                >
                                  <Edit size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Saturday */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">Saturday</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Open:</span>
                              <input
                                type="time"
                                value={scheduleSettings.saturday.open}
                                onChange={(e) => handleScheduleSettingChange("saturday", "open", e.target.value)}
                                className="px-2 py-1 text-sm border border-gray-300 rounded bg-blue-50 focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                              <span className="text-sm text-gray-600">Close:</span>
                              <input
                                type="time"
                                value={scheduleSettings.saturday.close}
                                onChange={(e) => handleScheduleSettingChange("saturday", "close", e.target.value)}
                                className="px-2 py-1 text-sm border border-gray-300 rounded bg-blue-50 focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => handleDeleteSchedule('saturday')}
                                  className="w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                  <Trash size={12} />
                                </button>
                                <button 
                                  onClick={() => handleEditSchedule('saturday')}
                                  className="w-6 h-6 bg-primary text-white rounded flex items-center justify-center hover:bg-primary/80 transition-colors"
                                >
                                  <Edit size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Sunday */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-700">Sunday</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Open:</span>
                              <input
                                type="time"
                                value={scheduleSettings.sunday.open}
                                onChange={(e) => handleScheduleSettingChange("sunday", "open", e.target.value)}
                                className="px-2 py-1 text-sm border border-gray-300 rounded bg-blue-50 focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                              <span className="text-sm text-gray-600">Close:</span>
                              <input
                                type="time"
                                value={scheduleSettings.sunday.close}
                                onChange={(e) => handleScheduleSettingChange("sunday", "close", e.target.value)}
                                className="px-2 py-1 text-sm border border-gray-300 rounded bg-blue-50 focus:outline-none focus:ring-1 focus:ring-primary"
                              />
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => handleDeleteSchedule('sunday')}
                                  className="w-6 h-6 bg-red-500 text-white rounded flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                  <Trash size={12} />
                                </button>
                                <button 
                                  onClick={() => handleEditSchedule('sunday')}
                                  className="w-6 h-6 bg-primary text-white rounded flex items-center justify-center hover:bg-primary/80 transition-colors"
                                >
                                  <Edit size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                // Appearance Settings
                <>
                  {/* Default Theme */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Theme
                    </label>
                    <select
                      value={settings.defaultTheme}
                      onChange={(e) => handleSettingChange("defaultTheme", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="Blue Theme">Blue Theme</option>
                      <option value="Dark Blue Theme">Dark Blue Theme</option>
                      <option value="Green Theme">Green Theme</option>
                    </select>
                  </div>

                  {/* Select Keyboard */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Keyboard
                    </label>
                    <select
                      value={settings.selectKeyboard}
                      onChange={(e) => handleSettingChange("selectKeyboard", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="System Keyboard">System Keyboard</option>
                      <option value="System Keyboard">GBoard</option>
                    </select>
                  </div>

                  {/* Select Order Bell */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Order Bell
                    </label>
                    <select
                      value={settings.selectOrderBell}
                      onChange={(e) => handleSettingChange("selectOrderBell", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="Bell 1">Bell 1</option>
                      <option value="Bell 2">Bell 2</option>
                      <option value="Bell 3">Bell 3</option>
                    </select>
                  </div>

                  {/* Auto Save Interval */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auto Save Interval
                    </label>
                    <select
                      value={settings.autoSaveInterval}
                      onChange={(e) => handleSettingChange("autoSaveInterval", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="1">1 minute</option>
                      <option value="3">3 minutes</option>
                      <option value="5">5 minutes</option>
                      <option value="10">10 minutes</option>
                    </select>
                  </div>

                  {/* Sound Alert */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sound Alert
                    </label>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleSettingChange("soundAlert", !settings.soundAlert)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.soundAlert ? "bg-primary" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.soundAlert ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span className="ml-3 text-sm text-gray-600">
                        {settings.soundAlert ? "On" : "Off"}
                      </span>
                    </div>
                  </div>

                  {/* Notifications */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notifications
                    </label>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleSettingChange("notifications", !settings.notifications)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings.notifications ? "bg-primary" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.notifications ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                      <span className="ml-3 text-sm text-gray-600">
                        {settings.notifications ? "On" : "Off"}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              onClick={handleReset}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Edit Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0  bg-[#00000089] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center bg-primary text-white p-4">
              <h2 className="text-xl font-bold">
                Create Schedule For {editingDay ? editingDay.charAt(0).toUpperCase() + editingDay.slice(1) : ''}
              </h2>
              {/* Close Button */}
              <button
                onClick={handleScheduleModalClose}
                className=" text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 relative">
              
              
              <div className="space-y-4">
                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start time :
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={tempSchedule.open}
                      onChange={(e) => handleTempScheduleChange("open", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <button 
                        onClick={() => {
                          const time = new Date();
                          const timeString = time.toTimeString().slice(0, 5);
                          handleTempScheduleChange("open", timeString);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ▶
                      </button>
                    </div>
                  </div>
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End time :
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={tempSchedule.close}
                      onChange={(e) => handleTempScheduleChange("close", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      <Clock size={16} className="text-gray-400" />
                      <button 
                        onClick={() => {
                          const time = new Date();
                          const timeString = time.toTimeString().slice(0, 5);
                          handleTempScheduleChange("close", timeString);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ▶
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleScheduleModalSubmit}
                className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-[#00000089] bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            {/* Warning Icon */}
            <div className="flex justify-center pt-6 pb-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">!</span>
                </div>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="px-6 pb-6 text-center">
              <h3 className="text-lg font-bold text-gray-800 mb-2">
                Want to delete this schedule
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                If you select Yes the time schedule will be deleted
              </p>
              
              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleDeleteCancel}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  No
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationSettings;
