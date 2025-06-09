import React, { useEffect, useState } from 'react'
import { useAuth } from '../../config/AuthContext';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { base_url } from '../../config/api';
import authInstance from '../../config/authInstance';

function CreateUser() {

    const { auth, logout } = useAuth();
    const navigate = useNavigate();
    const axiosAuth = authInstance(auth, logout, navigate);

    const [selectedRole, setSelectedRole] = useState("Admin");
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userCompany, setUserCompany] = useState(auth.company || '');
    const [userMobile, setUserMobile] = useState('');
    const [userLocation, setUserLocation] = useState('');

    useEffect(() => {
        setUserCompany(auth.company || '');
    }, [auth]);

    const handleMobileChange = (e) => {
        const input = e.target.value.replace(/\D/g, '');
        if (input.length <= 10) {
            setUserMobile(input);
        }
    };

    const handleSubmit = async () => {
           const requestData2 = {
            active: true,
            companyName: userCompany,
            email: userEmail,
            location: userLocation,
            mobileNumber: userMobile,
            role: selectedRole,
            userName: userName,
            returnCredit: 0.0,
        };
        console.log(requestData2);
        if (!selectedRole || !userName.trim() || !userEmail.trim() || !userMobile.trim() || !userLocation.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Fields',
                text: 'Please fill in all the required fields.',
            });
            return;
        }

        if (userMobile.length !== 10 || isNaN(userMobile)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Mobile Number',
                text: 'Mobile number must be exactly 10 digits.',
            });
            return;
        }

        const requestData = {
            active: true,
            companyName: userCompany,
            email: userEmail,
            location: userLocation,
            mobileNumber: userMobile,
            role: selectedRole,
            userName: userName,
            returnCredit: 0.0,
        };
        const token = auth.token;

        try {
            const response = await axiosAuth.post(
                `/public/user_master/add-usermaster`,
                requestData
            );

            const data = response.data;

            if (data.status === 'success') {
                Swal.fire({
                    icon: "success",
                    title: "Account Created",
                    text: "User has been created successfully.",
                }).then(() => {
                    navigate('/user-list');
                });
            } else if (data.status === "failed" && data.error === "email already exists") {
                Swal.fire({
                    icon: "error",
                    title: "Duplicate Email",
                    text: "This email already exists.",
                });
            } else if (data.status === "failed" && data.error === "mobile number already exists") {
                Swal.fire({
                    icon: "error",
                    title: "Duplicate Mobile Number",
                    text: "This mobile number already exists.",
                });
            } else {
                console.error("Unexpected response:", data);
                Swal.fire({
                    icon: "error",
                    title: "Unexpected Error",
                    text: "Something went wrong.",
                });
            }
        } catch (error) {
            console.error("Error:", error);
            Swal.fire({
                icon: "error",
                title: "Network Error",
                text: "Please try again later.",
            });
        }

    }

    return (
        <div className="p-6">
            {/* App Bar */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate('/user-list')}
                    className="text-gray-600 hover:text-blue-600 cursor-pointer"
                >
                    <FaArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Create User</h1>
            </div>

            {/* Form Wrapper */}
            <div className="w-full flex justify-center">
                <div className="w-full max-w-3xl bg-teal-50 p-6 rounded-xl shadow-md">
                    {/* Form Fields */}
                    <div className="grid grid-cols-1 gap-y-6 mb-6 items-center justify-center">
                        {/* Row 1 */}
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="bg-white border border-gray-300 rounded-lg px-4 py-2 h-12 w-full"
                        >
                            <option value="" disabled>Select Role</option>
                            <option value="Admin">Admin</option>
                            <option value="Customer">Customer</option>
                            <option value="Employee">Employee</option>
                        </select>

                        <input
                            type="text"
                            placeholder="User Name"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="bg-white border border-gray-300 rounded-lg px-4 py-2 h-12 w-full"
                        />

                        <input
                            type="email"
                            placeholder="Email Address"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            className="bg-white border border-gray-300 rounded-lg px-4 py-2 h-12 w-full"
                        />

                        {/* Row 2 */}
                        <input
                            type="text"
                            value={userCompany}
                            readOnly
                            className="bg-white border border-gray-300 rounded-lg px-4 py-2 h-12 w-full  cursor-not-allowed"
                        />

                        <input
                            type="text"
                            placeholder="Mobile Number"
                            value={userMobile}
                            onChange={handleMobileChange}
                            className="bg-white border border-gray-300 rounded-lg px-4 py-2 h-12 w-full"
                        />

                        <input
                            type="text"
                            placeholder="Location"
                            value={userLocation}
                            onChange={(e) => setUserLocation(e.target.value)}
                            className="bg-white border border-gray-300 rounded-lg px-4 py-2 h-12 w-full"
                        />
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleSubmit}
                            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300 cursor-pointer"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default CreateUser