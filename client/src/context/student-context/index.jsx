import { createContext, useState } from "react";

export const StudentContext = createContext(null);

export default function StudentProvider({ children }) {
  const [studentViewCoursesList, setStudentViewCoursesList] = useState([]);
  const [studentAssignedCoursesList, setStudentAssignedCoursesList] = useState([]);
  const [studentCurrentCourseProgress, setStudentCurrentCourseProgress] = useState({});
  
  const [loadingState, setLoadingState] = useState(true);
  
  // Course Details
  const [studentViewCourseDetails, setStudentViewCourseDetails] = useState(null);
  const [currentCourseDetailsId, setCurrentCourseDetailsId] = useState(null);

  // Quiz Details
  const [studentQuizList, setStudentQuizList] = useState([]);
  const [studentQuizDetails, setStudentQuizDetails] = useState(null);
  const [currentQuizId, setCurrentQuizId] = useState(null);

  return (
    <StudentContext.Provider
      value={{
        // Course-related states
        studentViewCoursesList,
        setStudentViewCoursesList,
        studentAssignedCoursesList,
        setStudentAssignedCoursesList,
        studentCurrentCourseProgress,
        setStudentCurrentCourseProgress,
        studentViewCourseDetails,
        setStudentViewCourseDetails,
        currentCourseDetailsId,
        setCurrentCourseDetailsId,

        // Quiz-related states
        studentQuizList,
        setStudentQuizList,
        studentQuizDetails,
        setStudentQuizDetails,
        currentQuizId,
        setCurrentQuizId,

        // Loading state
        loadingState,
        setLoadingState,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}
