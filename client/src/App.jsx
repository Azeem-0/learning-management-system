import { Route, Routes } from "react-router-dom";
import AuthPage from "./pages/auth";
import RouteGuard from "./components/route-guard";
import { useContext } from "react";
import { AuthContext } from "./context/auth-context";
import InstructorDashboardpage from "./pages/instructor";
import StudentViewCommonLayout from "./components/student-view/common-layout";
import StudentHomePage from "./pages/student/home";
import NotFoundPage from "./pages/not-found";
import AddNewCoursePage from "./pages/instructor/add-new-course";
import StudentViewCoursesPage from "./pages/student/courses";
import StudentViewCourseDetailsPage from "./pages/student/course-details";
import StudentCoursesPage from "./pages/student/student-courses";
import StudentViewCourseProgressPage from "./pages/student/course-progress";
import PlaygroundPage from "./pages/playground";
import ContestsPage from "./pages/contests";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import StudentQuizDetailsPage from "./pages/quiz";
import QuizDashboard from "./pages/instructor/quiz-dashboard";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import StudentProgressAnalysis from "./pages/student/student-progress";

function App() {
  const { auth } = useContext(AuthContext);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        theme="light"
      />
      <Routes>
        <Route
          path="/auth"
          element={
            <RouteGuard
              element={<AuthPage />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        />

        <Route
          path="/instructor"
          element={
            <RouteGuard
              element={<InstructorDashboardpage />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        />

        <Route
          path="/instructor/create-new-course"
          element={
            <RouteGuard
              element={<AddNewCoursePage />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        />

        {/* working */}
        <Route
          path="/instructor/edit-course/:courseId"
          element={
            <RouteGuard
              element={<AddNewCoursePage />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        />

        <Route
          path="/instructor/quiz-dashboard"
          element={
            <RouteGuard
              element={<QuizDashboard />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        />

        {/* working */}
        <Route
          path="/"
          element={
            <RouteGuard
              element={<StudentViewCommonLayout />}
              authenticated={auth?.authenticate}
              user={auth?.user}
            />
          }
        >
          <Route path="" element={<StudentHomePage />} />
          <Route path="home" element={<StudentHomePage />} />
          <Route path="courses" element={<StudentViewCoursesPage />} />
          <Route path="contests" element={<ContestsPage />} />
          <Route
            path="/student-progress"
            element={
              <RouteGuard
                element={<StudentProgressAnalysis />}
                authenticated={auth?.authenticate}
                user={auth?.user}
              />
            }
          />
          <Route
            path="course/details/:id"
            element={<StudentViewCourseDetailsPage />}
          />

          <Route path="/playground" element={<PlaygroundPage />} />

          <Route
            path="/quiz/details/:id"
            element={<StudentQuizDetailsPage />}
          />

          <Route path="student-courses" element={<StudentCoursesPage />} />
          <Route
            path="course-progress/:id"
            element={<StudentViewCourseProgressPage />}
          />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
