import Cookies from 'js-cookie';
import { loginApi, registerApi, refreshTokenApi, fetchUserApi } from '../../apis/authentication';
import { AUTH_FAIL, FETCH_USER_FAIL, LOGIN_SUCCESS, LOGOUT, REGISTER_SUCCESS, SET_USER } from '@/constants/actions/AuthConstants';
import { ACCESS_TOKEN, REFRESH_TOKEN, SET_USER_DATA } from '@/constants/CookiesConstants';

export const loginSuccess = (authTokens) => ({
    type: LOGIN_SUCCESS,
    payload: authTokens,
});

export const registerSuccess = () => ({
    type: REGISTER_SUCCESS,
});

export const setUser = (user) => ({
    type: SET_USER,
    payload: user,
});

export const setUserFail = (error) => ({
    type: FETCH_USER_FAIL,
    payload: error,
});

export const authFail = (error) => ({
    type: AUTH_FAIL,
    payload: error,
});

export const logout = () => {
    Cookies.remove(ACCESS_TOKEN);
    Cookies.remove(REFRESH_TOKEN);
    Cookies.remove(SET_USER_DATA);
    return {
        type: LOGOUT,
    };
};

export const loginUser = (formData) => async (dispatch) => {
    try {
        const response = await loginApi(formData);
        Cookies.set(ACCESS_TOKEN, response.data.tokens.access, { expires: 1 });
        Cookies.set(REFRESH_TOKEN, response.data.tokens.refresh, { expires: 30 });
        dispatch(loginSuccess(response.data.tokens));
        dispatch(fetchUser());
        return response;
    } catch (error) {
        dispatch(authFail(error?.response?.data || "Something went wrong! Please try again later."
        ));
        return error;
    }
};

export const registerUser = (formData) => async (dispatch) => {
    try {
        const response = await registerApi(formData);
        dispatch(registerSuccess());
        return response;
    } catch (error) {
        dispatch(authFail(error?.response?.data || "Something went wrong! Please try again later."));
        return error;
    }
};

export const refreshToken = () => async (dispatch) => {
    try {
        const refreshToken = Cookies.get(REFRESH_TOKEN);
        const response = await refreshTokenApi(refreshToken);
        Cookies.set(ACCESS_TOKEN, response.data.access, { expires: 1 });
        Cookies.set(REFRESH_TOKEN, response.data.refresh, { expires: 30 });
        dispatch(loginSuccess(response.data));
    } catch (e) {
        console.log(e);
        dispatch(logout());
    }
};

export const fetchUser = () => async (dispatch) => {
    try {
        const response = await fetchUserApi();
        console.log(response);
        Cookies.set(SET_USER_DATA, JSON.stringify(response.data), { expires: 30 });
        dispatch(setUser(response.data));
    } catch (error) {
        console.log(error);
        dispatch(setUserFail(error?.response?.data || "Something went wrong! Please try again later."));
    }
};