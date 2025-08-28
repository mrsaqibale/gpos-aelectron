# GPOS - Smart Restaurant Billing System

A modern, feature-rich Point of Sale (POS) system built with Electron and React, designed specifically for restaurants and food service businesses. This application provides a complete solution for order management, customer tracking, inventory control, and business analytics.

## 🚀 Features

### Core Functionality
- **Multi-role Authentication**: Admin, Manager, Cashier, and Chef roles with PIN-based login
- **Real-time Order Management**: Complete order lifecycle from creation to delivery
- **Customer Management**: Comprehensive customer database with address tracking
- **Menu Management**: Categories, subcategories, food items with variations and allergens
- **Table Management**: Interactive 3D floor plan with table status tracking
- **Kitchen Display System (KDS)**: Real-time order display for kitchen staff
- **Employee Management**: Staff tracking with register management
- **Payment Processing**: Multiple payment methods with receipt generation

### Advanced Features
- **3D Floor Plan Visualization**: Interactive 3D restaurant layout using Three.js
- **Inventory Management**: Stock tracking with low inventory alerts
- **Order Analytics**: Sales reports and business insights
- **Multi-floor Support**: Manage multiple restaurant floors
- **Theme System**: Customizable color schemes and branding
- **Cross-platform**: Windows and Linux support

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 19, Vite, Tailwind CSS, React Router
- **Backend**: Electron, Node.js, Better SQLite3
- **3D Graphics**: Three.js, React Three Fiber
- **Database**: SQLite with migration system
- **Communication**: IPC (Inter-Process Communication)

### Project Structure
```
gpos-aelectron/
├── electron/                 # Electron main process
│   ├── main.cjs             # Main application entry
│   ├── preload.cjs          # Preload scripts for IPC
│   └── ipchandler/          # IPC handlers for backend operations
├── src/                     # React frontend
│   ├── components/          # Reusable UI components
│   ├── pages/              # Main application pages
│   ├── database/           # Database models and migrations
│   └── utils/              # Utility functions
├── scripts/                # Build and deployment scripts
└── dist/                   # Production build output
```

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)
- Windows 10/11 or Linux

### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd gpos-aelectron

# Install dependencies
npm install

# Start development server
npm run dev

# In another terminal, start Electron
npm run electron
```

### Production Build
```bash
# Build for current platform
npm run build:app

# Build Windows installer
npm run build:win

# Build Linux AppImage
npm run build:linux
```

## 🎯 Usage

### Login System
1. Select your role (Admin, Manager, Cashier, Chef)
2. Enter your 6-digit PIN
3. System validates credentials and grants appropriate access

### Order Management
1. **Create Order**: Select customer, table, or delivery option
2. **Add Items**: Browse menu by categories, add items with variations
3. **Process Payment**: Calculate totals, apply discounts, process payment
4. **Track Status**: Monitor order from kitchen to delivery

### Menu Management
- **Categories**: Organize food items by type (Appetizers, Main Course, etc.)
- **Subcategories**: Further classification (Pizza, Pasta, etc.)
- **Food Items**: Complete item details with images, prices, allergens
- **Variations**: Size options, toppings, add-ons with pricing

### Customer Management
- **Add Customers**: Complete profile with contact information
- **Address Management**: Multiple delivery addresses per customer
- **Order History**: Track all customer orders and preferences
- **Search**: Find customers by name or phone number

### Table Management
- **3D Floor Plan**: Interactive visualization of restaurant layout
- **Table Status**: Real-time availability tracking
- **Floor Management**: Support for multiple floors
- **Table Operations**: Merge, split, and transfer tables

## 🔧 Configuration

### Database Setup
The application uses SQLite with automatic migration system:
```bash
# Database is automatically initialized on first run
# Migrations are applied automatically
```

### Environment Configuration
- Development mode: Uses Vite dev server
- Production mode: Uses built React application
- Database path: Automatically configured for both modes

## 📊 Business Logic

### Order Module (Complex Module)
- **Place Order**: Complete order creation from sales screen
- **Frontend Logic**: All order management logic handled in frontend
- **Backend Operations**: 
  - Order creation and updates
  - Order retrieval by ID
  - Get all orders with filtering
  - Get temporary orders
  - Get orders by different statuses
- **Data Structure**: Both order and order details saved with complete data tracking

### Register Logic (Complex)
- **Employee Check-in/Check-out**: Track employee work sessions
- **Cash Register Management**: Monitor register status and transactions
- **End-of-day Processing**: Close registers with cash reconciliation
- **Transaction History**: Complete audit trail of all transactions

## 🛠️ Development

### Available Scripts
```bash
npm run dev              # Start Vite development server
npm run electron         # Start Electron with dev server
npm run build           # Build React application
npm run build:app       # Build complete application
npm run build:win       # Build Windows installer
npm run build:linux     # Build Linux AppImage
npm start               # Run built application
```

### Database Operations
```bash
# Database models are in src/database/models/
# Migrations are in src/database/migrations/
# Database file: src/database/pos.db
```

### IPC Communication
The application uses structured IPC for frontend-backend communication:
- **Food Management**: CRUD operations for menu items
- **Order Processing**: Complete order lifecycle
- **Customer Operations**: Customer data management
- **Employee Management**: Staff and register operations

## 🔒 Security Features

- **Context Isolation**: Secure Electron configuration
- **Preload Scripts**: Controlled API exposure
- **Input Validation**: Comprehensive data validation
- **Role-based Access**: Granular permission system
- **Audit Trail**: Complete transaction logging

## 🚀 Deployment

### Windows
- Creates desktop shortcut automatically
- Adds to Start Menu
- Provides uninstall option
- Registry integration

### Linux
- AppImage format for easy distribution
- No installation required
- Portable across different Linux distributions

## 📈 Business Benefits

- **Increased Efficiency**: Streamlined order processing
- **Better Customer Service**: Quick access to customer information
- **Improved Inventory Control**: Real-time stock tracking
- **Enhanced Analytics**: Comprehensive business insights
- **Reduced Errors**: Automated calculations and validations
- **Scalable Solution**: Supports multiple locations and users

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For technical support or feature requests, please contact the development team.

---

**GPOS** - Empowering restaurants with modern, efficient, and reliable point-of-sale solutions.


new db update 
new table for new food items 
without binary 


