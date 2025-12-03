import { Menu, User } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2';
import logo from '/assets/ikyam-logo.png';

function Appbar({ isDrawerHidden, toggleDrawer }) {

    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'You will be logged out of the application.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, logout',
            cancelButtonText: 'Cancel',
            customClass: {
                popup: 'scale-down',
            }
        }).then((result) => {
            localStorage.clear();
            
            
            if (result.isConfirmed) {
                Swal.fire({
                    icon: 'success',
                    title: 'Logged out!',
                    text: 'You have been successfully logged out.',
                    customClass: {
                        icon: 'scale-down',
                    }
                }).then((res) => {
                    // localStorage.clear();
                    // navigate('/login', { replace: true });
                    navigate('/login', { replace: true });
                    window.location.reload();
                })
            }
        })
    }


    return (
        <header
            className="fixed top-0 left-0 w-full h-16 text-white shadow-md flex items-center justify-between px-6 z-50"
            style={{ background: "linear-gradient(to top,rgb(255, 255, 255),rgb(255, 255, 255))" }}
        >
            {/* Menu Icon (Opens Drawer) */}
            {isDrawerHidden ?
                <button onClick={toggleDrawer} className="text-gray-400 hover:text-white">
                    <Menu className="h-6 w-6" />
                </button> :
                <div><img src={logo} alt="logo" className="mx-auto w-40" /></div>
            }

            {/* <h2 className="text-xl font-semibold text-black">My App</h2> */}

            <div className='flex'>
                <div className="mr-6"></div>
                <div className="relative inline-block text-left" ref={dropdownRef}>
                    {/* Icon Button */}
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className='text-white hover:text-white bg-gray-600 w-10 h-10 flex items-center justify-center rounded cursor-pointer'
                    >
                        <User className="w-5 h-5" />
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                            <div className="py-1">
                                {/* <button
                                    onClick={() => alert('Profile clicked')}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-100"
                                >
                                    Profile
                                </button> */}
                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-100"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Appbar