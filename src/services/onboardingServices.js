import api from "../config/api";
import authApi from "../config/authApi.js";


export const postBasicData = async (postJson) => {
    try {
        const response = await authApi.post("basic_onboarding_form/add_basic_onboarding_form", postJson);
        return response.data;
    }
    catch (e) {

        if (e.response && e.response.data) {
            return e.response.data;
        }
        else {
            console.error("Error :", e);
        }
    }

}


export const postCompanyData = async (postJson) => {

    try {
        const response = await authApi.post("onboarding_company_details/add_onboarding_company_details", postJson);
        return response.data;
    }
    catch (e) {

        if (e.response && e.response.data) {
            return e.response.data;
        }
        else {
            console.error("Error :", e);
        }
    }
}


export const getAllOnboardingList = async () => {
    try {
        const response = await api.get("basic_onboarding_form/get_all_onboarding_forms");
        return response.data;
    }
    catch (e) {

        if (e.response && e.response.data) {
            return e.response.data;
        }
        else {
            console.error("Error :", e);
        }
    }
}


export const approveOnboarding = async (id) => {
    try {
        const response = await api.post(`onboarding_company_details/approve/${id}`);
        return response.data;
    }
    catch (e) {

        if (e.response && e.response.data) {
            return e.response.data;
        }
        else {
            console.error("Error :", e);
        }
    }
}

export const updateActiveStatus = async (onboarding_id, json) => {
    try {
        const response = await api.patch(`onboarding_company_details/update_by_onboardingId/${onboarding_id}`, json);
        return response.data;

    }
    catch (e) {

        if (e.response && e.response.data) {
            return e.response.data;
        }
        else {
            console.error("Error :", e);
        }
    }

}