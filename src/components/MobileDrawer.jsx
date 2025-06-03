import React from 'react'

function MobileDrawer({ isOpen, toggleDrawer }) {
    return (
        <>
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
                onClick={toggleDrawer}
            />

            <div
                className={`fixed top-0 left-0 h-full w-3/4 max-w-xs bg-white shadow-lg z-50 transform ${isOpen ? "translate-x-0" : "-translate-x-full"
                    } transition-transform duration-300 ease-in-out`}
            >
                {/* Close Button */}
                <button
                    className="p-4 text-gray-600 hover:text-black"
                    onClick={toggleDrawer}
                >
                    Close
                </button>

                {/* Navigation Items */}
                <nav className="p-4">
                    <ul>
                        <li className="p-3 text-lg hover:bg-gray-200">Home</li>
                        <li className="p-3 text-lg hover:bg-gray-200">Profile</li>
                        <li className="p-3 text-lg hover:bg-gray-200">Settings</li>
                    </ul>
                </nav>
            </div>
        </>
    )
}

export default MobileDrawer