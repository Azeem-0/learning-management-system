import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { InstructorContext } from "@/context/instructor-context";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, ChevronRightIcon, ClockIcon, GraduationCapIcon, PlusIcon, Trash2Icon, UsersIcon, XIcon, CheckIcon } from "lucide-react";
import { fetchInstructorCourseListService, createQuizService, fetchInstructorQuizzesService, deleteQuizService, updateQuizService, getQuizResultsService } from "@/services";
import { format } from "date-fns";

const QuizManagement = () => {
  const navigate = useNavigate();
  const { instructorProfile } = useContext(InstructorContext);

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("active");

  // New quiz form
  const [showNewQuizDialog, setShowNewQuizDialog] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: "",
    description: "",
    duration: 30,
    passingScore: 60,
    questions: [],
    startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endDate: "",
    shuffleQuestions: false
  });

  // Question editing
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctOptionIndex: 0,
    points: 1
  });

  // Delete confirmation
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Results view
  const [quizResults, setQuizResults] = useState(null);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    fetchInstructorCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse && instructorProfile?._id) {
      fetchQuizzes();
    }
  }, [selectedCourse, selectedTab, instructorProfile]);

  const fetchInstructorCourses = async () => {
    try {
      setLoading(true);
      const response = await fetchInstructorCourseListService();
      if (response.success) {
        setCourses(response.courses);
        if (response.courses.length > 0) {
          setSelectedCourse(response.courses[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching instructor courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const quizData = await fetchInstructorQuizzesService(
        selectedCourse,
        instructorProfile._id,
        selectedTab === "active"
      );
      setQuizzes(quizData || []);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async () => {
    try {
      if (quizForm.questions.length === 0) {
        alert("Please add at least one question to the quiz");
        return;
      }

      setLoading(true);
      const quizData = {
        ...quizForm,
        courseId: selectedCourse,
      };

      const response = await createQuizService(quizData);
      if (response.success) {
        setShowNewQuizDialog(false);
        resetQuizForm();
        fetchQuizzes();
      }
    } catch (error) {
      console.error("Error creating quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!quizToDelete) return;

    try {
      setLoading(true);
      const response = await deleteQuizService(quizToDelete);
      if (response.success) {
        fetchQuizzes();
      }
    } catch (error) {
      console.error("Error deleting quiz:", error);
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
      setQuizToDelete(null);
    }
  };

  const handleUpdateQuizStatus = async (quizId, newStatus) => {
    try {
      setLoading(true);
      const response = await updateQuizService(quizId, { status: newStatus });
      if (response.success) {
        fetchQuizzes();
      }
    } catch (error) {
      console.error("Error updating quiz status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    if (!currentQuestion.questionText || currentQuestion.options.some(opt => !opt)) {
      alert("Please fill in all question and option fields");
      return;
    }

    setQuizForm({
      ...quizForm,
      questions: [
        ...quizForm.questions,
        { ...currentQuestion }
      ]
    });

    // Reset for next question
    setCurrentQuestion({
      questionText: "",
      options: ["", "", "", ""],
      correctOptionIndex: 0,
      points: 1
    });
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = [...quizForm.questions];
    updatedQuestions.splice(index, 1);
    setQuizForm({
      ...quizForm,
      questions: updatedQuestions
    });
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...currentQuestion.options];
    updatedOptions[index] = value;
    setCurrentQuestion({
      ...currentQuestion,
      options: updatedOptions
    });
  };

  const resetQuizForm = () => {
    setQuizForm({
      title: "",
      description: "",
      duration: 30,
      passingScore: 60,
      questions: [],
      startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      endDate: "",
      shuffleQuestions: false
    });
    setCurrentQuestion({
      questionText: "",
      options: ["", "", "", ""],
      correctOptionIndex: 0,
      points: 1
    });
  };

  const fetchQuizResults = async (quizId) => {
    try {
      setLoadingResults(true);
      const response = await getQuizResultsService(quizId);
      if (response.success) {
        setQuizResults(response.results);
        setShowResultsDialog(true);
      }
    } catch (error) {
      console.error("Error fetching quiz results:", error);
    } finally {
      setLoadingResults(false);
    }
  };

  const navigateToQuizDetail = (quizId) => {
    navigate(`/instructor/quiz/${quizId}`);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quiz Management</h1>
        <Button onClick={() => setShowNewQuizDialog(true)}>
          <PlusIcon className="mr-2 h-4 w-4" /> Create Quiz
        </Button>
      </div>

      <div className="mb-6">
        <Label htmlFor="courseSelect">Select Course</Label>
        <Select
          value={selectedCourse}
          onValueChange={setSelectedCourse}
          disabled={courses.length === 0}
        >
          <SelectTrigger id="courseSelect" className="w-full max-w-md">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course._id} value={course._id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="active" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active Quizzes</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Quizzes</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {loading ? (
            <div className="text-center py-10">Loading quizzes...</div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">No active quizzes found for this course</p>
              <Button onClick={() => setShowNewQuizDialog(true)}>Create Your First Quiz</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <Card key={quiz._id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <span className="line-clamp-1">{quiz.title}</span>
                      <Badge>{quiz.questions.length} Questions</Badge>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        <span>{quiz.duration} minutes</span>
                      </div>
                      <div className="flex items-center">
                        <GraduationCapIcon className="h-4 w-4 mr-2" />
                        <span>Pass: {quiz.passingScore || 60}%</span>
                      </div>
                      <div className="flex items-center">
                        <UsersIcon className="h-4 w-4 mr-2" />
                        <span>{quiz.students?.length || 0} students</span>
                      </div>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        <span>
                          {quiz.startDate
                            ? `Available from ${new Date(quiz.startDate).toLocaleDateString()}`
                            : "Always available"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => navigateToQuizDetail(quiz._id)}>
                      Details <ChevronRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => fetchQuizResults(quiz._id)}>
                        Results
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setQuizToDelete(quiz._id);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2Icon className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="inactive" className="space-y-6">
          {loading ? (
            <div className="text-center py-10">Loading quizzes...</div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No inactive quizzes found for this course</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <Card key={quiz._id} className="hover:shadow-md transition-shadow opacity-75">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <span className="line-clamp-1">{quiz.title}</span>
                      <Badge variant="outline">{quiz.questions.length} Questions</Badge>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-2" />
                        <span>{quiz.duration} minutes</span>
                      </div>
                      <div className="flex items-center">
                        <UsersIcon className="h-4 w-4 mr-2" />
                        <span>{quiz.students?.length || 0} students</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateQuizStatus(quiz._id, true)}
                    >
                      Activate
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setQuizToDelete(quiz._id);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create New Quiz Dialog */}
      <Dialog open={showNewQuizDialog} onOpenChange={setShowNewQuizDialog}>
        <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Quiz</DialogTitle>
            <DialogDescription>
              Create a new quiz for your course. Add questions and configure settings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Quiz Title</Label>
                  <Input
                    id="title"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                    placeholder="Final Exam"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={quizForm.description}
                    onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                    placeholder="This quiz covers chapters 1-5..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      value={quizForm.duration}
                      onChange={(e) => setQuizForm({ ...quizForm, duration: parseInt(e.target.value) })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="passingScore">Passing Score (%)</Label>
                    <Input
                      id="passingScore"
                      type="number"
                      min="1"
                      max="100"
                      value={quizForm.passingScore}
                      onChange={(e) => setQuizForm({ ...quizForm, passingScore: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={quizForm.startDate}
                      onChange={(e) => setQuizForm({ ...quizForm, startDate: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">End Date (optional)</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={quizForm.endDate}
                      onChange={(e) => setQuizForm({ ...quizForm, endDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="shuffleQuestions"
                    checked={quizForm.shuffleQuestions}
                    onChange={(e) => setQuizForm({ ...quizForm, shuffleQuestions: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="shuffleQuestions" className="cursor-pointer">
                    Shuffle questions for each student
                  </Label>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Add Questions</h3>
                
                <div>
                  <Label htmlFor="questionText">Question</Label>
                  <Textarea
                    id="questionText"
                    value={currentQuestion.questionText}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                    placeholder="Enter your question here"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {currentQuestion.options.map((option, i) => (
                    <div key={i} className="relative">
                      <Label htmlFor={`option-${i}`}>Option {i + 1}</Label>
                      <div className="flex items-center">
                        <Input
                          id={`option-${i}`}
                          value={option}
                          onChange={(e) => handleOptionChange(i, e.target.value)}
                          placeholder={`Option ${i + 1}`}
                          className={currentQuestion.correctOptionIndex === i ? "border-green-500 border-2" : ""}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="ml-2"
                          onClick={() => setCurrentQuestion({ ...currentQuestion, correctOptionIndex: i })}
                        >
                          {currentQuestion.correctOptionIndex === i ? (
                            <CheckIcon className="h-4 w-4 text-green-500" />
                          ) : (
                            "Set Correct"
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <Label htmlFor="points">Points</Label>
                  <Input
                    id="points"
                    type="number"
                    min="1"
                    value={currentQuestion.points}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })}
                    className="w-24"
                  />
                </div>

                <Button onClick={handleAddQuestion} className="w-full">
                  Add Question
                </Button>

                {quizForm.questions.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h4 className="font-medium">Questions Added ({quizForm.questions.length})</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
                      {quizForm.questions.map((q, index) => (
                        <div key={index} className="flex justify-between items-center p-2 border rounded bg-slate-50">
                          <div className="flex-1 truncate mr-2">
                            <span className="font-medium">{index + 1}.</span> {q.questionText}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveQuestion(index)}
                          >
                            <XIcon className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewQuizDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateQuiz} disabled={loading || quizForm.questions.length === 0}>
              {loading ? "Creating..." : "Create Quiz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone if students have already attempted this quiz.
              If you want to hide the quiz temporarily, consider deactivating it instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQuiz} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quiz Results Dialog */}
      <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
        <DialogContent className="max-w-3xl max-h-screen overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quiz Results</DialogTitle>
            <DialogDescription>
              Student performance and attempt statistics
            </DialogDescription>
          </DialogHeader>

          {loadingResults ? (
            <div className="py-10 text-center">Loading results...</div>
          ) : quizResults ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium">Students</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{quizResults.quizStats.totalStudents}</p>
                    <p className="text-xs text-muted-foreground">Total enrolled</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium">Attempts</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{quizResults.quizStats.totalAttempted}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round((quizResults.quizStats.totalAttempted / quizResults.quizStats.totalStudents) * 100)}% completion
                    </p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{quizResults.quizStats.averageScore}%</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{quizResults.quizStats.passRate}%</p>
                  </CardContent>
                </Card>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-4">Student Results</h3>
                
                <div className="rounded-md border overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Time Spent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {quizResults.studentResults.map((result, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{result.student.userName}</div>
                            <div className="text-sm text-gray-500">{result.student.userEmail}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{result.percentageScore}%</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {result.passed ? (
                              <Badge className="bg-green-100 text-green-800 border-green-200">Passed</Badge>
                            ) : (
                              <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {Math.floor(result.timeSpent / 60)}:{(result.timeSpent % 60).toString().padStart(2, '0')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(result.completedAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      
                      {quizResults.notAttempted.map((student, index) => (
                        <tr key={`not-${index}`} className="bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{student.student.userName}</div>
                            <div className="text-sm text-gray-500">{student.student.userEmail}</div>
                          </td>
                          <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic">
                            Not attempted
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-gray-500">No results available</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizManagement;
