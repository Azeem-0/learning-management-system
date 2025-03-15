import { useState, useEffect, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { StudentContext } from "@/context/student-context";
import { fetchQuizByIdService, startQuizService, submitQuizAttemptService } from "@/services";
import { Clock, Users, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { nContext } from "@/context/notification-context";

function StudentQuizDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const timerRef = useRef(null);
  
  const {
    studentQuizDetails,
    setStudentQuizDetails,
    currentQuizId,
    setCurrentQuizId,
    loadingState,
    setLoadingState,
  } = useContext(StudentContext);

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [showConfirmStart, setShowConfirmStart] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);


  const { notify } = useContext(nContext);
  
  // Format time from seconds to MM:SS
  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  async function fetchQuizDetails() {
    setLoadingState(true);
    try {
      const response = await fetchQuizByIdService(id);
      if (response?.success) {
        setStudentQuizDetails(response?.quiz);
        // If duration is set, convert to seconds
        if (response?.quiz?.duration) {
          setTimeLeft(response?.quiz?.duration * 60);
        }
      } else {
        setStudentQuizDetails(null);
        notify("Failed to load quiz details");
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      notify("Could not fetch quiz details");
    } finally {
      setLoadingState(false);
    }
  }

  useEffect(() => {
    if (id) {
      setCurrentQuizId(id);
      fetchQuizDetails();
    }
    
    // Cleanup timers when component unmounts
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [id]);

  useEffect(() => {
    if (quizStarted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [quizStarted, timeLeft]);

  const handleAnswerSelect = (questionId, optionIndex) => {
    setSelectedAnswers({ ...selectedAnswers, [questionId]: optionIndex });
  };

  const handleConfirmStart = () => {
    setShowConfirmStart(true);
  };

  const handleStartQuiz = async () => {
    setShowConfirmStart(false);
    setLoadingState(true);
    
    try {
      const response = await startQuizService(id);
      if (response?.success) {
        setAttempt(response.attempt);
        setQuizStarted(true);
        setQuestions(response.quiz.questions);
        // Initialize time from server response
        setTimeLeft(response.quiz.duration * 60);
        notify("Quiz started successfully!");
      } else {
        notify(response?.message || "Failed to start quiz");
      }
    } catch (error) {
      console.error("Error starting quiz:", error);
      notify("Error starting quiz. Please try again.");
    } finally {
      setLoadingState(false);
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmSubmit(true);
  };

  const handleTimeUp = () => {
    notify("Time's up! Your quiz will be submitted automatically.");
    handleSubmitQuiz();
  };

  const handleSubmitQuiz = async () => {
    setShowConfirmSubmit(false);
    setSubmitting(true);
    
    // Create responses array from selected answers
    const responses = Object.keys(selectedAnswers).map(questionId => ({
      questionId,
      selectedOptionIndex: selectedAnswers[questionId]
    }));
    
    try {
      const response = await submitQuizAttemptService({
        quizId: id,
        responses
      });
      
      if (response?.success) {
        setQuizResult(response.result);
        setShowResult(true);
        notify("Quiz submitted successfully!");
      } else {
        notify(response?.message || "Failed to submit quiz");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
      notify("Error submitting quiz. Please try again.");
    } finally {
      setSubmitting(false);
      // Clear the timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinishQuiz = () => {
    navigate(`/course/details/${studentQuizDetails?.courseId?._id}`);
  };

  const getCompletionPercentage = () => {
    const answeredCount = Object.keys(selectedAnswers).length;
    return Math.round((answeredCount / questions.length) * 100);
  };

  if (loadingState) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Skeleton className="h-[200px] w-full mb-6" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (showResult && quizResult) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card className="border-t-8 border-t-blue-500">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl">Quiz Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center mb-8">
              {quizResult.passed ? (
                <div className="flex flex-col items-center text-green-500">
                  <CheckCircle size={80} />
                  <span className="text-xl font-bold mt-2">Passed!</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-red-500">
                  <XCircle size={80} />
                  <span className="text-xl font-bold mt-2">Not Passed</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {quizResult.score} / {quizResult.totalPossibleScore}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Percentage</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{quizResult.percentageScore}%</p>
                  <Progress value={quizResult.percentageScore} className="mt-2" />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Time Spent</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {Math.floor(quizResult.timeSpent / 60)}:{(quizResult.timeSpent % 60).toString().padStart(2, '0')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleFinishQuiz}>Return to Course</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-gray-900 text-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold mb-4">{studentQuizDetails?.title}</h1>
        <p className="text-lg mb-4">{studentQuizDetails?.description}</p>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span>Instructor: <strong>{studentQuizDetails?.instructorId?.userName}</strong></span>
          <span>Course: <strong>{studentQuizDetails?.courseId?.title.length > 20 ? studentQuizDetails?.courseId?.title.slice(0, 20) + "..." : studentQuizDetails?.courseId?.title}</strong></span>
          <span className="flex items-center">
            <Clock className="mr-1 h-4 w-4" /> {studentQuizDetails?.duration} minutes
          </span>
          <span className="flex items-center">
            <Users className="mr-1 h-4 w-4" /> {studentQuizDetails?.students?.length} Students
          </span>
        </div>
      </div>

      {!quizStarted ? (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Ready to Begin?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>Before you start, please note:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>This quiz has {studentQuizDetails?.questions?.length} questions.</li>
                <li>You have {studentQuizDetails?.duration} minutes to complete the quiz.</li>
                <li>You can only attempt this quiz once.</li>
                <li>Once started, the timer cannot be paused.</li>
                <li>Your answers are automatically saved as you go.</li>
              </ul>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full bg-green-600 hover:bg-green-700" 
              onClick={handleConfirmStart}
            >
              Start Quiz
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <div className="sticky top-0 z-10 bg-background p-4 border-b mb-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Badge variant={timeLeft < 60 ? "destructive" : timeLeft < 300 ? "warning" : "outline"}>
                <Clock className="mr-2 h-4 w-4" />
                Time Remaining: {formatTime(timeLeft)}
              </Badge>
              <Badge variant="outline">
                Question {currentQuestionIndex + 1} of {questions.length}
              </Badge>
            </div>
            <div>
              <Progress value={getCompletionPercentage()} className="w-32" />
              <span className="text-xs mt-1">Completion: {getCompletionPercentage()}%</span>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>Question {currentQuestionIndex + 1}</span>
                <span className="text-sm font-normal">
                  {questions[currentQuestionIndex]?.points || 1} point{(questions[currentQuestionIndex]?.points || 1) > 1 && 's'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {questions[currentQuestionIndex] && (
                <div>
                  <p className="text-lg font-medium mb-4">{questions[currentQuestionIndex].questionText}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {questions[currentQuestionIndex].options.map((option, oIndex) => (
                      <Button
                        key={oIndex}
                        variant={selectedAnswers[questions[currentQuestionIndex]._id] === oIndex ? "default" : "outline"}
                        className={selectedAnswers[questions[currentQuestionIndex]._id] === oIndex ? "border-2 border-primary" : ""}
                        onClick={() => handleAnswerSelect(questions[currentQuestionIndex]._id, oIndex)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
              >
                Previous
              </Button>
              
              <div className="flex gap-2">
                {currentQuestionIndex === questions.length - 1 ? (
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleConfirmSubmit}
                    disabled={submitting}
                  >
                    Submit Quiz
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion}>
                    Next
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mt-6">
            {questions.map((q, index) => (
              <Button
                key={index}
                variant={currentQuestionIndex === index ? "default" : selectedAnswers[q._id] !== undefined ? "secondary" : "outline"}
                className="h-10 w-10 p-0"
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </>
      )}

      {/* Confirm Start Dialog */}
      <AlertDialog open={showConfirmStart} onOpenChange={setShowConfirmStart}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Quiz</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to start the quiz? The timer will begin immediately, and you'll have {studentQuizDetails?.duration} minutes to complete it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStartQuiz}>Start Quiz</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm Submit Dialog */}
      <AlertDialog open={showConfirmSubmit} onOpenChange={setShowConfirmSubmit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your answers? 
              {Object.keys(selectedAnswers).length < questions.length && (
                <div className="mt-2 flex items-center text-amber-500">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  You've only answered {Object.keys(selectedAnswers).length} out of {questions.length} questions.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitQuiz}>Submit Quiz</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default StudentQuizDetailsPage;