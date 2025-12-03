import { Home, Package, ShoppingCart, Users, X, LogOut } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../config/AuthContext";

function Drawer({ isOpen, onToggle }) {
    const [isHidden, setIsHidden] = useState(window.innerWidth < 500);
    const { auth } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleResize = () => setIsHidden(window.innerWidth < 500);
        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const navItems = [
        { to: "/employee-dashboard", icon: Home, label: "Dashboard", roles: ["Employee"] },
        { to: "/customer-dashboard", icon: Home, label: "Home", roles: ["Customer"] },
        { to: "/customer-orderList", icon: ShoppingCart, label: "Orders", roles: ["Customer",], activePaths: ["/customer-orderList", "/customer-create-order", "/customer-view-order"], },
        { to: "/employee-orderList", icon: ShoppingCart, label: "Orders", roles: ["Employee"], activePaths: ["/employee-orderList", "/employee-customerView", "/employee-orderView"], },
        { to: "/employee-productList", icon: Package, label: "Products", roles: ["Employee"] },
        { to: "/employee-customerList", icon: Users, label: "Customers", roles: ["Employee"], activePaths: ["/employee-customerList",], },
        { to: "/user-list", icon: Users, label: "Users", roles: ["Admin"], activePaths: ["/user-list","/create-user"] },
        { to: "/onboardingList", icon: Home, label: "Onboarding", roles: [, "SUPER ADMIN"] },


    ];

    return (
        <>
            {isOpen && isHidden && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    onClick={() => onToggle(false)}
                ></div>
            )}

           <div
  className={`fixed top-0 left-0 h-screen z-50 flex flex-col transition-all duration-500
    ${isHidden ? (isOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
    ${isOpen ? "w-64" : "w-20"} 
     backdrop-blur-2xl border-r border-white/10 text-white shadow-2xl`}
>

                {/* Logo */}
                <div className="flex items-center justify-between px-4 py-5 border-b border-slate-700">
                    <div className="flex items-center space-x-2">
                        {/* <img src="/logo192.png" alt="Logo" className="h-6 w-7" /> */}
                        <span className="text-sm font-semibold text-white/90">AdminMart</span>
                    </div>
                    {isHidden && (
                        <button onClick={() => onToggle(false)} className="text-slate-400 hover:text-white">
                            <X size={18} />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto">
                    {/* <div className="mb-4 text-xs text-slate-400 px-2 font-semibold">MENU</div> */}

                    {navItems
                        .filter((item) => item.roles.includes(auth.role))
                        .map(({ to, icon: Icon, label, activePaths }) => {

                            const active = location.pathname === to ||
                                (activePaths && activePaths.includes(location.pathname));
                            return (
                                <div
                                    key={to}
                                    onClick={() => navigate(to, { replace: true })}
                                    className={`flex items-center gap-3 p-3 mb-2 rounded-xl cursor-pointer transition-all duration-300
                    ${active
                                            ? "bg-slate-900 text-white shadow-md"
                                            : "text-slate-900 hover:bg-slate-400 hover:text-white"
                                        }`}
                                >
                                    <Icon size={18} />
                                    {isOpen && <span className="text-sm font-medium">{label}</span>}
                                </div>
                            );
                        })}
                </nav>

                {/* Footer Profile */}
                <div className="p-4 border-t border-slate-700 flex items-center justify-between gap-3">
                    {isOpen && (
                        <div className="flex">
                            <img
                                // src="https://i.pravatar.cc/40"
                                alt="U"
                                className="h-10 w-10 rounded-full border border-slate-600"
                            />
                            <div className="pl-2">
                                <p className="text-sm font-medium text-black">
                                    {auth.userName || ""}
                                </p>
                                <p className="text-xs text-slate-900">Role: {auth.role || "Designer"}</p>
                            </div>
                        </div>
                    )}

                    <button onClick={() => onToggle(!isOpen)} className="text-black hover:text-black">
                        <X size={18} />
                    </button>
                </div>
            </div>
        </>
    );
}

export default Drawer;

/// OLD Drawer
// import { Home, Package, ShoppingCart, Users, X } from 'lucide-react';
// import React, { useEffect, useState } from 'react'
// import { Link, useLocation, useNavigate } from 'react-router-dom'
// import { useAuth } from '../config/AuthContext';

// function Drawer({ isOpen, onToggle }) {
//     const [isHidden, setIsHidden] = useState(window.innerWidth < 500);
//     const [expandedItem, setExpandedItem] = useState(null);

//     const { auth } = useAuth();
//     const location = useLocation();

//     const handleToggle = () => {
//         onToggle(!isOpen);
//     };

//     useEffect(() => {
//         const handleResize = () => {
//             setIsHidden(window.innerWidth < 500);
//         };
//         window.addEventListener("resize", handleResize);
//         handleResize(); // set initial state
//         return () => window.removeEventListener("resize", handleResize);
//     }, []);

//     return (
//         <>
//             {isOpen && isHidden && (
//                 <div
//                     className="fixed inset-0 bg-black bg-opacity-50 z-40"
//                     onClick={() => onToggle(false)}
//                 ></div>
//             )}
//             <div
//                 className={`fixed top-0 left-0 h-screen bg-gradient-to-t from-blue-900 to-blue-900 
//                     text-white shadow-xl flex flex-col z-50 transition-transform duration-500 
//                     ${isHidden ? (isOpen ? "translate-x-0" : "-translate-x-full") : "w-20"
//                     } ${isOpen ? "w-64" : "w-20"} ${isHidden ? "absolute" : "fixed"}`}
//             >
//                 {/* logo */}
//                 <div className="p-4 flex items-center justify-between border-b border-blue-200">
//                     <div className="flex items-center space-x-3">
//                         <div className="bg-white p-1 rounded-lg">
//                             <span className="text-blue-900">⚡</span>
//                         </div>
//                         {isOpen && (
//                             <span className="text-xl font-bold text-white whitespace-nowrap">
//                                 My App
//                             </span>
//                         )}
//                     </div>
//                 </div>

//                 {/* Navigation */}
//                 <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
//                     {auth.role === 'Customer' && (
//                         <>
//                         <NavItem
//                             to="/customer-dashboard"
//                             icon={Home}
//                             label="Home"
//                             active={location.pathname === '/customer-dashboard'}
//                             isOpen={isOpen}
//                         />
//                         <NavItem
//                             to="/customer-orderList"
//                             icon={ShoppingCart}
//                             label="Orders"
//                             active={location.pathname === '/customer-orderList' ||  location.pathname === '/customer-create-order' ||  location.pathname === '/customer-view-order'}
//                             isOpen={isOpen}
//                         />
//                         </> 
//                     )}

//                     {auth.role === 'Employee' && (
//                         <>
//                         <NavItem
//                             to="/employee-dashboard"
//                             icon={Home}
//                             label="Home"
//                             active={location.pathname === '/employee-dashboard'}
//                             isOpen={isOpen}
//                         />
//                         <NavItem
//                             to="/employee-productList"
//                             icon={Package}
//                             label="Product"
//                             active={location.pathname === '/employee-productList'}
//                             isOpen={isOpen}
//                         />
//                         <NavItem
//                             to="/employee-customerList"
//                             icon={Users}
//                             label="Customer"
//                             active={location.pathname === '/employee-customerList' || location.pathname === '/employee-customerView'}
//                             isOpen={isOpen}
//                         />
//                         <NavItem
//                             to="/employee-orderList"
//                             icon={ShoppingCart}
//                             label="Orders"
//                             active={location.pathname === '/employee-orderList' || location.pathname === '/employee-orderView'}
//                             isOpen={isOpen}
//                         />
//                         </>
//                     )}

//                     {auth.role === 'Admin' && (
//                         <>
//                             <NavItem
//                                 to="/user-list"
//                                 icon={Home}
//                                 label="Home"
//                                 active={location.pathname === '/user-list' ||  location.pathname === '/create-user' ||  location.pathname === '/edit-user'}
//                                 isOpen={isOpen}
//                             />
//                         </>
//                     )}
//                 </nav>
//             </div>
//         </>
//     )
// }

// const NavItem = ({ to, icon: Icon, label, active, isOpen, onClickSide, setExpandedItem }) => {
//     const navigate = useNavigate();
//     const handleClick = () => {
//         if (setExpandedItem) setExpandedItem(null);
//         navigate(to, { replace: true });
//     };

//     return (
//         <div
//             onClick={handleClick}
//             className={`flex items-center p-3 my-3 rounded-lg cursor-pointer transition-all duration-200 ${active ? 
//                 "bg-white text-blue-900 shadow-md" : "text-white hover:bg-blue-700 hover:text-white"
//                 } space-x-3`}
//         >
//             <Icon className={`h-5 w-5 ${active ? "text-blue-900" : "text-white"}`} />
//             {isOpen && (
//                 <span className={`whitespace-nowrap ${active ? "text-blue-900 font-medium" : "text-white"}`}>
//                     {label}
//                 </span>
//             )}
//         </div>
//     );
// }

// export default Drawer
