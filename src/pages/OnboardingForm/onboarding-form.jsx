import React, { useState } from "react";
import { postBasicData, postCompanyData } from "../../services/onboardingServices";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
const OnboardingForm = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        user_name: "",
        company_name: "",
        email: "",
        phone_number: "",
        company_area_street: "",
        company_city: "",
        company_state: "",
        company_zip_code: "",
        company_website: "",
        industry_type: "",
        head_office_location: "",
        company_gst_number: "",
        registration_number: "",
        tenantId: "",
        baseUrl: '',
        commPwd: '',
        commUser: ''
    });

    const [nextButtonLoading, setNextButton] = useState(false);
    const [submitButtonLoading, setSubmitButton] = useState(false);
    const [onboardingId, setOnBoardingId] = useState("");


    const industryOptions = [
        "Information Technology",
        "Finance",
        "Healthcare",
        "Manufacturing",
        "Retail",
        "Other",
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleNext = async (e) => {
        e.preventDefault();
        setNextButton(true);
        var postJson = {
            "approved": false,
            "companyName": formData.company_name,
            "email": formData.email,
            "userName": formData.user_name,
            "usersPhoneNumber": formData.phone_number,
        };

        var postRes = await postBasicData(postJson)
        setNextButton(false);
        if (postRes) {
            console.log(postRes);
            setOnBoardingId(postRes.onboardingId);
            setStep(2);
        }



    };




    const handleSubmit = async (e) => {
        setSubmitButton(true);
        e.preventDefault();
        var postJson = {
            "companyAreaStreet": formData.company_area_street,
            "companyCity": formData.company_city,
            "companyGstNumber": formData.company_gst_number,
            "companyState": formData.company_state,
            "companyWebsite": formData.company_website,
            "companyZipCode": formData.company_zip_code,
            "headOfficeLocation": formData.head_office_location,
            "industryType": formData.industry_type,
            "onboardingId": onboardingId,
            "companyPhonenumber": formData.phone_number,
            "registrationNumber": formData.registration_number,
            "isactive": false,
            "tenantId": formData.tenantId,
            "baseUrl": formData.baseUrl,
            "commPwd": formData.commPwd,
            "commUser":formData.commUser
        }


        var postRes = await postCompanyData(postJson);
        // alert("Form submitted successfully!");

        if (postRes.status == "failed") {

        }
        else if (postRes.status == "success") {

            Swal.fire({
                title: 'Success!',
                text: 'Your onboarding is complete. You will now be redirected.',
                icon: 'success',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Okay',
                customClass: {
                    popup: 'scale-down'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate("/", { replace: true });
                }
                navigate("/", { replace: true });
            });
        }

        setSubmitButton(false);
    };

    return (
        <div className="min-h-screen w-screen bg-gradient-to-b from-blue-50 to-white py-10 px-4">
            <div className="max-w-3xl mx-auto mb-8 p-6 bg-white border border-blue-200 rounded-xl shadow-lg">
                <h1 className="text-2xl font-bold text-blue-800 mb-2">
                    Welcome to the Onboarding Process
                </h1>
                <p className="text-gray-700">
                    Please complete the following steps to set up your profile and company details.
                    <br />
                    This helps us personalize your experience and properly register your account.
                </p>
            </div>

            <StepProgressBar currentStep={step} />

            <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-xl p-8 border border-gray-200">
                <h2 className="text-2xl font-semibold text-indigo-700 mb-6">
                    {step === 1 ? "Step 1: Basic User Details" : "Step 2: Additional Company Details"}
                </h2>

                <form onSubmit={step === 1 ? handleNext : handleSubmit} className="space-y-5">
                    {step === 1 && (
                        <>
                            <InputField label="User Name" name="user_name" value={formData.user_name} onChange={handleChange} required />
                            <InputField label="Company Name" name="company_name" value={formData.company_name} onChange={handleChange} required />
                            <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required />
                            <InputField label="Phone Number (Optional)" name="phone_number" type="tel" value={formData.phone_number} onChange={handleChange} />

                            <div className="pt-4">



                                <button
                                    type="submit"
                                    disabled={nextButtonLoading}
                                    className={`rounded-lg ${nextButtonLoading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-indigo-600 hover:bg-indigo-700 text-white px-6  rounded-md shadow"
                                        } text-white font-semibold py-2 hover:opacity-90 transition duration-300`}
                                >
                                    {nextButtonLoading ? (
                                        <div className="flex justify-center items-center gap-2 px-2">
                                            <div className="h-4 w-4 border-2 border-t-2 border-white border-t-transparent rounded-full animate-spin "></div>
                                            Loading...
                                        </div>
                                    ) : (
                                        "Save"
                                    )}
                                </button>
                            </div>


                        </>
                    )}

                    {step === 2 && (
                        <>
                            <InputField label="Street / Area" name="company_area_street" value={formData.company_area_street} onChange={handleChange} />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="City" name="company_city" value={formData.company_city} onChange={handleChange} />
                                <InputField label="State" name="company_state" value={formData.company_state} onChange={handleChange} />
                            </div>

                            <InputField label="ZIP Code" name="company_zip_code" value={formData.company_zip_code} onChange={handleChange} />
                            <InputField label="Company Website" name="company_website" type="url" value={formData.company_website} onChange={handleChange} />

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Industry Type</label>
                                <select
                                    name="industry_type"
                                    value={formData.industry_type}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-300"
                                >
                                    <option value="">Select</option>
                                    {industryOptions.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </div>

                            <InputField label="Head Office Location" name="head_office_location" value={formData.head_office_location} onChange={handleChange} />
                            <InputField label="GST Number" name="company_gst_number" value={formData.company_gst_number} onChange={handleChange} />
                            <InputField label="Registration Number" name="registration_number" value={formData.registration_number} onChange={handleChange} />

                            {/* Divider Section */}
                            <div className="my-10 border-t border-gray-300"></div>

                            <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Tenant Info</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InputField label="Tenant ID" name="tenantId" value={formData.tenantId} onChange={handleChange} required />
                                <InputField label="Tenant URL" name="baseUrl" value={formData.baseUrl} onChange={handleChange} required />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <InputField label="Communication User" name="commUser" value={formData.commUser} onChange={handleChange} required />
                                <InputField label="Password" name="commPwd" value={formData.commPwd} onChange={handleChange} required />
                            </div>

                            <div className="pt-6 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-md shadow"
                                >
                                    Back
                                </button>

                                <button
                                    type="submit"
                                    disabled={submitButtonLoading}
                                    className={`rounded-lg ${submitButtonLoading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md shadow"
                                        } text-white font-semibold py-2 hover:opacity-90 transition duration-300`}
                                >
                                    {submitButtonLoading ? (
                                        <div className="flex justify-center items-center gap-2 px-2">
                                            <div className="h-4 w-4 border-2 border-t-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Loading...
                                        </div>
                                    ) : (
                                        "Submit"
                                    )}
                                </button>
                            </div>
                        </>

                    )}
                </form>
            </div>
        </div>
    );
};

// Reusable Input Field Component
const InputField = ({ label, name, value, onChange, required = false, type = "text" }) => (
    <div>
        <label className="block text-gray-700 font-medium mb-1">{label}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
    </div>
);

export default OnboardingForm;


const StepProgressBar = ({ currentStep }) => {
    const steps = [
        { label: "Basic Info", number: 1 },
        { label: "Company Details", number: 2 },
        { label: "Email Verification", number: 3 },
    ];

    return (
        <div className="flex justify-center mb-8">
            <div className="flex w-full max-w-3xl">
                {steps.map((step, index) => {
                    const isCompleted = currentStep > step.number;
                    const isActive = currentStep === step.number;
                    const isLast = index === steps.length - 1;

                    return (
                        <div
                            key={step.number}
                            className={`flex items-center flex-1 relative z-10`}
                        >
                            <div
                                className={`flex items-center justify-center px-4 py-2 w-full
                                ${isCompleted ? "bg-green-100 text-gray-700" :
                                        isActive ? "bg-blue-500 text-white" :
                                            "bg-gray-200 text-gray-500"}
                                font-semibold rounded-l-md ${isLast ? "rounded-r-md" : ""}
                                text-sm text-center transition-all`}
                            >
                                {isCompleted ? (
                                    <span className="mr-2">✓</span>
                                ) : (
                                    <span className="mr-2">{step.number}</span>
                                )}
                                {step.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
