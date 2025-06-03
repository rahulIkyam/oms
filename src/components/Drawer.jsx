import { Home, Package, ShoppingCart, Users, X } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../config/AuthContext';

function Drawer({ isOpen, onToggle }) {
    const [isHidden, setIsHidden] = useState(window.innerWidth < 500);
    const [expandedItem, setExpandedItem] = useState(null);

    const { auth } = useAuth();
    const location = useLocation();

    const handleToggle = () => {
        onToggle(!isOpen);
    };

useEffect(() => {
  const handleResize = () => {
    setIsHidden(window.innerWidth < 500);
  };
  window.addEventListener("resize", handleResize);
  handleResize(); // set initial state
  return () => window.removeEventListener("resize", handleResize);
}, []);



    return (
        <>
            {isOpen && isHidden && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => onToggle(false)}
                ></div>
            )}
            <div
                className={`fixed top-0 left-0 h-screen bg-gradient-to-t from-white to-white 
                    text-blue-900 shadow-xl flex flex-col z-50 transition-transform duration-500 
                    ${isHidden ? (isOpen ? "translate-x-0" : "-translate-x-full") : "w-20"
                    } ${isOpen ? "w-64" : "w-20"} ${isHidden ? "absolute" : "fixed"}`}
            >
                {/* logo */}
                <div className="p-4 flex items-center justify-between border-b border-blue-200">
                    <div className="flex items-center space-x-3">
                        <div className="bg-indigo-600 p-1 rounded-lg">
                            <span className="text-white">⚡</span>
                        </div>
                        {isOpen && (
                            <span className="text-xl font-bold text-blue-900 whitespace-nowrap">
                                My App
                            </span>
                        )}
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {auth.role === 'Customer' && (
                        <>
                        <NavItem
                            to="/customer-dashboard"
                            icon={Home}
                            label="Home"
                            active={location.pathname === '/customer-dashboard'}
                            isOpen={isOpen}
                        />
                        <NavItem
                            to="/customer-orderList"
                            icon={ShoppingCart}
                            label="Orders"
                            active={location.pathname === '/customer-orderList' ||  location.pathname === '/customer-create-order' ||  location.pathname === '/customer-view-order'}
                            isOpen={isOpen}
                        />
                        </> 
                    )}

                    {auth.role === 'Employee' && (
                        <>
                        <NavItem
                            to="/employee-dashboard"
                            icon={Home}
                            label="Home"
                            active={location.pathname === '/employee-dashboard'}
                            isOpen={isOpen}
                        />
                        <NavItem
                            to="/employee-productList"
                            icon={Package}
                            label="Product"
                            active={location.pathname === '/employee-productList'}
                            isOpen={isOpen}
                        />
                        <NavItem
                            to="/employee-customerList"
                            icon={Users}
                            label="Customer"
                            active={location.pathname === '/employee-customerList' || location.pathname === '/employee-customerView'}
                            isOpen={isOpen}
                        />
                        <NavItem
                            to="/employee-orderList"
                            icon={ShoppingCart}
                            label="Orders"
                            active={location.pathname === '/employee-orderList' || location.pathname === '/employee-orderView'}
                            isOpen={isOpen}
                        />
                        </>
                    )}

                    {auth.role === 'Admin' && (
                        <>
                            <NavItem
                                to="/user-list"
                                icon={Home}
                                label="Home"
                                active={location.pathname === '/user-list' ||  location.pathname === '/create-user' ||  location.pathname === '/edit-user'}
                                isOpen={isOpen}
                            />
                        </>
                    )}
                </nav>

                {/* Footer */}
                {/* <div className="p-4 text-sm text-gray-400 border-t border-gray-700 flex items-center justify-between">
                    {isOpen && (
                        <Link to="/profile" className="text-indigo-400 hover:underline flex items-center space-x-2">
                            <Users className="h-5 w-5" />
                            <span>Profile</span>
                        </Link>
                    )}

                    <div className="flex item-center justify-center">
                        <button onClick={handleToggle} className="p-1 rounded-full hover:bg-gray-700 transition-colors duration-200">
                            {isOpen ? <X className="h-5 w-5 text-gray-300 hover:text-white" /> : <Menu className="h-5 w-5 text-gray-300 hover:text-white" />}
                        </button>
                    </div>
                </div> */}
            </div>
        </>
    )
}

const NavItem = ({ to, icon: Icon, label, active, isOpen, onClickSide, setExpandedItem }) => {
    const navigate = useNavigate();
    const handleClick = () => {
        if (onClickSide) onClickSide();
        if (setExpandedItem) setExpandedItem(null);
        navigate(to, { replace: true });  //replaces the current history entry
    };

    return (
        <div
            onClick={handleClick}
            className={`flex items-center p-3 my-3 rounded-lg cursor-pointer transition-all duration-200 ${active ? 
                "bg-blue-600 text-white shadow-md" : "text-blue-900 hover:bg-blue-100 hover:text-blue-900"
                } space-x-3`}
        >
            <Icon className={`h-5 w-5 ${active ? "text-white" : "text-blue-600"}`} />
            {isOpen && (
                <span className={`whitespace-nowrap ${active ? "text-white font-medium" : "text-blue-600"}`}>
                    {label}
                </span>
            )}
        </div>
    );
}

export default Drawer