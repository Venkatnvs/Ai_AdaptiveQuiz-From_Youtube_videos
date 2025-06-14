import MainDashboard from "./pages/Dashboard/MainDashboard";
import MainCoursesPage from "./pages/AllCourses/MainCoursesPage";
import CourseDetail from "./pages/AllCourses/CourseDetail";
import QuizPage from "./pages/AllCourses/QuizPage";
import QuizAnalysisPage from "./pages/AllCourses/QuizAnalysisPage";

const routes = [
  {
    name: "dashboard",
    path: "/dashboard",
    element: MainDashboard,
  },
  {
    name: "courses",
    path: "/courses",
    element: MainCoursesPage,
  },
  {
    name: "course-detail",
    path: "/courses/:courseId",
    element: CourseDetail,
  },
  {
    name: "quiz",
    path: "/courses/:courseId/videos/:videoId/quiz",
    element: QuizPage,
  },
  {
    name: "quiz-analysis",
    path: "/courses/:courseId/videos/:videoId/quiz/analysis",
    element: QuizAnalysisPage,
  },
];

export default routes;
