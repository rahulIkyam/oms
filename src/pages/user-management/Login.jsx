import axios from 'axios';
import React, { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../config/AuthContext';
import { base_url } from '../../config/api';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FaSpinner } from 'react-icons/fa'; 

const images = {
  loginImg: '/assets/login.png',
  logo: '/assets/ikyam-logo.png'
};

function Login() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  // without Context
  // const checkLogin = async () => {
  //   const tempJson = { userName: username, password: password };
  //   try {
  //     const res = await fetch(`${base_url}/public/user_master/login-authenticate`, {
  //       method: 'POST',
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(tempJson)
  //     });

  //     if (res.status === 200) {
  //       const data = await res.json();

  //       if (data.error) {
  //         if (data.code === '401' && data.error === 'INVALID EMPLOYEE NAME or PASSWORD') {
  //           alert("Enter valid password");
  //         } else if (data.code === '404' && data.status === 'failed') {
  //           alert("User name not found");
  //         } else if (data.code === '403' && data.status === 'failed') {
  //           alert("Your account is inactive. Please contact the administrator.");
  //         }
  //       } else {
  //         sessionStorage.setItem("userId", data.userId);
  //         sessionStorage.setItem("token", data.token);
  //         sessionStorage.setItem("company", data.company);
  //         sessionStorage.setItem("company Name", data["company Name"]);

  //         if (data.role === 'Employee') {
  //           navigate('/Home');
  //         } else if (data.role === 'Customer') {
  //           navigate('/Cus_Home');
  //         } else if (data.role === 'Admin') {
  //           navigate('/User_List');
  //         } else {
  //           alert("Unknown role");
  //         }
  //       }
  //     } else {
  //       alert("Invalid response from server");
  //     }
  //   } catch (error) {
  //     alert("Login failed: " + error.message);
  //   }
  // };

  const checkLogin = async () => {
    setLoading(true);
    const tempJson = { email: username, password: password };

    try {
      const res = await axios.post(`${base_url}/user_master/login-authenticate`, tempJson);

      if (res.status === 200) {
          setLoading(false);
        const data = res.data;

        if (data.error) {
          if (data.code === '401') alert("Invalid Password");
          else if (data.code === '404') alert("User not found");
          else if (data.code === '403') alert("Account inactive");
        } else {
          login(data);

          // if(data.role === "Employee") navigate('/employee-dashboard');
          // else if(data.role === "Customer") navigate('/customer-dashboard');
          // else if(data.role === "Admin") navigate('/user-list');
          // else alert('Unknown Role');
        }
      } else {
        setLoading(false);
        alert('server error');
      }
    } catch (error) {
      setLoading(false);
      alert('Login failerd: ' + error.message);
    }
    setLoading(false);
  }

  return (
    <div className='login-container flex flex-col md:flex-row h-screen'>
      {/* left side */}
     <div className='flex-3'>
       <div className=" flex flex-col items-center justify-center  md:h-full mt-6 md:mt-0 md:m-10">
          <h2 className="text-4xl  font-bold text-blue-600  ">
            Welcome Back
          </h2>
          <p className=" hidden md:block text-gray-600 pb-7 pt-3  text-xl">
            Log in to get started and experience effortless control over your entire order process.
          </p>
        <img
          src={images.loginImg}
          alt="login image"
          className='hidden md:block w-220 h-150 ml-4 object-fill  bg-gray-00'

        />
      </div>
     </div>
      {/* Right Side */}
      <div className=" flex-2 login-form w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-8 ">
        <img
          src={images.logo}
          alt="login logo"
          className=' top-4 left-4 w-24 md:w-40'
        />
         <form className="space-y-5" onSubmit={(e) =>{
               e.preventDefault();
                checkLogin();
            }}>
          <div className="w-full max-w-md bg-white shadow-xl rounded-lg p-6 md:p-8">
            <h4 className="text-2xl font-bold text-blue-600 mb-2">Login to your account</h4>
            <p className="mb-6 text-gray-600 text-sm md:text-base">
              Simplify your order management and gain complete control
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="text"
                placeholder="Enter Email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="flex justify-end mb-6">
              <div className='text-sm text-blue-500 hover:underline cursor-pointer' onClick={()=>{
                 navigate('/setPassword');
              }}>
                Forgot Password ?
              </div>
             
            </div>
            <button
              type="submit"
              onClick={checkLogin}
              disabled={loading}
              className={`w-full flex justify-center items-center gap-2 bg-blue-600 text-white py-2 rounded transition-colors duration-200 ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700 cursor-pointer'
                }`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}

export default Login