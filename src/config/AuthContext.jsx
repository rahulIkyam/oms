import React, { createContext, useContext, useEffect, useState } from 'react'


const AuthContext = createContext();
export const AuthProvider = ({ children }) => {

  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem('token');
    return token ? {
      userId: localStorage.getItem('userId'),
      token,
      company: localStorage.getItem('company'),
      companyName: localStorage.getItem('company Name'),
      role: localStorage.getItem('role')
    } : {
      userId: null,
      token: null,
      company: null,
      companyName: null,
      role: null
    };
  });

    // On mount, restore from sessionStorage
    // useEffect(() => {
    //     const storeAuth = {
    //         userId: sessionStorage.getItem('userId'),
    //         token: sessionStorage.getItem('token'),
    //         company: sessionStorage.getItem('company'),
    //         companyName: sessionStorage.getItem('company Name'),
    //         role: sessionStorage.getItem('role')
    //     };
    //     if (storeAuth.token) setAuth(storeAuth);
    // }, []);

  const login = (data) => {
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('token', data.token);
    localStorage.setItem('company', data.company);
    localStorage.setItem('company Name', data.companyName);
    localStorage.setItem('role', data.role);
    
    setAuth({
      userId: data.userId,
      token: data.token,
      company: data.company,
      companyName: data.companyName,
      role: data.role
    });
  };

  const logout = () => {
    localStorage.clear();
    setAuth({
      userId: null,
      token: null,
      company: null,
      companyName: null,
      role: null
    });
  };


  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);




// call anywhere elxe in app
// import {useAuth} from '../path';
// const {auth} = useAuth();
// console.log(auth.token);
