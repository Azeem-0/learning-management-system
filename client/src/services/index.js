import axiosInstance from "@/api/axiosInstance";

export async function registerService(formData) {
  const { data } = await axiosInstance.post("/auth/register", {
    ...formData,
    role: "user",
  });

  return data;
}

export async function loginService(formData) {
  try {
    const { data } = await axiosInstance.post("/auth/login", formData);
    return data;
  }
  catch (err) {
    console.error("Error logging in:", err);
    throw err;
  }

}

export async function checkAuthService() {
  const { data } = await axiosInstance.get("/auth/check");

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

export async function deleteCourseService(id) {
  const { data } = await axiosInstance.delete(`/courses/${id}`);

  return data;
}

export async function fetchInstructorCourseListService() {
  const { data } = await axiosInstance.get(`/courses`);

  return data;
}

export async function addNewCourseService(formData) {
  const { data } = await axiosInstance.post(`/courses`, formData);

  return data;
}

export async function fetchInstructorCourseDetailsService(id) {
  const { data } = await axiosInstance.get(
    `/courses/${id}`
  );

  return data;
}

export async function updateCourseByIdService(id, formData) {
  const { data } = await axiosInstance.put(
    `/courses/${id}`,
    formData
  );

  return data;
}



export async function fetchStudentViewCourseListService(query) {
  const { data } = await axiosInstance.get(`/student/courses?${query}`);

  return data;
}

export async function fetchStudentViewCourseDetailsService(courseId) {
  const { data } = await axiosInstance.get(
    `/student/courses/${courseId}`
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
    const response = await axiosInstance.post(`/courses/${courseId}/students`, { studentEmails });
    return response.data;
  } catch (error) {
    console.error("Error adding student:", error.response?.data?.message || error.message);
    throw error;
  }
};


export async function fetchStudentsByCriteria(year, branch) {
  try {
    const response = await axiosInstance.get(`/students`, {
      params: { year, branch },
    });

    if (response.data.success) {
      return response.data.students;
    } else {
      throw new Error(response.data.message || "Failed to fetch students");
    }
  } catch (error) {
    console.error("Error fetching students:", error);
    return [];
  }
}
export async function createQuizService(quizData) {
  const { data } = await axiosInstance.post("/quizzes", quizData);
  return data;
}

export async function fetchInstructorQuizzesService(courseId, instructorId, status) {
  if (!instructorId) throw new Error("Instructor ID is required");

  const { data } = await axiosInstance.get(`/quizzes?instructorId=${instructorId}&status=${status}&courseId=${courseId}`);
  return data.quizzes;
}

export async function fetchQuizByIdService(quizId) {
  const { data } = await axiosInstance.get(`/quizzes/${quizId}`);
  return data;
}

export async function updateQuizService(quizId, updatedQuizData) {
  const { data } = await axiosInstance.put(`/quizzes/${quizId}`, updatedQuizData);
  return data;
}

export async function deleteQuizService(quizId) {
  const { data } = await axiosInstance.delete(`/quizzes/${quizId}`);
  return data;
}

export async function assignStudentsToQuizService(payload) {
  const { data } = await axiosInstance.post("/quizzes/assign-students", payload);
  return data;
}

export async function fetchStudentQuizAttemptsService(userId) {
  const { data } = await axiosInstance.get(`/quizzes/attempts/${userId}`);
  return data;
}

export async function startQuizService(quizId) {
  const { data } = await axiosInstance.post(`/quizzes/start`, { quizId });
  return data;
}

export async function submitQuizAttemptService(attemptData) {
  const { data } = await axiosInstance.post(`/quizzes/submit`, attemptData);
  return data;
}

export async function getQuizzesByCourseService(courseId) {
  const { data } = await axiosInstance.get(`/quizzes/course/${courseId}`);
  return data;
}

export async function getQuizResultsService(quizId, instructorId) {
  const { data } = await axiosInstance.get(`/quizzes/${quizId}/results?instructorId=${instructorId}`);
  return data.results;
}

export async function addQuestionService(courseId, lectureId, studentId, studentName, questionText) {
  try {
    const response = await axiosInstance.post(`/student/courses/${courseId}/lectures/${lectureId}/questions`, {
      studentId,
      studentName,
      questionText,
    });

    return response.data;
  } catch (error) {
    console.error("Error adding question:", error);
    throw error;
  }
}


export async function addReplyService(courseId, lectureId, questionId, userId, userName, replyText) {
  try {
    const response = await axiosInstance.post(
      `/student/courses/${courseId}/lectures/${lectureId}/questions/${questionId}/replies`,
      { userId, userName, replyText }
    );

    return response.data;
  } catch (error) {
    console.error("Error adding reply:", error);
    throw error;
  }
}

export async function toggleLikeCourseService(courseId, userId) {
  console.log(courseId, "courseId", userId, "userId");
  try {
    const response = await axiosInstance.post(`/student/courses/like`, { courseId, userId });

    return response.data;
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
}

export async function updateLectureProgressService(userId, courseId, lectureId, progressValue) {

  const response = await axiosInstance.post("/student/courses/progress", {
    userId,
    courseId,
    lectureId,
    progressValue
  });

  console.log("Progress updated:", response.data);
}