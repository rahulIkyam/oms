import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import Swal from 'sweetalert2';
import { base_url } from "../../config/api";
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

const OTPForm = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [otpRequested, setOtpRequested] = useState(false);
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [resendCooldown, setResendCooldown] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);

    // Countdown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setOtpLoading(true)
        if (!email) {
            alert("Please enter your email.");
            setOtpLoading(false);
            return;
        }
        else {
            console.log("OTP requested for:", email);
            const requestData = {
                "email": email
            }


            try {
                const response = await axios.post(
                    `${base_url}/public/email/forget_password`,
                    requestData
                );

                const data = response.data;
                setOtpLoading(false);
                if (data) {
                    console.log(data);
                    if (data === "email not found") {
                        Swal.fire({
                            icon: "warning",
                            title: "",
                            text: `email ${email} not found`,
                        });
                    }
                    else {
                        setOtpRequested(true);
                        Swal.fire({
                            icon: "success",
                            title: "",
                            text: `Please Enter otp sent to ${email}`,
                        });
                    }

                }
            } catch (error) {
                setOtpLoading(false);
                console.error("Error:", error);
                Swal.fire({
                    icon: "error",
                    title: "Network Error",
                    text: "Please try again later.",
                });
            }
            console.log("Resent OTP to:", email);
        }

        // Simulate sending OTP
        setOtpLoading(false);


        setResendCooldown(30); // Start 30 sec countdown
    };

    const handleResendOtp = async () => {
        if (resendCooldown === 0) {
            const requestData = {
                "email": email
            }


            try {
                const response = await axiosAuth.post(
                    `/public/email/forget_password`,
                    requestData
                );

                const data = response.data;

                if (data) {
                    console.log(data);

                }
            } catch (error) {
                console.error("Error:", error);
                Swal.fire({
                    icon: "error",
                    title: "Network Error",
                    text: "Please try again later.",
                });
            }
            console.log("Resent OTP to:", email);
            setResendCooldown(30);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setOtpLoading(true);
        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            setOtpLoading(false);
            return;
        }

        const payload = {
            confirmPassword: confirmPassword,
            newPassword: password,
            otp: otp,
        };

        // Log or send to backend
        console.log("Payload to send:", payload);

        try {
            const response = await axios.post(
                `${base_url}/public/email/change_password`,
                payload
            );
            const data = response.data;
            setOtpLoading(false);
            if (data) {
                console.log(data);
                if (data === "Password changed successfully") {
                    Swal.fire({
                        icon: "success",
                        title: "",
                        text: `Password set successfully`,
                    }).then(() => {
                        window.location.reload();
                    });
                    navigate("/login");

                }
                else {

                    Swal.fire({
                        icon: "warning",
                        title: "",
                        text: `${data}`,
                    }).then(() => {
                        //    window.location.reload();
                    });
                }
            }

        }
        catch (e) {
            setOtpLoading(false);
        }
        setOtpLoading(false);

    };


    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-semibold mb-6 text-center">Verify Email</h2>
            <form onSubmit={otpRequested ? handleSubmit : handleRequestOtp} className="space-y-4">
                {/* Email Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                        type="email"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-blue-400"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={otpRequested}
                    />
                </div>

                {!otpRequested ? (
                    <button
                        type="submit"
                        disabled={otpLoading}
                        className={`w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-2 rounded transition-colors duration-200 ${otpLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700 cursor-pointer'}`}
                    >
                        {otpLoading ? (
                            <>
                                <FaSpinner className="animate-spin" />
                                Requesting...
                            </>
                        ) : (
                            'Request OTP'
                        )}

                    </button>
                ) : (
                    <>
                        {/* OTP Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                                placeholder="Enter OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                        </div>

                        {/* Resend OTP Button */}
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                                {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : ""}
                            </span>
                            <button
                                type="button"
                                disabled={resendCooldown > 0}
                                onClick={handleResendOtp}
                                className={`text-sm underline ${resendCooldown > 0 ? "text-gray-400 cursor-not-allowed" : "text-blue-600 hover:text-blue-800"
                                    }`}
                            >
                                Resend OTP
                            </button>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                                    placeholder="Confirm password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={otpLoading}

                            className={`w-full flex justify-center items-center gap-2 bg-green-600 text-white py-2 rounded transition-colors duration-200 ${otpLoading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-green-700 cursor-pointer'}`}
                        >
                            {otpLoading ? (
                                <>
                                <FaSpinner className="animate-spin"/>
                                Submiting...
                                </>
                            ) : (
                                "Submit"
                            )}
                        </button>
                    </>
                )}
            </form>
        </div >
    );
};

export default OTPForm;
