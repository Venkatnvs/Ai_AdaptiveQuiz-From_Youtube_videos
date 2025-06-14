import AXIOS_INSTANCE from '../axios';

export const getTotalStars = () => 
    AXIOS_INSTANCE.get('/core/total-stars/');
