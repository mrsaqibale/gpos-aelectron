import { useState } from 'react'
import POSLogin from './pages/loginPage/PosLogin'
import DashboardLayout from './components/dashboard/DashboardLayout'
import { Outlet } from 'react-router-dom';
import RunningOrders from './pages/dashboard/RunningOrders';
import CustomTitleBar from './components/CustomTitleBar';

function App() {
  console.log('App component rendering...');

  return (
    <div className='min-h-screen bg-bgColor'>
      <CustomTitleBar />
      <div className='pt-8'> {/* Add padding-top to account for title bar */}
        <Outlet/>
      </div>
    </div>
  )
}

export default App;
