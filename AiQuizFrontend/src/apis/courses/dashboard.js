import AXIOS_INSTANCE, { FOG_AXIOS_INSTANCE } from '../axios';

export const getTotalStars = () => 
    FOG_AXIOS_INSTANCE.get('/total-stars');

export const getDashboardInfo = () => 
    FOG_AXIOS_INSTANCE.get('/dashboard-info');

export const getQTableOverall = () => 
    FOG_AXIOS_INSTANCE.get('/q-table/overall');