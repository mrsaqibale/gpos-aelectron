import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"
import POSLogin from './pages/loginPage/PosLogin.jsx'
import DashboardLayout from './components/dashboard/DashboardLayout.jsx'
import ManageOrders from './pages/dashboard/ManageOrders.jsx'
import KitchenDisplaySystem from './pages/dashboard/KitchenDisplaySystem.jsx'
import FoodList from './pages/dashboard/FoodList.jsx'
import FoodFormPage from './components/dashboard/food/FoodFormPage.jsx'
import EmployeeManagement from './pages/dashboard/EmployeeManagement.jsx'
import TableManagementPage from './pages/dashboard/TableManagement.jsx'
import Coupons from './pages/dashboard/Coupons.jsx'
import RunningOrders from './pages/dashboard/RunningOrders.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'

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

const router = createBrowserRouter([
  {
    path: '/',
    element: <ErrorBoundary><App /></ErrorBoundary>,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      {
        path: 'login',
        element: <ErrorBoundary><ThemeProvider><POSLogin /></ThemeProvider></ErrorBoundary>,
      },
      {
        path: 'dashboard',
        element: <ErrorBoundary><ThemeProvider><DashboardLayout /></ThemeProvider></ErrorBoundary>,
        children: [
          {
            path: 'manage-orders',
            element: <ErrorBoundary><ManageOrders /></ErrorBoundary>
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