import axiosInstance from "@/api/axiosInstance";

export async function registerService(formData) {
  const { data } = await axiosInstance.post("/auth/register", {
    ...formData,
    role: "user",
  });

  return data;
}

export async function loginService(formData) {
  const { data } = await axiosInstance.post("/auth/login", formData);

  return data;
}

export async function checkAuthService() {
  const { data } = await axiosInstance.get("/auth/check-auth");

  return data;
}

export async function mediaUploadService(formData, onProgressCallback) {
  const { data } = await axiosInstance.post("/media/upload", formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgressCallback(percentCompleted);
    },
  });

  return data;
}

export async function mediaDeleteService(id) {
  const { data } = await axiosInstance.delete(`/media/delete/${id}`);

  return data;
}

export async function deleteCourseService(id) {
  const { data } = await axiosInstance.delete(`/instructor/course/delete/${id}`);

  return data;
}

export async function fetchInstructorCourseListService() {
  const { data } = await axiosInstance.get(`/instructor/course/get`);

  return data;
}

export async function addNewCourseService(formData) {
  const { data } = await axiosInstance.post(`/instructor/course/add`, formData);

  return data;
}

export async function fetchInstructorCourseDetailsService(id) {
  const { data } = await axiosInstance.get(
    `/instructor/course/get/details/${id}`
  );

  return data;
}

export async function updateCourseByIdService(id, formData) {
  const { data } = await axiosInstance.put(
    `/instructor/course/update/${id}`,
    formData
  );

  return data;
}

export async function mediaBulkUploadService(formData, onProgressCallback) {
  const { data } = await axiosInstance.post("/media/bulk-upload", formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgressCallback(percentCompleted);
    },
  });

  return data;
}



export async function fetchStudentViewCourseListService(query) {
  const { data } = await axiosInstance.get(`/student/course/get?${query}`);

  return data;
}

export async function fetchStudentViewCourseDetailsService(courseId) {
  const { data } = await axiosInstance.get(
    `/student/course/get/details/${courseId}`
  );

  return data;
}


export async function getCurrentCourseProgressService(userId, courseId) {
  const { data } = await axiosInstance.get(
    `/student/course-progress/get/${userId}/${courseId}`
  );

  return data;
}

export async function markLectureAsViewedService(userId, courseId, lectureId) {
  const { data } = await axiosInstance.post(
    `/student/course-progress/mark-lecture-viewed`,
    {
      userId,
      courseId,
      lectureId,
    }
  );

  return data;
}

export async function resetCourseProgressService(userId, courseId) {
  const { data } = await axiosInstance.post(
    `/student/course-progress/reset-progress`,
    {
      userId,
      courseId,
    }
  );

  return data;
}

export const addStudentsToCourse = async (courseId, studentEmails) => {
  try {
    const response = await axiosInstance.post(`/instructor/course/${courseId}/add-students`, { studentEmails });
    return response.data;
  } catch (error) {
    console.error("Error adding student:", error.response?.data?.message || error.message);
    throw error;
  }
};


export async function fetchStudentsByCriteria(year, branch) {
  try {
    const response = await axiosInstance.get(`/api/students`, {
      params: { year, branch },
    });

    if (response.data.success) {
      return response.data.students; // Assuming the API returns { success: true, students: [...] }
    } else {
      throw new Error(response.data.message || "Failed to fetch students");
    }
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
}
export async function createQuizService(quizData) {
  const { data } = await axiosInstance.post("/quiz", quizData);
  return data;
}

export async function fetchInstructorQuizzesService(courseId,instructorId, status) {
  if (!instructorId) throw new Error("Instructor ID is required");

  const { data } = await axiosInstance.get(`/quiz?instructorId=${instructorId}&status=${status}&courseId=${courseId}`);
  return data.quizzes;
}

export async function fetchQuizByIdService(quizId) {
  const { data } = await axiosInstance.get(`/quiz/${quizId}`);
  return data;
}

export async function updateQuizService(quizId, updatedQuizData) {
  const { data } = await axiosInstance.put(`/quiz/${quizId}`, updatedQuizData);
  return data;
}

export async function deleteQuizService(quizId) {
  const { data } = await axiosInstance.delete(`/quiz/${quizId}`);
  return data;
}

export async function assignStudentsToQuizService(payload) {
  const { data } = await axiosInstance.post("/quiz/assign-students", payload);
  return data;
}

export async function fetchStudentQuizAttemptsService(userId) {
  const { data } = await axiosInstance.get(`/quiz/attempts/${userId}`);
  return data;
}

export async function startQuizService(quizId) {
  const { data } = await axiosInstance.post(`/quiz/start-quiz`, { quizId });
  return data;
}

export async function submitQuizAttemptService(attemptData) {
  const { data } = await axiosInstance.post(`/quiz/submit-attempt`, attemptData);
  return data;
}

export async function getQuizzesByCourseService(courseId) {
  const { data } = await axiosInstance.get(`/quiz/course/${courseId}`);
  return data;
}

export async function getQuizResultsService(quizId,instructorId) {
  const { data } = await axiosInstance.get(`/quiz/results/${quizId}?instructorId=${instructorId}`);
  return data.results;
}
