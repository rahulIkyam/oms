import { useEffect, useMemo, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Navigate, Route, Router, Routes, useLocation, useNavigate } from 'react-router-dom'
import Login from './pages/user-management/Login'
import CustomerDashboard from './pages/Customer/CustomerDashboard'
import EmployeeDashboard from './pages/Employee/EmployeeDashboard'
import UserList from './pages/Admin/UserList'
import Drawer from './components/Drawer'
import Appbar from './components/Appbar'
import { useAuth } from './config/AuthContext'
import CreateUser from './pages/Admin/CreateUser'
import EditUser from './pages/Admin/EditUser'
import EmployeeProductList from './pages/Employee/EmployeeProductList'
import EmployeeCustomerList from './pages/Employee/EmployeeCustomerList'
import EmployeeOrderList from './pages/Employee/EmployeeOrderList'
import CustomerOrderList from './pages/Customer/CustomerOrderList'
import CustomerOrderCreation from './pages/Customer/CustomerOrderCreation'
import CustomerViewOrder from './pages/Customer/CustomerViewOrder'
import EmployeeOrderView from './pages/Employee/EmployeeOrderView'
import EmployeeCustomerView from './pages/Employee/EmployeeCustomerView'
import OTPForm from './pages/user-management/OtpForm'

// Protect route based on token
const PrivateRoute = ({ children }) => {
  const { auth } = useAuth();

  return auth.token ? children : <Navigate to="/login" replace />;
};

// Shared layout for protected pages
const MainLayout = ({ children }) => {
  const [isDrawerOpen, setDrawerOpen] = useState(window.innerWidth >= 768);
  const [isDrawerSmall, setSmallDrawer] = useState(window.innerWidth < 768 && window.innerWidth > 500);
  const [isDrawerHidden, setDrawerHidden] = useState(window.innerWidth <= 500);

  useEffect(() => {
    const handleResize = () => {
      setDrawerOpen(window.innerWidth >= 768);
      setSmallDrawer(window.innerWidth < 768 && window.innerWidth > 500);
      setDrawerHidden(window.innerWidth <= 500);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  });

  return (
    <div className="flex min-h-screen min-w-screen bg-white">
      <Drawer isOpen={isDrawerOpen} onToggle={setDrawerOpen} />
      <Appbar isDrawerHidden={isDrawerHidden} toggleDrawer={() => setDrawerOpen(prev => !prev)} />
      <div className={`transition-all duration-700 ${isDrawerOpen ? "ml-60" : isDrawerSmall ? "ml-20" : "ml-0"} w-full`}>
        <div className={`mt-16 ${isDrawerHidden ? 'pt-5 pl-5 pr-10' : 'pl-15 p-10 pr-15'} overflow-auto`}>
          {children}
        </div>
      </div>
    </div>
  );
}

function App() {
  const { auth } = useAuth();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isDrawerOpen, setDrawerOpen] = useState(window.innerWidth >= 768);
  const [isDrawerSmall, setSmallDrawer] = useState(window.innerWidth < 768 && window.innerWidth > 500);
  const [isDrawerHidden, setDrawerHidden] = useState(window.innerWidth <= 500);
  const isDarkMode = false;

  const AdminRoute = ({ children }) => {
    const role = localStorage.getItem("role");
    return role === "Admin" ? children : <Navigate to="/" replace />;
  };
  return (



    <BrowserRouter>
      <Routes>
        <Route path="/login" element={auth.token ? <Navigate to="/" replace /> : <Login />} />
        <Route path="/setPassword" element={<OTPForm />} />


        <Route path="/*" element={
          <PrivateRoute>
            <MainLayout>
              <Routes>
                <Route path="/" element={
                  auth.role === 'Admin' ? <Navigate to="/user-list" replace /> :
                    auth.role === 'Employee' ? <Navigate to="/employee-dashboard" replace /> :
                      <Navigate to="/customer-dashboard" replace />
                } />
                <Route path="/customer-dashboard" element={<CustomerDashboard />} />
                <Route path="/customer-orderList" element={<CustomerOrderList />} />
                <Route path="/customer-create-order" element={<CustomerOrderCreation />} />
                <Route path="/customer-view-order" element={<CustomerViewOrder />} />
                <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
                <Route path="/employee-productList" element={<EmployeeProductList />} />
                <Route path="/employee-customerList" element={<EmployeeCustomerList />} />
                <Route path="/employee-customerView" element={<EmployeeCustomerView />} />
                <Route path="/employee-orderList" element={<EmployeeOrderList />} />
                <Route path="/employee-orderView" element={<EmployeeOrderView />} />
                <Route path="/user-list" element={
                  <AdminRoute>
                    <UserList />
                  </AdminRoute>
                } />

                <Route path="/create-user" element={<CreateUser />} />
                <Route path="/edit-user" element={<EditUser />} />
              </Routes>
            </MainLayout>
          </PrivateRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App


const BlockBackButton = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const homeRoutes = ['/customer-dashboard', '/employee-dashboard', '/user-list'];

  useEffect(() => {
    const currentPath = location.pathname;

    console.log(currentPath);
    console.log(homeRoutes.includes(currentPath));

    const shouldBlock = homeRoutes.includes(currentPath);

    if (shouldBlock) {
      window.history.pushState(null, '', window.location.href);

      const handlePopState = () => {
        // Stay on the same page and push the state again
        window.history.pushState(null, '', window.location.href);
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [location.pathname]);

  return null;
}