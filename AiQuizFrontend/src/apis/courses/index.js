import AXIOS_INSTANCE from '../axios';

export const getCourses = () => 
    AXIOS_INSTANCE.get('/core/catalog/');

export const getSpecificCourse = (courseId) => 
    AXIOS_INSTANCE.get(`/core/course/${courseId}/overview/`);

export const startVideoSession = (courseId, videoId) => 
    AXIOS_INSTANCE.post(`/core/course/${courseId}/videos/${videoId}/start/`);

