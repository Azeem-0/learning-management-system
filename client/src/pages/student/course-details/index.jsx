import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import VideoPlayer from "@/components/video-player";
import { StudentContext } from "@/context/student-context";
import { addQuestionService, addReplyService, fetchStudentViewCourseDetailsService, toggleLikeCourseService } from "@/services";
import { CheckCircle, Globe, Users, FileText, ChevronDown, ChevronUp, X } from "lucide-react";
import { useContext, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "@/context/auth-context";

function StudentViewCourseDetailsPage() {
  const {
    studentViewCourseDetails,
    setStudentViewCourseDetails,
    currentCourseDetailsId,
    setCurrentCourseDetailsId,
    loadingState,
    setLoadingState,
  } = useContext(StudentContext);

  const [question, setQuestion] = useState("");
  const [questions, setQuestions] = useState({});
  const [likes, setLikes] = useState(studentViewCourseDetails?.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [expandedLecture, setExpandedLecture] = useState(null);
  const [popupContent, setPopupContent] = useState(null);

  const toggleLectureQuestions = (lectureId) => {
    setExpandedLecture(expandedLecture === lectureId ? null : lectureId);
  };

  const { auth } = useContext(AuthContext);

  const handleAskQuestion = (lectureId) => {
    if (question.trim()) {
      const newQuestion = {
        id: Date.now(),
        questionText: question,
        studentName: auth?.user?.userName,
        date: new Date().toISOString(),
        replies: []
      };
  
      // Add question under the correct lecture
      setQuestions((prev) => ({
        ...prev,
        [lectureId]: [...(prev[lectureId] || []), newQuestion],
      }));
  
      setQuestion("");
      addQuestionService(
        currentCourseDetailsId,
        lectureId,
        auth?.user?._id,
        auth?.user?.userName,
        question
      );
    }
  };
  
  const handleAddAnswer = (lectureId, questionId, answer) => { 
    if (answer.trim()) {
      setQuestions((prev) => {
        const updatedQuestions = { ...prev }; 
        const lectureQuestions = updatedQuestions[lectureId] ? [...updatedQuestions[lectureId]] : [];
  
        updatedQuestions[lectureId] = lectureQuestions.map(q => 
          q._id === questionId 
            ? { 
                ...q, 
                replies: [...q.replies, { 
                  id: Date.now(), 
                  replyText: answer, 
                  userName: auth?.user?.userName, 
                  date: new Date().toISOString() 
                }] 
              } 
            : q
        );
  
        return updatedQuestions;  
      });
  
      addReplyService(currentCourseDetailsId, lectureId, questionId, auth?.user?._id, auth?.user?.userName, answer);
    }
  };
  
  const handleLike = () => {
    if (!hasLiked) {
      setLikes(prevLikes => prevLikes + 1);
      setHasLiked(true);
      toggleLikeCourseService(studentViewCourseDetails?._id, auth?.user?._id);
    }
    else {
      setLikes(prevLikes => prevLikes - 1);
      setHasLiked(false);
      toggleLikeCourseService(studentViewCourseDetails?._id, auth?.user?._id);
    }
  };

  // Function to truncate text and add "Read more" if needed
  const truncateText = (text, limit = 30) => {
    if (!text) return "";
    if (text.length <= limit) return text;
    return text.substring(0, limit) + "...";
  };

  // Function to open popup with full content
  const openPopup = (content, title) => {
    setPopupContent({ content, title });
  };

  // Function to close popup
  const closePopup = () => {
    setPopupContent(null);
  };

  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState(null);

  async function fetchStudentViewCourseDetails() {
    const response = await fetchStudentViewCourseDetailsService(currentCourseDetailsId);

    if (response?.success) {
      setStudentViewCourseDetails(response?.data);
      setLoadingState(false);
      setLikes(response?.data?.likes);
      setHasLiked(response?.data?.likes > 0 && response?.data?.likedBy.includes(auth?.user?._id));

      const questionsMap = {};
      response?.data?.curriculum.forEach((lecture) => {
        questionsMap[lecture._id] = lecture.questions || [];
      });
      setQuestions(questionsMap);
    } else {
      setStudentViewCourseDetails(null);
      setLoadingState(false);
    }
  }

  useEffect(() => {
    if (currentCourseDetailsId !== null) fetchStudentViewCourseDetails();
  }, [currentCourseDetailsId]);

  useEffect(() => {
    if (id) setCurrentCourseDetailsId(id);
  }, [id]);

  useEffect(() => {
    if (!location.pathname.includes("course/details")) {
      setStudentViewCourseDetails(null);
      setCurrentCourseDetailsId(null);
    }
  }, [location.pathname]);

  if (loadingState) return <Skeleton />;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Full content popup */}
      {popupContent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">{popupContent.title}</h3>
              <Button variant="ghost" size="sm" onClick={closePopup} className="p-1">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="prose max-w-none">
              {popupContent.content}
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-900 text-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-4">{studentViewCourseDetails?.title}</h1>
        <p className="text-lg mb-4">{studentViewCourseDetails?.subtitle}</p>
        <div className="flex flex-wrap items-center space-x-6 text-sm">
          <span>Instructor: <strong>{studentViewCourseDetails?.instructorName}</strong></span>
          <span>Created On: <strong>{studentViewCourseDetails?.date?.split("T")[0]}</strong></span>
          <span className="flex items-center"><Globe className="mr-1 h-4 w-4" /> {studentViewCourseDetails?.primaryLanguage}</span>
          <span className="flex items-center"><Users className="mr-1 h-4 w-4" /> {studentViewCourseDetails?.students?.length} Students</span>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-8">
        <main className="md:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>What you'll learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {studentViewCourseDetails?.objectives?.split(",").map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Course Description</CardTitle>
            </CardHeader>
            <CardContent>{studentViewCourseDetails?.description}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              {studentViewCourseDetails?.curriculum?.map((item, index) => (
                <div key={index} className="mb-4">
                  <div className="flex items-center justify-between py-2 border-b">
                    <span>{item.title}</span>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => toggleLectureQuestions(item._id)}
                        className="flex items-center"
                      >
                        Questions {expandedLecture === item._id ? 
                          <ChevronUp className="ml-1 h-4 w-4" /> : 
                          <ChevronDown className="ml-1 h-4 w-4" />}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => selectedVideo === item.videoUrl ? setSelectedVideo(null) : setSelectedVideo(item.videoUrl)}
                      >
                        {selectedVideo === item.videoUrl ? "Close" : "Watch"}
                      </Button>
                    </div>
                  </div>
                  
                  {selectedVideo === item.videoUrl && (
                    <div className="mt-2 rounded-lg overflow-hidden shadow-md">
                      <VideoPlayer url={selectedVideo} width="100%" height="250px" />
                    </div>
                  )}

                  {/* Questions & Answers for this Lecture - Only display if expanded */}
                  {expandedLecture === item._id && (
                    <Card className="mt-4">
                      <CardHeader>
                        <CardTitle>Questions & Answers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {questions[item._id]?.map((q, index) => (
                          <div key={index} className="border rounded-lg p-4 mb-4">
                            <div className="flex justify-between">
                              <h4 className="font-medium">
                                {truncateText(q.questionText)}
                                {q.questionText.length > 30 && (
                                  <Button 
                                    variant="link" 
                                    size="sm" 
                                    className="p-0 h-auto text-blue-500"
                                    onClick={() => openPopup(q.questionText, "Question")}
                                  >
                                    Read more
                                  </Button>
                                )}
                              </h4>
                            </div>
                            <span className="text-sm text-gray-500">by {q.studentName}</span>

                            {/* Answers */}
                            <div className="mt-3 space-y-2">
                              {q?.replies?.map((a, index) => (
                                <div key={index} className="bg-gray-50 p-2 rounded">
                                  <div className="text-sm">
                                    {truncateText(a.replyText)}
                                    {a.replyText.length > 30 && (
                                      <Button 
                                        variant="link" 
                                        size="sm" 
                                        className="p-0 h-auto text-blue-500"
                                        onClick={() => openPopup(a.replyText, "Reply from " + a.userName)}
                                      >
                                        Read more
                                      </Button>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">by {a.userName}</div>
                                </div>
                              ))}
                            </div>

                            {/* Answer form */}
                            <div className="mt-3 flex gap-2">
                              <input
                                type="text"
                                placeholder="Write an answer..."
                                className="flex-1 p-2 border rounded-lg"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleAddAnswer(item._id, q._id, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  const input = e.target.previousSibling;
                                  handleAddAnswer(item._id, q._id, input.value);
                                  input.value = '';
                                }}
                              >
                                Answer
                              </Button>
                            </div>
                          </div>
                        ))}

                        {/* Question form */}
                        <div className="mt-6">
                          <h4 className="font-medium mb-2">Ask a question</h4>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={question}
                              onChange={(e) => setQuestion(e.target.value)}
                              placeholder="Type your question here..."
                              className="flex-1 p-2 border rounded-lg"
                            />
                            <Button onClick={() => handleAskQuestion(item._id)}>Ask</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </main>

        <aside className="md:col-span-1">
          <Card className="sticky top-4">
            <CardContent className="p-6 justify-center flex flex-col">
              <img src={studentViewCourseDetails?.image} alt="Course Thumbnail" className="w-full rounded-lg shadow-md mb-4" />
              {studentViewCourseDetails?.quizzes &&
                studentViewCourseDetails.quizzes.length > 0 && (
                  <Button
                    className="w-full mt-4 flex items-center justify-center"
                    onClick={() => navigate(`/quiz/details/${studentViewCourseDetails?.quizzes[0]?._id}`)}
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    Take Course Quiz
                  </Button>
                )}

              <Button
                variant="outline"
                size="sm"
                onClick={handleLike}
                className={`flex items-center ${hasLiked ? 'text-red-500' : ''}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={hasLiked ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mr-1"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                {likes}
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

export default StudentViewCourseDetailsPage;