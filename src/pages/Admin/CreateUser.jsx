import React, { useEffect, useState } from 'react'
import { useAuth } from '../../config/AuthContext';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaSave, FaSpinner } from 'react-icons/fa';
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
    const [houseNo, setHouseNo] = useState('');
    const [streetName, setStreetName] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [cityName, setCityName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setUserCompany(auth.company || '');
    }, [auth]);

    const handleMobileChange = (e) => {
        const input = e.target.value.replace(/\D/g, '');
        if (input.length <= 10) {
            setUserMobile(input);
        }
    };

    const handlePostalCode = (e) => {
        const input = e.target.value.replace(/\D/g, ''); // remove non-digits
        setPostalCode(input); // always update, even if empty
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
            houseNumber: houseNo,
            language: "en",
            postalCode: postalCode,
            streetName: streetName,
            cityName: cityName,
            country: "IN"
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
            houseNumber: houseNo,
            language: "en",
            postalCode: postalCode,
            streetName: streetName,
            cityName: cityName,
            country: "IN"
        };
        setLoading(true);
        try {
            const response = await axiosAuth.post(
                `/user_master/add-usermaster`,
                requestData
            );

            const data = response.data;

            if (data.status === 'success') {
                setLoading(false);
                Swal.fire({
                    icon: "success",
                    title: "Account Created",
                    text: "User has been created successfully.",
                }).then(() => {
                    navigate('/user-list');
                });
            } else if (data.status === "failed" && data.error === "email already exists") {
                setLoading(false);
                Swal.fire({
                    icon: "error",
                    title: "Duplicate Email",
                    text: "This email already exists.",
                });
            } else if (data.status === "failed" && data.error === "mobile number already exists") {
                setLoading(false);
                Swal.fire({
                    icon: "error",
                    title: "Duplicate Mobile Number",
                    text: "This mobile number already exists.",
                });
            } else {
                console.error("Unexpected response:", data);
                setLoading(false);
                Swal.fire({
                    icon: "error",
                    title: "Unexpected Error",
                    text: "Something went wrong.",
                });
            }
        } catch (error) {
            console.error("Error:", error);
            setLoading(false);
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
                <div className="w-full max-w-3xl bg-gradient-to-br from-blue-50 via-white to-blue-100 p-8 rounded-2xl shadow-lg border border-blue-200">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">Fill in User Details</h2>
                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Row 1 */}
                        <div className="relative w-full">
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="block w-full rounded-xl bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500  sm:text-sm/6 border border-neutral-300 appearance-none"
                            >
                                <option value="" disabled>Select Role</option>
                                <option value="Admin">Admin</option>
                                <option value="Customer">Customer</option>
                                <option value="Employee">Employee</option>
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        <input
                            type="text"
                            placeholder="User Name"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="block w-full rounded-xl bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500  sm:text-sm/6 border border-neutral-300 appearance-none"
                        />

                        <input
                            type="email"
                            placeholder="Email"
                            value={userEmail}
                            onChange={(e) => setUserEmail(e.target.value)}
                            className="block w-full rounded-xl bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500  sm:text-sm/6 border border-neutral-300 appearance-none"
                        />

                        {/* Row 2 */}
                        <input
                            type="text"
                            value={userCompany}
                            readOnly
                            className="block w-full rounded-xl bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500  sm:text-sm/6 border border-neutral-300 appearance-none cursor-not-allowed"
                        />

                        <input
                            type="text"
                            placeholder="Mobile Number"
                            value={userMobile}
                            onChange={handleMobileChange}
                            className="block w-full rounded-xl bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500  sm:text-sm/6 border border-neutral-300 appearance-none"
                        />

                        <input
                            type="text"
                            placeholder="Location"
                            value={userLocation}
                            onChange={(e) => setUserLocation(e.target.value)}
                            className="block w-full rounded-xl bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500  sm:text-sm/6 border border-neutral-300 appearance-none"
                        />

                        <input
                            type="text"
                            placeholder="House No"
                            value={houseNo}
                            onChange={(e) => setHouseNo(e.target.value)}
                            className="block w-full rounded-xl bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500  sm:text-sm/6 border border-neutral-300 appearance-none"
                        />

                        <input
                            type="text"
                            placeholder="Street Name"
                            value={streetName}
                            onChange={(e) => setStreetName(e.target.value)}
                            className="block w-full rounded-xl bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500  sm:text-sm/6 border border-neutral-300 appearance-none"
                        />

                        <input
                            type="text"
                            placeholder="Postal Code"
                            value={postalCode}
                            // onChange={(e) => setPostalCode(e.target.value)}
                            onChange={handlePostalCode}
                            className="block w-full rounded-xl bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500  sm:text-sm/6 border border-neutral-300 appearance-none"
                        />

                        <input
                            type="text"
                            placeholder="City Name"
                            value={cityName}
                            onChange={(e) => setCityName(e.target.value)}
                            className="block w-full rounded-xl bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500  sm:text-sm/6 border border-neutral-300 appearance-none"
                        />
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            type='submit'
                            disabled={loading}
                            onClick={handleSubmit}
                            className={` flex justify-center items-center gap-2 bg-blue-600 text-white py-2 px-6 rounded-md transition-colors duration-200 ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700 cursor-pointer'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <FaSave />
                                    Save
                                </>
                            )}

                        </button>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default CreateUser