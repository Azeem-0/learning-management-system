import axiosInstance from "@/api/axiosInstance";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AuthContext } from "@/context/auth-context";
import { useContext, useEffect, useState } from "react";

function ContestsPage() {
  const { auth } = useContext(AuthContext);
  const [contests, setContests] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newContest, setNewContest] = useState({
    title: "",
    description: "",
    problemStatement: "",
    inputFormat: "",
    outputFormat: "",
    sampleInput: "",
    sampleOutput: "",
    timeLimit: 1,
    memoryLimit: 256,
    startTime: "",
    endTime: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewContest((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchContests = async () => {
    try {
      const response = await axiosInstance.get("/contests/all");
      const data = await response.json();
      if (data.success) {
        setContests(data.data);
      }
    } catch (error) {
      console.error("Error fetching contests:", error);
    }
  };

  const handleCreateContest = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("/contests/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth?.token}`,
        },
        body: newContest,
      });

      const data = await response.json();

      if (data.success) {
        setContests((prev) => [...prev, data.data]);
        setShowCreateForm(false);
        setNewContest({
          title: "",
          description: "",
          problemStatement: "",
          inputFormat: "",
          outputFormat: "",
          sampleInput: "",
          sampleOutput: "",
          timeLimit: 1,
          memoryLimit: 256,
          startTime: "",
          endTime: "",
        });
      } else {
        alert(data.message || "Error creating contest");
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
              <Label htmlFor="description">Description</Label>
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
              <Label htmlFor="problemStatement">Problem Statement</Label>
              <Textarea
                id="problemStatement"
                name="problemStatement"
                value={newContest.problemStatement}
                onChange={handleInputChange}
                placeholder="Enter the problem statement"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="inputFormat">Input Format</Label>
                <Textarea
                  id="inputFormat"
                  name="inputFormat"
                  value={newContest.inputFormat}
                  onChange={handleInputChange}
                  placeholder="Describe input format"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="outputFormat">Output Format</Label>
                <Textarea
                  id="outputFormat"
                  name="outputFormat"
                  value={newContest.outputFormat}
                  onChange={handleInputChange}
                  placeholder="Describe output format"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sampleInput">Sample Input</Label>
                <Textarea
                  id="sampleInput"
                  name="sampleInput"
                  value={newContest.sampleInput}
                  onChange={handleInputChange}
                  placeholder="Provide sample input"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sampleOutput">Sample Output</Label>
                <Textarea
                  id="sampleOutput"
                  name="sampleOutput"
                  value={newContest.sampleOutput}
                  onChange={handleInputChange}
                  placeholder="Provide sample output"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timeLimit">Time Limit (seconds)</Label>
                <Input
                  type="number"
                  id="timeLimit"
                  name="timeLimit"
                  value={newContest.timeLimit}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="memoryLimit">Memory Limit (MB)</Label>
                <Input
                  type="number"
                  id="memoryLimit"
                  name="memoryLimit"
                  value={newContest.memoryLimit}
                  onChange={handleInputChange}
                  min="64"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  type="datetime-local"
                  id="startTime"
                  name="startTime"
                  value={newContest.startTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  type="datetime-local"
                  id="endTime"
                  name="endTime"
                  value={newContest.endTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleCreateContest}
              className="bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Contest"}
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contests.map((contest) => (
          <Card key={contest._id}>
            <CardHeader>
              <CardTitle>{contest.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{contest.description}</p>
              <div className="mt-4 text-sm">
                <p>
                  <strong>Start:</strong>{" "}
                  {new Date(contest.startTime).toLocaleString()}
                </p>
                <p>
                  <strong>End:</strong>{" "}
                  {new Date(contest.endTime).toLocaleString()}
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => {
                  // TODO: Implement contest participation logic
                }}
                className="w-full"
              >
                Participate
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default ContestsPage;
