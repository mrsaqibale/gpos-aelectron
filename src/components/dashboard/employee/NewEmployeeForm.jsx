import React, { useState } from 'react';
import { X, Upload, Eye, EyeOff, User, Briefcase } from 'lucide-react';
import VirtualKeyboard from '../../VirtualKeyboard';

const NewEmployeeForm = ({
    showForm,
    setShowForm,
    editingEmployee,
    newEmployee,
    setNewEmployee,
    handleInputChange,
    handleFileChange,
    handleSubmit,
    handleReset,
    imagePreview,
    setImagePreview,
    pinError,
    emailError,
    phoneError,
    showPin,
    setShowPin,
    showConfirmPin,
    setShowConfirmPin,
    handleAnyInputFocus,
    handleInputBlur,
    handleAnyInputClick,
    showKeyboard,
    activeInput,
    handleKeyboardClose,
    onKeyboardChange
}) => {
    const [activeTab, setActiveTab] = useState('personal');
    const [setPinForEmployee, setSetPinForEmployee] = useState(false);

    if (!showForm) return null;

  return (
        <>
            {/* Employee Form - NOW AT THE VERY TOP */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex gap-6 items-center">
                        <h2 className="text-xl font-bold text-primary">
                            {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                        </h2>
                        {/* Tabs */}
                        <div className="flex gap-2 ">
                            <button
                                type="button"
                                onClick={() => setActiveTab('personal')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'personal'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                <User size={18} />
                                Personal Details
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('hr')}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium transition-all ${activeTab === 'hr'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                <Briefcase size={18} />
                                HR
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setShowForm(false);
                            setImagePreview(null);
                            setActiveTab('personal');
                        }}
                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                    >
                        <X size={20} />
                    </button>
                </div>



                <form onSubmit={handleSubmit}>
                    {/* Personal Details Tab */}
                    {activeTab === 'personal' && (
                        <>
                            {/* General Information Section */}
                            <div className="mb-5">
                                <h3 className="text-lg font-semibold text-primary mb-4 pb-2 border-b border-gray-200">
                                    General Information
                                </h3>

                                <div className="flex ">
                                    {/* Left Side - Form Fields */}
                                    <div className="flex-1">
                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    First Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={newEmployee.firstName}
                                                    onChange={handleInputChange}
                                                    onFocus={() => handleAnyInputFocus(null, 'firstName')}
                                                    onBlur={handleInputBlur}
                                                    onClick={() => handleAnyInputClick(null, 'firstName')}
                                                    className="w-[80%] px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                                    placeholder="Ex: John"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Last Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={newEmployee.lastName}
                                                    onChange={handleInputChange}
                                                    onFocus={() => handleAnyInputFocus(null, 'lastName')}
                                                    onBlur={handleInputBlur}
                                                    onClick={() => handleAnyInputClick(null, 'lastName')}
                                                    className="w-[80%] px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                                    placeholder="Ex: Doe"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Date of Birth <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    name="dateOfBirth"
                                                    value={newEmployee.dateOfBirth}
                                                    onChange={handleInputChange}
                                                    onFocus={() => handleAnyInputFocus(null, 'dateOfBirth')}
                                                    onBlur={handleInputBlur}
                                                    onClick={() => handleAnyInputClick(null, 'dateOfBirth')}
                                                    className="w-[80%] px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Select Role <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    name="role"
                                                    value={newEmployee.role}
                                                    onChange={handleInputChange}
                                                    onFocus={() => handleAnyInputFocus(null, 'role')}
                                                    onBlur={handleInputBlur}
                                                    onClick={() => handleAnyInputClick(null, 'role')}
                                                    className="w-[80%] px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                                    required
                                                >
                                                    <option value="">Select Role</option>
                                                    <option value="Manager">Manager</option>
                                                    <option value="Cashier">Cashier</option>
                                                    <option value="Chef">Chef</option>
                                                    <option value="Waiter">Waiter</option>
                                                    <option value="Sweeper">Sweeper</option>
                                                    <option value="Delivery Man">Delivery Man</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Nationality <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="nationality"
                                                    value={newEmployee.nationality}
                                                    onChange={handleInputChange}
                                                    onFocus={() => handleAnyInputFocus(null, 'nationality')}
                                                    onBlur={handleInputBlur}
                                                    onClick={() => handleAnyInputClick(null, 'nationality')}
                                                    className="w-[80%] px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                                    placeholder="Ex: Irish / Pakistani / British"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Phone Number <span className="text-red-500">*</span> <span className="text-xs text-gray-500">(Must start with 08)</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={newEmployee.phone}
                                                    onChange={handleInputChange}
                                                    onFocus={() => handleAnyInputFocus(null, 'phone')}
                                                    onBlur={handleInputBlur}
                                                    onClick={() => handleAnyInputClick(null, 'phone')}
                                                    className={`w-[80%] px-2 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${phoneError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'
                                                        }`}
                                                    placeholder="08xxxxxxxx"
                                                    maxLength="10"
                                                    required
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {newEmployee.phone.length > 0 && (
                                                        <span className={newEmployee.phone.length === 10 && newEmployee.phone.startsWith('08') ? 'text-green-600' : 'text-red-500'}>
                                                            {newEmployee.phone.length}/10 digits
                                                        </span>
                                                    )}
                                                </p>
                                                {phoneError && (
                                                    <p className="mt-1 text-xs text-red-600">{phoneError}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Email Address <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={newEmployee.email}
                                                    onChange={handleInputChange}
                                                    onFocus={() => handleAnyInputFocus(null, 'email')}
                                                    onBlur={handleInputBlur}
                                                    onClick={() => handleAnyInputClick(null, 'email')}
                                                    className={`w-[80%] px-2 py-1.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${emailError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'
                                                        }`}
                                                    placeholder="john.smith@email.com"
                                                    required
                                                />
                                                {emailError && (
                                                    <p className="mt-1 text-xs text-red-600">{emailError}</p>
                                                )}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Address <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    value={newEmployee.address}
                                                    onChange={handleInputChange}
                                                    onFocus={() => handleAnyInputFocus(null, 'address')}
                                                    onBlur={handleInputBlur}
                                                    onClick={() => handleAnyInputClick(null, 'address')}
                                                    className="w-[80%] px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                                    placeholder="123 Main Street, Cashel, Ireland"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                                    Salary per Hour <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    name="salaryPerHour"
                                                    value={newEmployee.salaryPerHour}
                                                    onChange={handleInputChange}
                                                    onFocus={() => handleAnyInputFocus(null, 'salaryPerHour')}
                                                    onBlur={handleInputBlur}
                                                    onClick={() => handleAnyInputClick(null, 'salaryPerHour')}
                                                    className="w-[80%] px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                                    placeholder="0.00"
                                                    min="0"
                                                    step="0.01"
                                                    required
                                                />
                                            </div>

                                            {/* Vehicle Information - Only show for Delivery Man */}
                                            {newEmployee.role === 'Delivery Man' && (
                                                <>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Vehicle Number <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="vehicleNumber"
                                                            value={newEmployee.vehicleNumber}
                                                            onChange={handleInputChange}
                                                            onFocus={() => handleAnyInputFocus(null, 'vehicleNumber')}
                                                            onBlur={handleInputBlur}
                                                            onClick={() => handleAnyInputClick(null, 'vehicleNumber')}
                                                            className="w-[80%] px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                                            placeholder="Ex: ABC-123"
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Vehicle Type <span className="text-red-500">*</span>
                                                        </label>
                                                        <select
                                                            name="vehicleType"
                                                            value={newEmployee.vehicleType}
                                                            onChange={handleInputChange}
                                                            onFocus={() => handleAnyInputFocus(null, 'vehicleType')}
                                                            onBlur={handleInputBlur}
                                                            onClick={() => handleAnyInputClick(null, 'vehicleType')}
                                                            className="w-[80%] px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                                            required
                                                        >
                                                            <option value="">Select Vehicle Type</option>
                                                            <option value="Bike">Bike</option>
                                                            <option value="Car">Car</option>
                                                            <option value="Truck">Truck</option>
                                                            <option value="Bicycle">Bicycle</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            License Number
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name="licenseNumber"
                                                            value={newEmployee.licenseNumber}
                                                            onChange={handleInputChange}
                                                            onFocus={() => handleAnyInputFocus(null, 'licenseNumber')}
                                                            onBlur={handleInputBlur}
                                                            onClick={() => handleAnyInputClick(null, 'licenseNumber')}
                                                            className="w-[80%] px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                                            placeholder="Optional"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            License Expiry Date <span className="text-red-500">*</span>
                                                        </label>
                                                        <input
                                                            type="date"
                                                            name="licenseExpiry"
                                                            value={newEmployee.licenseExpiry}
                                                            onChange={handleInputChange}
                                                            onFocus={() => handleAnyInputFocus(null, 'licenseExpiry')}
                                                            onBlur={handleInputBlur}
                                                            onClick={() => handleAnyInputClick(null, 'licenseExpiry')}
                                                            className="w-[80%] px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                                            required
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right Side - Image Section */}
                                    <div className="w-48">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Employee Image
                                        </label>
                                        <div className="space-y-2">
                                            <label className="border-2 border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors w-full h-32 relative overflow-hidden">
                                                {imagePreview ? (
                                                    <div className="relative w-full h-full">
                                                        <img
                                                            src={imagePreview}
                                                            alt="Preview"
                                                            className="w-full h-full object-cover rounded-md"
                                                        />
                                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                            <span className="text-white text-xs">Change Image</span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload size={20} className="text-gray-400 mb-1" />
                                                        <span className="text-primary font-medium text-xs">Upload Image</span>
                                                    </>
                                                )}
                                                <input
                                                    type="file"
                                                    onChange={handleFileChange}
                                                    className="sr-only"
                                                    accept="image/*"
                                                />
                                            </label>
                                            <div className="text-xs text-gray-500 space-y-1">
                                                <p>Image format - jpg png jpeg</p>
                                                {newEmployee.image && (
                                                    <p className="text-green-600 font-medium">Selected: {newEmployee.image.name}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes Section */}
                            <div className="mb-5">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Notes
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={newEmployee.notes}
                                        onChange={handleInputChange}
                                        onFocus={() => handleAnyInputFocus(null, 'notes')}
                                        onBlur={handleInputBlur}
                                        onClick={() => handleAnyInputClick(null, 'notes')}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                        placeholder="Add any additional information (e.g., role, shift preferences, emergency contact)"
                                        rows="4"
                                    />
                                </div>
                            </div>

                            {/* Account Info Section */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
                                    <span className="text-lg">👤</span>
                                    <h3 className="text-lg font-semibold text-primary">
                                        Account Info
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            PIN Code <span className="text-red-500">*</span> <span className="text-xs text-gray-500">(4-6 digits)</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPin ? "text" : "password"}
                                                name="pin"
                                                value={newEmployee.pin}
                                                onChange={handleInputChange}
                                                onFocus={() => handleAnyInputFocus(null, 'pin')}
                                                onBlur={handleInputBlur}
                                                onClick={() => handleAnyInputClick(null, 'pin')}
                                                className={`w-3/4 px-3 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-6 text-sm ${pinError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'
                                                    }`}
                                                placeholder="••••••"
                                                minLength="4"
                                                maxLength="6"
                                                pattern="[0-9]{4,6}"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPin(!showPin)}
                                                className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPin ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                        {pinError && (
                                            <p className="mt-1 text-xs text-red-600">{pinError}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Confirm PIN <span className="text-red-500">*</span> <span className="text-xs text-gray-500">(Must match above)</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPin ? "text" : "password"}
                                                name="confirmPin"
                                                value={newEmployee.confirmPin}
                                                onChange={handleInputChange}
                                                onFocus={() => handleAnyInputFocus(null, 'confirmPin')}
                                                onBlur={handleInputBlur}
                                                onClick={() => handleAnyInputClick(null, 'confirmPin')}
                                                className="w-3/4 px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-6 text-sm"
                                                placeholder="••••••"
                                                minLength="4"
                                                maxLength="6"
                                                pattern="[0-9]{4,6}"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPin(!showConfirmPin)}
                                                className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showConfirmPin ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* HR Tab */}
                    {activeTab === 'hr' && (
                        <>

                            {/* HR Specific Fields */}
                            <div className="mb-5 grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Joining Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="joiningDate"
                                        value={newEmployee.joiningDate}
                                        onChange={handleInputChange}
                                        onFocus={() => handleAnyInputFocus(null, 'joiningDate')}
                                        onBlur={handleInputBlur}
                                        onClick={() => handleAnyInputClick(null, 'joiningDate')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Shift Start Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        name="shiftStartTime"
                                        value={newEmployee.shiftStartTime}
                                        onChange={handleInputChange}
                                        onFocus={() => handleAnyInputFocus(null, 'shiftStartTime')}
                                        onBlur={handleInputBlur}
                                        onClick={() => handleAnyInputClick(null, 'shiftStartTime')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Shift End Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        name="shiftEndTime"
                                        value={newEmployee.shiftEndTime}
                                        onChange={handleInputChange}
                                        onFocus={() => handleAnyInputFocus(null, 'shiftEndTime')}
                                        onBlur={handleInputBlur}
                                        onClick={() => handleAnyInputClick(null, 'shiftEndTime')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Salary per Hour <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        name="salaryPerHour"
                                        value={newEmployee.salaryPerHour}
                                        onChange={handleInputChange}
                                        onFocus={() => handleAnyInputFocus(null, 'salaryPerHour')}
                                        onBlur={handleInputBlur}
                                        onClick={() => handleAnyInputClick(null, 'salaryPerHour')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                        placeholder="15.50"
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Salary Schedule <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="salarySchedule"
                                        value={newEmployee.salarySchedule}
                                        onChange={handleInputChange}
                                        onFocus={() => handleAnyInputFocus(null, 'salarySchedule')}
                                        onBlur={handleInputBlur}
                                        onClick={() => handleAnyInputClick(null, 'salarySchedule')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                        required
                                    >
                                        <option value="">Select</option>
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Bi-Weekly">Bi-Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Resignation Date
                                    </label>
                                    <input
                                        type="date"
                                        name="resignationDate"
                                        value={newEmployee.resignationDate}
                                        onChange={handleInputChange}
                                        onFocus={() => handleAnyInputFocus(null, 'resignationDate')}
                                        onBlur={handleInputBlur}
                                        onClick={() => handleAnyInputClick(null, 'resignationDate')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                    />
                                </div>
                            </div>

                            {/* Set PIN Checkbox */}
                            <div className="mb-5">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={setPinForEmployee}
                                        onChange={(e) => setSetPinForEmployee(e.target.checked)}
                                        className="w-4 h-4"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Set PIN for this employee</span>
                                </label>
                            </div>

                            {/* PIN Fields - Only show if checkbox is checked */}
                            {setPinForEmployee && (
                                <div className="mb-8 grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Set PIN <span className="text-red-500">*</span> <span className="text-xs text-gray-500">(4-6 digits)</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPin ? "text" : "password"}
                                                name="pin"
                                                value={newEmployee.pin}
                                                onChange={handleInputChange}
                                                onFocus={() => handleAnyInputFocus(null, 'pin')}
                                                onBlur={handleInputBlur}
                                                onClick={() => handleAnyInputClick(null, 'pin')}
                                                className={`w-full px-3 py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10 text-sm ${pinError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'
                                                    }`}
                                                placeholder="••••••"
                                                minLength="4"
                                                maxLength="6"
                                                pattern="[0-9]{4,6}"
                                                required={setPinForEmployee}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPin(!showPin)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                        {pinError && (
                                            <p className="mt-1 text-xs text-red-600">{pinError}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                            Confirm PIN <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPin ? "text" : "password"}
                                                name="confirmPin"
                                                value={newEmployee.confirmPin}
                                                onChange={handleInputChange}
                                                onFocus={() => handleAnyInputFocus(null, 'confirmPin')}
                                                onBlur={handleInputBlur}
                                                onClick={() => handleAnyInputClick(null, 'confirmPin')}
                                                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent pr-10 text-sm"
                                                placeholder="••••••"
                                                minLength="4"
                                                maxLength="6"
                                                pattern="[0-9]{4,6}"
                                                required={setPinForEmployee}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPin(!showConfirmPin)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showConfirmPin ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            Reset
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary text-white font-medium rounded-lg 
              shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_rgba(0,0,0,0.2)] hover:translate-y-[2px] 
              active:shadow-none active:translate-y-[4px] transition-all"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>

            {/* Virtual Keyboard */}
            <VirtualKeyboard
                isVisible={showKeyboard}
                onClose={handleKeyboardClose}
                activeInput={activeInput}
                onInputChange={onKeyboardChange}
                onInputBlur={handleInputBlur}
                inputValue={newEmployee[activeInput] || ''}
                placeholder="Type here..."
            />
        </>
    );
};

export default NewEmployeeForm;