import axios from 'axios';
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../config/AuthContext';
import { base_url } from '../../config/api';
import { FaEye, FaEyeSlash } from 'react-icons/fa';


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
    const tempJson = { userName: username, password: password };

    try {
      const res = await axios.post(`${base_url}/public/user_master/login-authenticate`, tempJson);

      if (res.status === 200) {
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
        alert('server error');
      }
    } catch (error) {
      alert('Login failerd: ' + error.message);
    }
  }

  return (
    <div className='login-container flex flex-col md:flex-row h-screen'>
      {/* left side */}
      <div className="login-image relative w-full md:w-1/2 h-auto md:h-full mt-6 md:mt-0 md:m-10">
        <img
          src={images.logo}
          alt="login logo"
          className='absolute top-4 left-4 w-24 md:w-40'
        />
        <img
          src={images.loginImg}
          alt="login image"
          className='w-full h-full object-cover'
        />
      </div>
      {/* Right Side */}
      <div className="login-form w-full md:w-1/2 flex flex-col justify-center items-center p-6 md:p-8">
        <div className="w-full max-w-md">
          <h4 className='text-xl md:text-2xl font-bold text-blue-600 mb-2'>Login to your account</h4>
          <p className='mb-6 text-gray-600 text-sm md:text-base'>Simplify your order management and gain complete control</p>

          <label className="block mb-1 font-medium">Username</label>
          <input
            type="text"
            placeholder='Enter Username'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full md:w-1/2 p-2 border border-gray-300 rounded mb-4"
            required
          />

          <label className="block mb-1 font-medium">Password</label>
          <div className="relative w-full md:w-1/2 mb-4">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder='Enter Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded pr-16"
              required
            />
            <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-600"
            >
              {showPassword ? <FaEyeSlash/> : <FaEye/>}
            </button>
          </div>


          <div className="flex justify-end w-full md:w-1/2 mb-6">
            <Link className="text-sm text-blue-500 hover:underline">Forgot Password?</Link>
          </div>


          <button
            type='submit'
            onClick={checkLogin}
            className="w-full md:w-1/2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login