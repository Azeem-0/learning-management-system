import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createQuizService, fetchInstructorQuizzesService } from "@/services";
import { nContext } from "@/context/notification-context";
import { AuthContext } from "@/context/auth-context";
import { useContext } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function QuizCreator({ listOfCourses }) {
  const { notify } = useContext(nContext);
  const { auth } = useContext(AuthContext);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newQuiz, setNewQuiz] = useState({
    title: "",
    description: "",
    duration: 30,
    questions: [{ questionText: "", options: ["", "",], correctOptionIndex: "" }],
  });
  const [loading, setLoading] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  useEffect(() => {
    fetchInstructorQuizzes();
  }, []);

  const fetchInstructorQuizzes = async () => {
    console.log(auth, "auth");
    if (!auth?.user?._id) return;

    setLoadingQuizzes(true);
    try {
      const response = await fetchInstructorQuizzesService("", auth?.user?._id, "", true);
      setQuizzes(response || []);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      notify("Failed to fetch quizzes!");
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const handleInputChange = (e, index = null) => {
    const { name, value } = e.target;

    if (index !== null) {
      const updatedQuestions = [...newQuiz.questions];

      if (name === "correctOptionIndex") {
        const maxOptions = updatedQuestions[index].options.length;
        const selectedIndex = parseInt(value, 10) - 1;

        if (selectedIndex < 0 || selectedIndex >= maxOptions) {
          notify(`Please enter valid option (1 to ${maxOptions}).`);
          return;
        }
      }

      updatedQuestions[index][name] = value;
      setNewQuiz({ ...newQuiz, questions: updatedQuestions });
    } else {
      setNewQuiz({ ...newQuiz, [name]: value });
    }
  };


  const addQuestion = () => {
    setNewQuiz({
      ...newQuiz,
      questions: [...newQuiz.questions, { questionText: "", options: ["", "", "", ""], correctOptionIndex: "" }],
    });
    notify("Question added successfully!");
  };

  const removeQuestion = (index) => {
    if (newQuiz.questions.length > 1) {
      const updatedQuestions = newQuiz.questions.filter((_, i) => i !== index);
      setNewQuiz({ ...newQuiz, questions: updatedQuestions });
      notify("Question removed successfully!");
    }
  };

  const handleOptionChange = (e, qIndex, oIndex) => {
    const updatedQuestions = [...newQuiz.questions];
    updatedQuestions[qIndex].options[oIndex] = e.target.value;
    setNewQuiz({ ...newQuiz, questions: updatedQuestions });
  };

  const addOption = (qIndex) => {
    const updatedQuestions = [...newQuiz.questions];
    updatedQuestions[qIndex].options.push("");
    setNewQuiz({ ...newQuiz, questions: updatedQuestions });
  };

  const removeOption = (qIndex, oIndex) => {
    const updatedQuestions = [...newQuiz.questions];
    if (updatedQuestions[qIndex].options.length > 2) {
      updatedQuestions[qIndex].options.splice(oIndex, 1);
      setNewQuiz({ ...newQuiz, questions: updatedQuestions });
    } else {
      notify("A question must have at least two options!");
    }
  };



  const handleCreateQuiz = async () => {
    if (!selectedCourse) {
      notify("Please select a course for the quiz.");
      return;
    }

    if (newQuiz.questions.length === 0) {
      notify("At least one question is required!");
      return;
    }

    console.log(selectedCourse, "selectedCourse");

    const quizData = {
      title: newQuiz.title,
      description: newQuiz.description,
      duration: parseInt(newQuiz.duration, 10),
      courseId: selectedCourse,
      questions: newQuiz.questions.map(q => ({
        questionText: q.questionText,
        options: q.options,
        correctOptionIndex: parseInt(q.correctOptionIndex - 1, 10)
      })),
    };

    setLoading(true);

    try {
      const response = await createQuizService(quizData);
      console.log("Quiz Created Successfully!", response);
      setShowCreateForm(false);
      setNewQuiz({ title: "", description: "", duration: 30, questions: [{ questionText: "", options: ["", "", "", ""], correctOptionIndex: "" }] });
      notify("Quiz created successfully!");
      fetchInstructorQuizzes(); // Refresh quiz list
    } catch (error) {
      console.error("Error creating quiz:", error);
      notify("Failed to create quiz!");
    } finally {
      setLoading(false);
    }
  };

  const handleViewQuiz = (quiz) => {
    window.location.href = `/quiz/details/${quiz._id}`;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quiz Creator</h1>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} className="bg-blue-600 hover:bg-blue-700">
          {showCreateForm ? "Cancel" : "Create Quiz"}
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Quiz Title</Label>
              <Input name="title" value={newQuiz.title} onChange={handleInputChange} placeholder="Enter quiz title" required />
            </div>
            <div className="space-y-2">
              <Label>Quiz Description</Label>
              <Textarea name="description" value={newQuiz.description} onChange={handleInputChange} placeholder="Enter quiz description" required />
            </div>
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input name="duration" type="number" min="5" value={newQuiz.duration} onChange={handleInputChange} placeholder="Enter quiz duration in minutes" required />
            </div>

            <div className="space-y-2">
              <Label>Select Course</Label>
              <Select onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Course" />
                </SelectTrigger>
                <SelectContent>
                  {listOfCourses?.map((course) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.title.length > 25 ? `${course.title.substring(0, 25)}...` : course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Questions</Label>
                <Button onClick={addQuestion} type="button" variant="outline" size="sm">Add Question</Button>
              </div>

              {newQuiz?.questions?.map((question, qIndex) => (
                <Card key={qIndex} className="p-4">
                  <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>Question {qIndex + 1}</CardTitle>
                    {newQuiz.questions.length > 1 && (
                      <Button onClick={() => removeQuestion(qIndex)} variant="destructive" size="sm">Remove</Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Question Text</Label>
                      <Textarea name="questionText" value={question.questionText} onChange={(e) => handleInputChange(e, qIndex)} placeholder="Enter question" required />
                    </div>
                    {question?.options?.map((option, oIndex) => (
                      <div key={oIndex} className="flex gap-2 items-center">
                        <Input
                          value={option}
                          onChange={(e) => handleOptionChange(e, qIndex, oIndex)}
                          placeholder={`Enter option ${oIndex + 1}`}
                          required
                        />
                        {question.options.length > 2 && (
                          <Button onClick={() => removeOption(qIndex, oIndex)} variant="destructive" size="sm">Remove</Button>
                        )}
                      </div>
                    ))}
                    <Button onClick={() => addOption(qIndex)} variant="outline" size="sm">Add Option</Button>

                    <div className="space-y-2">
                      <Label>Correct Answer (Enter option number)</Label>
                      <Input name="correctOptionIndex" type="number" min="1" max={newQuiz.questions.length} value={question.correctOptionIndex} onChange={(e) => handleInputChange(e, qIndex)} required />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button onClick={handleCreateQuiz} className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? "Creating..." : "Create Quiz"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Active Quizzes</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingQuizzes ? (
            <div className="text-center py-4">Loading quizzes...</div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-4">No active quizzes found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quizzes.map((quiz) => (
                  <TableRow key={quiz._id}>
                    <TableCell>{quiz.title.substring(0, 20)}{quiz.title.length > 20 ? '...' : ''}</TableCell>
                    <TableCell>{quiz.description.substring(0, 50)}{quiz.description.length > 50 ? '...' : ''}</TableCell>
                    <TableCell>{quiz.courseId?.title.substring(0, 20) + (quiz.courseId?.title.length > 20 ? '...' : '') || 'Unknown course'}</TableCell>
                    <TableCell>{quiz.questions.length}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${quiz.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {quiz.status ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => handleViewQuiz(quiz)}>
                        Explore
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
