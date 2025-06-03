import axios from "axios"
import Swal from "sweetalert2";

const authInstance = (auth, logout, navigate) => {

    const base_url = "https://ordermanagement-empathic-mandrill-be.cfapps.us10-001.hana.ondemand.com/api";

    const instance = axios.create({
        baseURL: base_url,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`,
        }
    });

    instance.interceptors.response.use(
        response => response,
        error => {
            if (error.response && error.response.status === 401) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Session Expired',
                    text: 'Please login again.',
                    confirmButtonText: 'OK'
                }).then(() => {
                    logout();
                    navigate('/login');
                });
            }
            return Promise.reject(error);
        }
    );
    return instance;
};

export default authInstance;