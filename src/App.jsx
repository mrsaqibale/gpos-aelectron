import { useState } from 'react'
import POSLogin from './pages/loginPage/PosLogin'
import DashboardLayout from './components/dashboard/DashboardLayout'
import { Outlet } from 'react-router-dom';
import RunningOrders from './pages/dashboard/RunningOrders';
import CustomTitleBar from './components/CustomTitleBar';
import { useTheme } from './contexts/ThemeContext';

function App() {
  console.log('App component rendering...');
  const { themeColors } = useTheme();

  return (
    <div className='min-h-screen' style={{ backgroundColor: themeColors.dashboardBackground }}>
      <CustomTitleBar />
      <div className='pt-8'> {/* Add padding-top to account for title bar */}
        <Outlet/>
      </div>
    </div>
  )
}

export default App;
