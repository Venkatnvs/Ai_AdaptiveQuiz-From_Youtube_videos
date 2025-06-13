import AXIOS_INSTANCE from '../axios';

export const loginApi = formData => 
    AXIOS_INSTANCE.post('/auth/login/', formData);

export const registerApi = formData => 
    AXIOS_INSTANCE.post('/auth/register/', formData);

export const refreshTokenApi = refreshToken => 
    AXIOS_INSTANCE.post('/auth/token/refresh/', { refresh: refreshToken });

export const fetchUserApi = () =>
    AXIOS_INSTANCE.get('/auth/user/');