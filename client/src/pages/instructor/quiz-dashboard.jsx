import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InstructorContext } from "@/context/instructor-context";
import { nContext } from "@/context/notification-context";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  BarChart, 
  CheckCircle, 
  ChevronRight, 
  Clock, 
  FileText, 
  List, 
  PieChart, 
  Users, 
  XCircle 
} from "lucide-react";
import axios from "axios";
import { format } from "date-fns";
import { AuthContext } from "@/context/auth-context";
import { fetchInstructorQuizzesService, getQuizResultsService } from "@/services";

const QuizDashboard = ({ listOfCourses }) => {
  const navigate = useNavigate();
  const { notify } = useContext(nContext);

  const {auth} = useContext(AuthContext);

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [quizzes, setQuizzes] = useState([]);
  const [quizResults, setQuizResults] = useState({});
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingResults, setFetchingResults] = useState(false);
  const [summaryStats, setSummaryStats] = useState({
    totalQuizzes: 0,
    activeQuizzes: 0,
    completedQuizzes: 0,
    averagePassRate: 0
  });

  // Fetch instructor's courses on component mount
  useEffect(() => {
    setCourses(listOfCourses);
  }, []);

  // Fetch quizzes when a course is selected
  useEffect(() => {
    if (selectedCourse && auth?.user?.role === "instructor") {
      fetchQuizzes();
    }
  }, [selectedCourse, auth?.user?.role]);

  // Calculate summary statistics when quizzes change
  useEffect(() => {
    if (quizzes.length > 0) {
      calculateSummaryStats();
    }
  }, [quizzes, quizResults]);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      console.log(selectedCourse, "selected course");
      const response = await fetchInstructorQuizzesService(selectedCourse, auth?.user?._id, true);
      console.log(response, "response");
      setQuizzes(response || []);
      
      // Fetch results for each quiz
      if (response && response.length > 0) {
        fetchQuizResultsForAll(response);
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      notify(error?.response?.data?.message || "Failed to fetch quizzes");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizResultsForAll = async (quizList) => {
    setFetchingResults(true);
    try {
      const results = {};
      for (const quiz of quizList) {
        try {
          const quizResult = await getQuizResultsService(quiz._id, auth?.user?._id);
          results[quiz._id] = quizResult;
        } catch (error) {
          console.error(`Error fetching results for quiz ${quiz._id}:`, error);
        }
      }
      console.log(results, "results");
      setQuizResults(results);
    } catch (error) {
      console.error("Error fetching quiz results:", error);
      notify("Failed to fetch some quiz results");
    } finally {
      setFetchingResults(false);
    }
  };

  const calculateSummaryStats = () => {
    const now = new Date();
    const active = quizzes.filter(q => q.status && (!q.endDate || new Date(q.endDate) > now)).length;
    const completed = quizzes.filter(q => !q.status || (q.endDate && new Date(q.endDate) <= now)).length;
    
    // Calculate average pass rate across all quizzes with results
    let totalPassRate = 0;
    let quizzesWithPassRate = 0;
    
    Object.values(quizResults).forEach(result => {
      if (result && result.quizStats) {
        totalPassRate += result.quizStats.passRate;
        quizzesWithPassRate++;
      }
    });
    
    const avgPassRate = quizzesWithPassRate > 0 ? totalPassRate / quizzesWithPassRate : 0;
    
    setSummaryStats({
      totalQuizzes: quizzes.length,
      activeQuizzes: active,
      completedQuizzes: completed,
      averagePassRate: avgPassRate
    });
  };

  const viewQuizResults = (quiz) => {
    setSelectedQuiz(quiz);
    setShowResultsDialog(true);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getQuizStatusBadge = (quiz) => {
    const now = new Date();
    const startDate = new Date(quiz.startDate);
    const endDate = quiz.endDate ? new Date(quiz.endDate) : null;
    
    if (!quiz.status) {
      return <Badge variant="destructive">Disabled</Badge>;
    } else if (startDate > now) {
      return <Badge variant="outline">Scheduled</Badge>;
    } else if (endDate && endDate < now) {
      return <Badge variant="secondary">Completed</Badge>;
    } else {
      return <Badge variant="success">Active</Badge>;
    }
  };

  const getStudentCompletionRate = (quizId) => {
    const result = quizResults[quizId];
    if (!result) return 0;
    
    const totalStudents = result.quizStats.totalStudents;
    const attempted = result.quizStats.totalAttempted;
    
    return totalStudents > 0 ? Math.round((attempted / totalStudents) * 100) : 0;
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quiz Dashboard</h1>
        <Button onClick={() => navigate("/courses")}>
          Explore Courses
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.totalQuizzes}</div>
            <p className="text-xs text-muted-foreground">
              Across all your courses
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.activeQuizzes}</div>
            <p className="text-xs text-muted-foreground">
              Currently available to students
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.completedQuizzes}</div>
            <p className="text-xs text-muted-foreground">
              Past or disabled quizzes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg. Pass Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryStats.averagePassRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Across all submitted attempts
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Performance Overview</CardTitle>
          <CardDescription>
            Select a course to view quiz performance
          </CardDescription>
          <div className="w-full sm:w-[240px]">
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.title.length > 20 ? `${course.title.slice(0, 20)}...` : course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center my-4">
              <p>Loading quiz data...</p>
            </div>
          ) : fetchingResults ? (
            <div className="flex justify-center my-4">
              <p>Fetching quiz results...</p>
            </div>
          ) : (quizzes.length === 0 && selectedCourse) ? (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-muted-foreground mb-4">No quizzes found for this course</p>
              <Button 
                variant="outline" 
                onClick={() => navigate("/instructor/quiz-management")}
              >
                Create Your First Quiz
              </Button>
            </div>
          ) : !selectedCourse ? (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-muted-foreground mb-4">Please select a course</p>
            </div>
          ) : (
            <div className="space-y-6">
              {quizzes.map((quiz) => {
                const results = quizResults[quiz._id];
                const completionRate = getStudentCompletionRate(quiz._id);
                
                return (
                  <div key={quiz._id} className="border rounded-md p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium">{quiz.title}</h3>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                          <Clock className="h-4 w-4" />
                          <span>{quiz.duration} minutes</span>
                          <span>•</span>
                          <FileText className="h-4 w-4" />
                          <span>{quiz.questions.length} questions</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getQuizStatusBadge(quiz)}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => viewQuizResults(quiz)}
                        >
                          <span>Details</span>
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Student Completion</span>
                          <span>{completionRate}%</span>
                        </div>
                        <Progress value={completionRate} className="h-2" />
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-sm font-medium">Pass Rate:</span>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-lg font-semibold">
                            {results?.quizStats?.passRate || 0}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <span className="text-sm font-medium">Avg. Score:</span>
                        <div className="flex items-center space-x-2">
                          <BarChart className="h-5 w-5 text-blue-500" />
                          <span className="text-lg font-semibold">
                            {results?.quizStats?.averageScore || 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Quiz Results Dialog */}
      <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Quiz Results: {selectedQuiz?.title}</DialogTitle>
            <DialogDescription>
              Detailed performance breakdown for this quiz
            </DialogDescription>
          </DialogHeader>
          
          {selectedQuiz && quizResults[selectedQuiz._id] ? (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-xs">Total Students</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      <span className="text-xl font-bold">
                        {quizResults[selectedQuiz._id].quizStats.totalStudents}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-xs">Attempts</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      <span className="text-xl font-bold">
                        {quizResults[selectedQuiz._id].quizStats.totalAttempted}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-xs">Avg. Score</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex items-center">
                      <BarChart className="mr-2 h-4 w-4 text-blue-500" />
                      <span className="text-xl font-bold">
                        {quizResults[selectedQuiz._id].quizStats.averageScore}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-xs">Pass Rate</CardTitle>
                  </CardHeader>
                  <CardContent className="py-2">
                    <div className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      <span className="text-xl font-bold">
                        {quizResults[selectedQuiz._id].quizStats.passRate}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Tabs defaultValue="completed">
                <TabsList className="mb-4">
                  <TabsTrigger value="completed">Completed Attempts</TabsTrigger>
                  <TabsTrigger value="pending">Not Attempted</TabsTrigger>
                </TabsList>
                
                <TabsContent value="completed">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Time Spent</TableHead>
                        <TableHead>Completed</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quizResults[selectedQuiz._id].studentResults.length > 0 ? (
                        quizResults[selectedQuiz._id].studentResults.map((result) => (
                          <TableRow key={result.student._id}>
                            <TableCell className="font-medium">
                              {result.student.userName} <br />
                              <span className="text-xs text-muted-foreground">
                                {result.student.userEmail}
                              </span>
                            </TableCell>
                            <TableCell>{result.percentageScore}%</TableCell>
                            <TableCell>
                              {result.passed ? (
                                <Badge variant="success" className="flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Passed
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="flex items-center gap-1">
                                  <XCircle className="h-3 w-2" />
                                  Failed
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{formatDuration(result.timeSpent)}</TableCell>
                            <TableCell>{formatDateTime(result.completedAt)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            No students have completed this quiz yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="pending">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quizResults[selectedQuiz._id].notAttempted.length > 0 ? (
                        quizResults[selectedQuiz._id].notAttempted.map((student) => (
                          <TableRow key={student._id}>
                            <TableCell className="font-medium">
                              {student.userName} <br />
                              <span className="text-xs text-muted-foreground">
                                {student.userEmail}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">Not Attempted</Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={2} className="text-center py-4">
                            All enrolled students have attempted this quiz
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="flex justify-center py-8">
              <p>Loading quiz results...</p>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowResultsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuizDashboard;
