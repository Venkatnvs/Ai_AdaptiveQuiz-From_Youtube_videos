import AXIOS_INSTANCE, { FOG_AXIOS_INSTANCE } from '../axios';

export const getCourses = () => 
    FOG_AXIOS_INSTANCE.get('/catalog');

export const getSpecificCourse = (courseId) => 
    AXIOS_INSTANCE.get(`/core/course/${courseId}/overview/`);

export const startVideoSession = (courseId, videoId) => 
    AXIOS_INSTANCE.post(`/core/course/${courseId}/videos/${videoId}/start/`);

export const generateQuiz = (courseId, videoId) => 
    AXIOS_INSTANCE.post(`/core/course/${courseId}/videos/${videoId}/complete/`);

export const getQuizSession = (courseId, videoId) => 
    FOG_AXIOS_INSTANCE.get(`/course/${courseId}/videos/${videoId}/quiz`);

export const submitQuiz = (courseId, videoId, answers) => 
    AXIOS_INSTANCE.post(`/core/course/${courseId}/videos/${videoId}/quiz/submit`, answers);