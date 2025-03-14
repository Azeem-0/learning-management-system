import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/auth-context";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import CodePlayground from "../../components/playground";
import axiosInstance from "@/api/axiosInstance";

function ContestDetailsPage() {
  const { id } = useParams();
  const { auth } = useContext(AuthContext);
  const [contest, setContest] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchContest = async () => {
    try {
      const response = await axiosInstance.get(`/contests/${id}`);
      if (response.data.success) {
        setContest(response.data.data);
        if (response.data.data.problems.length > 0) {
          setSelectedProblem(response.data.data.problems[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching contest:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContest();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!contest) {
    return <div>Contest not found</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{contest.title}</h1>
        <p className="text-gray-600">{contest.description}</p>
        <div className="text-sm text-gray-500 mt-2">
          <p>Start: {new Date(contest.startTime).toLocaleString()}</p>
          <p>End: {new Date(contest.endTime).toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Problems</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {contest.problems.map((problem, index) => (
                <Button
                  key={index}
                  variant={selectedProblem === problem ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => setSelectedProblem(problem)}
                >
                  {problem.title}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-9">
          {selectedProblem ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{selectedProblem.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Problem Statement</h3>
                    <p className="whitespace-pre-wrap">
                      {selectedProblem.problemStatement}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Input Format</h3>
                      <p className="whitespace-pre-wrap">
                        {selectedProblem.inputFormat}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Output Format</h3>
                      <p className="whitespace-pre-wrap">
                        {selectedProblem.outputFormat}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Sample Input</h3>
                      <pre className="bg-gray-100 p-2 rounded">
                        {selectedProblem.sampleInput}
                      </pre>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Sample Output</h3>
                      <pre className="bg-gray-100 p-2 rounded">
                        {selectedProblem.sampleOutput}
                      </pre>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>Time Limit: {selectedProblem.timeLimit} seconds</p>
                    <p>Memory Limit: {selectedProblem.memoryLimit} MB</p>
                  </div>
                </CardContent>
              </Card>
              <CodePlayground />
            </div>
          ) : (
            <div>Select a problem to start coding</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContestDetailsPage;
