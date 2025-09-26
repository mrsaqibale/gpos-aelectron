import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createHashRouter, RouterProvider, Navigate } from "react-router-dom"
import WelcomeScreen from './pages/loginPage/WelcomeScreen.jsx'
import POSLogin from './pages/loginPage/PosLogin.jsx'
import LicenseScreen from './pages/loginPage/LicenseScreen.jsx'
import DashboardLayout from './components/dashboard/DashboardLayout.jsx'
import Dashboard from './pages/dashboard/Dashboard.jsx'
import Reservations from './pages/dashboard/Reservations.jsx'
import ManageOrders from './pages/dashboard/ManageOrders.jsx'
import KitchenDisplaySystem from './pages/dashboard/KitchenDisplaySystem.jsx'
import FoodList from './pages/dashboard/FoodList.jsx'
import FoodFormPage from './components/dashboard/food/FoodFormPage.jsx'
import EmployeeManagement from './pages/dashboard/EmployeeManagement.jsx'
import TableManagementPage from './pages/dashboard/TableManagement.jsx'
import Coupons from './pages/dashboard/Coupons.jsx'
import RunningOrders from './pages/dashboard/RunningOrders.jsx'
import CustomerManagement from './pages/dashboard/CustomerManagement.jsx'
import AdminPanel from './pages/dashboard/AdminPanel.jsx'
import ApplicationSettings from './pages/dashboard/ApplicationSettings.jsx'
import ChangePassword from './pages/dashboard/ChangePassword.jsx'
import Reports from './pages/dashboard/Reports.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { SettingsProvider } from './contexts/SettingsContext.jsx'
import { DraftProvider } from './contexts/DraftContext.jsx'
import { RiderProvider } from './contexts/RiderContext.jsx'
import { NotificationProvider } from './contexts/NotificationContext.jsx'
import { ZoomProvider } from './contexts/ZoomContext.jsx'

console.log('main.jsx loading...');

// Simple error boundary component
const ErrorBoundary = ({ children }) => {
  try {
    return children;
  } catch (error) {
    console.error('Error in component:', error);
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h1>Something went wrong</h1>
        <p>{error.message}</p>
      </div>
    );
  }
};

const router = createHashRouter([
  {
    path: '/',
    element: <ErrorBoundary><ThemeProvider><ZoomProvider><SettingsProvider><DraftProvider><RiderProvider><NotificationProvider><App /></NotificationProvider></RiderProvider></DraftProvider></SettingsProvider></ZoomProvider></ThemeProvider></ErrorBoundary>,
    children: [
      { index: true, element: <ErrorBoundary><WelcomeScreen /></ErrorBoundary> },
      {
        path: 'login',
        element: <ErrorBoundary><POSLogin /></ErrorBoundary>,
      },
      {
        path: 'license',
        element: <ErrorBoundary><LicenseScreen /></ErrorBoundary>,
      },
      {
        path: 'dashboard',
        element: <ErrorBoundary><DashboardLayout /></ErrorBoundary>,
        children: [
          {
            index: true,
            element: <ErrorBoundary><Dashboard /></ErrorBoundary>
          },
          {
            path: 'manage-orders',
            element: <ErrorBoundary><ManageOrders /></ErrorBoundary>
          },
          {
            path: 'reservations',
            element: <ErrorBoundary><Reservations /></ErrorBoundary>
          },
          {
            path: 'kds',
            element: <ErrorBoundary><KitchenDisplaySystem /></ErrorBoundary>
          },
          {
            path: 'food-management',
            element: <ErrorBoundary><FoodList /></ErrorBoundary>
          },
          {
            path: 'food-management/add-food',
            element: <ErrorBoundary><FoodFormPage /></ErrorBoundary>
          },
          {
            path: 'food-management/edit-food/:id',
            element: <ErrorBoundary><FoodFormPage /></ErrorBoundary>
          },
          {
            path: 'employee-management',
            element: <ErrorBoundary><EmployeeManagement /></ErrorBoundary>
          },
          {
            path: 'customer-management',
            element: <ErrorBoundary><CustomerManagement /></ErrorBoundary>
          },
          {
            path: 'table-management',
            element: <ErrorBoundary><TableManagementPage /></ErrorBoundary>
          },
          {
            path: 'coupons',
            element: <ErrorBoundary><Coupons /></ErrorBoundary>
          },
            {
            path: 'sales',
            element: <ErrorBoundary><RunningOrders/></ErrorBoundary>
          },
          {
            path: 'reports',
            element: <ErrorBoundary><Reports /></ErrorBoundary>
          },
          {
            path: 'admin-panel',
            element: <ErrorBoundary><AdminPanel /></ErrorBoundary>
          },
          {
            path: 'application-settings',
            element: <ErrorBoundary><ApplicationSettings /></ErrorBoundary>
          },
          {
            path: 'change-password',
            element: <ErrorBoundary><ChangePassword /></ErrorBoundary>
          },
        ],
      },
      {
        path: '*',
        element: (
          <div>
            <h1>404 - Page not found</h1>
          </div>
        ),
      },
    ],
  },
]);

console.log('Router created, attempting to render...');

const rootElement = document.getElementById("root");
console.log('Root element:', rootElement);

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>
  );
  console.log('App rendered successfully');
} else {
  console.error('Root element not found!');
}