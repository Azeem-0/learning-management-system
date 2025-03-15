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
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
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
      console.log(response);
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
    console.log("fetching contests");
    fetchContest();
  }, []);

  // Add a useEffect to log when selectedProblem changes
  useEffect(() => {
    if (selectedProblem) {
      console.log("Selected problem updated:", selectedProblem.title);
    }
  }, [selectedProblem]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!contest) {
    return <div>Contest not found</div>;
  }

  return (
    <>
      <div className="container mx-auto p-4 w-full">
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
              <CardContent>
                <Tabs
                  defaultValue={contest.problems[0]?._id}
                  onValueChange={(value) => {
                    const problem = contest.problems.find(
                      (p) => p._id === value
                    );
                    if (problem) {
                      console.log("Selected problem:", problem);
                      setSelectedProblem({ ...problem });
                    }
                  }}
                >
                  <TabsList className="flex flex-col w-full gap-2">
                    {contest.problems.map((problem) => (
                      <TabsTrigger
                        key={problem._id}
                        value={problem._id}
                        className="w-full justify-start"
                      >
                        {problem.title}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
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
                    {selectedProblem.testCases &&
                      selectedProblem.testCases.length > 0 && (
                        <div>
                          <h3 className="font-semibold mb-2">Test Cases</h3>
                          <div className="space-y-4">
                            {selectedProblem.testCases.map(
                              (testCase, index) => (
                                <div
                                  key={index}
                                  className="border rounded p-4 space-y-2"
                                >
                                  <div className="font-medium">
                                    Test Case {index + 1}
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="text-sm font-semibold mb-1">
                                        Input
                                      </h4>
                                      <pre className="bg-gray-100 p-2 rounded text-sm">
                                        {testCase.input}
                                      </pre>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-semibold mb-1">
                                        Expected Output
                                      </h4>
                                      <pre className="bg-gray-100 p-2 rounded text-sm">
                                        {testCase.output}
                                      </pre>
                                    </div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div>Select a problem to start coding</div>
            )}
          </div>
        </div>
      </div>
      {selectedProblem && (
        <div className="fixed bottom-0 left-0 right-0">
          <CodePlayground contest={contest} selectedProblem={selectedProblem} />
        </div>
      )}
    </>
  );
}

export default ContestDetailsPage;
