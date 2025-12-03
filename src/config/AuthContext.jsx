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
      role: localStorage.getItem('role'),
      userName: localStorage.getItem('userName')
    } : {
      userId: null,
      token: null,
      company: null,
      companyName: null,
      role: null,
      userName:null
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
    localStorage.setItem('company', data.schemaId);
    localStorage.setItem('company Name', data.companyName);
    localStorage.setItem('role', data.role);
    localStorage.setItem('userName', data.userName);
    
    setAuth({
      userId: data.userId,
      token: data.token,
      company: data.schemaId,
      companyName: data.companyName,
      role: data.role,
      userName:data.userName,
    });
  };

  const logout = () => {
    localStorage.clear();
    setAuth({
      userId: null,
      token: null,
      company: null,
      companyName: null,
      role: null,
      userName:null
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
