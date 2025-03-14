import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/auth-context";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import axiosInstance from "@/api/axiosInstance";
import ContestViewer from "@/components/contest-viewer";

function ContestsPage() {
  const { auth } = useContext(AuthContext);
  const [contests, setContests] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedContest, setSelectedContest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newContest, setNewContest] = useState({
    title: "",
    description: "",
    problems: [
      {
        title: "",
        description: "",
        problemStatement: "",
        inputFormat: "",
        outputFormat: "",
        sampleInput: "",
        sampleOutput: "",
        timeLimit: 1,
        memoryLimit: 256,
      },
    ],
    startTime: "",
    endTime: "",
  });

  const handleInputChange = (e, problemIndex = null) => {
    const { name, value } = e.target;
    if (problemIndex !== null) {
      setNewContest((prev) => ({
        ...prev,
        problems: prev.problems.map((problem, index) =>
          index === problemIndex ? { ...problem, [name]: value } : problem
        ),
      }));
    } else {
      setNewContest((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const addProblem = () => {
    setNewContest((prev) => ({
      ...prev,
      problems: [
        ...prev.problems,
        {
          title: "",
          description: "",
          problemStatement: "",
          inputFormat: "",
          outputFormat: "",
          sampleInput: "",
          sampleOutput: "",
          timeLimit: 1,
          memoryLimit: 256,
        },
      ],
    }));
  };

  const removeProblem = (index) => {
    if (newContest.problems.length > 1) {
      setNewContest((prev) => ({
        ...prev,
        problems: prev.problems.filter((_, i) => i !== index),
      }));
    }
  };

  const fetchContests = async () => {
    try {
      const response = await axiosInstance.get("/contests/all");
      if (response.data.success) {
        setContests(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching contests:", error);
    }
  };

  const handleCreateContest = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("/contests/create", {
        body: newContest,
      });

      if (response.data.success) {
        setContests((prev) => [...prev, response.data.data]);
        setShowCreateForm(false);
        setNewContest({
          title: "",
          description: "",
          problems: [
            {
              title: "",
              description: "",
              problemStatement: "",
              inputFormat: "",
              outputFormat: "",
              sampleInput: "",
              sampleOutput: "",
              timeLimit: 1,
              memoryLimit: 256,
            },
          ],
          startTime: "",
          endTime: "",
        });
      } else {
        alert(response.data.message || "Error creating contest");
      }
    } catch (error) {
      console.error("Error creating contest:", error);
      alert("Error creating contest");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  if (selectedContest) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <Button
            onClick={() => setSelectedContest(null)}
            variant="outline"
            className="mb-4"
          >
            Back to Contests
          </Button>
        </div>
        <ContestViewer
          contest={{
            ...selectedContest,
            selectedProblem: selectedContest.problems[0],
            onProblemSelect: (problem) => {
              setSelectedContest((prev) => ({
                ...prev,
                selectedProblem: problem,
              }));
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Coding Contests</h1>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {showCreateForm ? "Cancel" : "Create Contest"}
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Contest</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Contest Title</Label>
              <Input
                id="title"
                name="title"
                value={newContest.title}
                onChange={handleInputChange}
                placeholder="Enter contest title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Contest Description</Label>
              <Textarea
                id="description"
                name="description"
                value={newContest.description}
                onChange={handleInputChange}
                placeholder="Enter contest description"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Contest Schedule</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    name="startTime"
                    type="datetime-local"
                    value={newContest.startTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="datetime-local"
                    value={newContest.endTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Problems</Label>
                <Button
                  onClick={addProblem}
                  type="button"
                  variant="outline"
                  size="sm"
                >
                  Add Problem
                </Button>
              </div>

              {newContest.problems.map((problem, index) => (
                <Card key={index} className="p-4">
                  <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle>Problem {index + 1}</CardTitle>
                    {newContest.problems.length > 1 && (
                      <Button
                        onClick={() => removeProblem(index)}
                        variant="destructive"
                        size="sm"
                      >
                        Remove Problem
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`problem-${index}-title`}>
                        Problem Title
                      </Label>
                      <Input
                        id={`problem-${index}-title`}
                        name="title"
                        value={problem.title}
                        onChange={(e) => handleInputChange(e, index)}
                        placeholder="Enter problem title"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`problem-${index}-description`}>
                        Problem Description
                      </Label>
                      <Textarea
                        id={`problem-${index}-description`}
                        name="description"
                        value={problem.description}
                        onChange={(e) => handleInputChange(e, index)}
                        placeholder="Enter problem description"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`problem-${index}-statement`}>
                        Problem Statement
                      </Label>
                      <Textarea
                        id={`problem-${index}-statement`}
                        name="problemStatement"
                        value={problem.problemStatement}
                        onChange={(e) => handleInputChange(e, index)}
                        placeholder="Enter the problem statement"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`problem-${index}-input-format`}>
                          Input Format
                        </Label>
                        <Textarea
                          id={`problem-${index}-input-format`}
                          name="inputFormat"
                          value={problem.inputFormat}
                          onChange={(e) => handleInputChange(e, index)}
                          placeholder="Describe input format"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`problem-${index}-output-format`}>
                          Output Format
                        </Label>
                        <Textarea
                          id={`problem-${index}-output-format`}
                          name="outputFormat"
                          value={problem.outputFormat}
                          onChange={(e) => handleInputChange(e, index)}
                          placeholder="Describe output format"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`problem-${index}-sample-input`}>
                          Sample Input
                        </Label>
                        <Textarea
                          id={`problem-${index}-sample-input`}
                          name="sampleInput"
                          value={problem.sampleInput}
                          onChange={(e) => handleInputChange(e, index)}
                          placeholder="Provide sample input"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`problem-${index}-sample-output`}>
                          Sample Output
                        </Label>
                        <Textarea
                          id={`problem-${index}-sample-output`}
                          name="sampleOutput"
                          value={problem.sampleOutput}
                          onChange={(e) => handleInputChange(e, index)}
                          placeholder="Provide sample output"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`problem-${index}-time-limit`}>
                          Time Limit (seconds)
                        </Label>
                        <Input
                          id={`problem-${index}-time-limit`}
                          name="timeLimit"
                          type="number"
                          min="1"
                          value={problem.timeLimit}
                          onChange={(e) => handleInputChange(e, index)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`problem-${index}-memory-limit`}>
                          Memory Limit (MB)
                        </Label>
                        <Input
                          id={`problem-${index}-memory-limit`}
                          name="memoryLimit"
                          type="number"
                          min="64"
                          value={problem.memoryLimit}
                          onChange={(e) => handleInputChange(e, index)}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              onClick={handleCreateContest}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Contest"}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contests.map((contest) => (
          <Card
            key={contest._id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => setSelectedContest(contest)}
          >
            <CardHeader>
              <CardTitle>{contest.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">{contest.description}</p>
              <div className="text-sm text-gray-500">
                <p>Problems: {contest.problems.length}</p>
                <p>Start: {new Date(contest.startTime).toLocaleString()}</p>
                <p>End: {new Date(contest.endTime).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ContestsPage;
