import React, { useContext } from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Applyjob from './pages/ApplyJob'
import Applications from './pages/Applications'
import RecruiterLogin from './components/RecruiterLogin'
import AdminLogin from './components/AdminLogin'
import { AppContext } from './context/AppContext'
import Dashboard from './pages/Dashboard'
import AddJob from './pages/AddJob'
import ManageJobs from './pages/ManageJobs'
import ViewApplications from './pages/ViewApplications'
import 'quill/dist/quill.snow.css' 
import { ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css';
import BackToTop from './components/BackToTop' ;
import AdminDashboard from './pages/AdminDashboard'
import AdminManageJobs from './pages/AdminManageJobs'
import AdminManageUsers from './pages/AdminManageUsers'


const App = () => {
  const { showRecruiterLogin, showAdminLogin, companyToken } = useContext(AppContext)

  return (
    <div className="relative">
      {showRecruiterLogin && <RecruiterLogin />}
      {showAdminLogin && <AdminLogin />}

      <ToastContainer />

      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/apply-job/:id' element={<Applyjob/>}/>
        <Route path='/applications' element={<Applications/>}/>
        
        <Route path='/dashboard' element={<Dashboard />}>
          {
            companyToken && (
              <>
                <Route path='add-job' element={<AddJob />} />  
                <Route path='manage-jobs' element={<ManageJobs />} />  
                <Route path='view-applications' element={<ViewApplications />} />  
              </>
            )
          }
        </Route>
        
         {/* Admin Dashboard */}
  <Route path='/admin/dashboard' element={<AdminDashboard />}>
    <Route path='manage-jobs' element={<AdminManageJobs />} />
    <Route path='manage-users' element={<AdminManageUsers />} />
  </Route>
      </Routes>

      <BackToTop />
    </div>
  )
}

export default App;
