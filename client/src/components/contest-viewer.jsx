import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import CodePlayground from "./playground";
import { useEffect, useState } from "react";

function ContestViewer({ contest }) {
  const [selectedProbemIndex, setSelectedProblemIndex] = useState(0);

  useEffect(() => {
    console.log(contest.problems);
  }, []);

  if (!contest) {
    return null;
  }

  return (
    <div className="space-y-4">
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
          <Card key={selectedProbemIndex}>
            <CardHeader>
              <CardTitle>Problems</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {contest.problems.map((problem, index) => (
                <Button
                  key={problem._id}
                  variant={
                    selectedProbemIndex === index ? "default" : "outline"
                  }
                  className="w-full justify-start"
                  onClick={() => {
                    console.log("selected", index);
                    setSelectedProblemIndex(index);
                  }}
                >
                  {problem.title}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-9">
          {contest.problems[selectedProbemIndex] ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {contest.problems[selectedProbemIndex].title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Problem Statement</h3>
                    <p className="whitespace-pre-wrap">
                      {contest.problems[selectedProbemIndex].problemStatement}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Input Format</h3>
                      <p className="whitespace-pre-wrap">
                        {contest.problems[selectedProbemIndex].inputFormat}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Output Format</h3>
                      <p className="whitespace-pre-wrap">
                        {contest.problems[selectedProbemIndex].outputFormat}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Sample Input</h3>
                      <pre className="bg-gray-100 p-2 rounded">
                        {contest.problems[selectedProbemIndex].sampleInput}
                      </pre>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Sample Output</h3>
                      <pre className="bg-gray-100 p-2 rounded">
                        {contest.problems[selectedProbemIndex].sampleOutput}
                      </pre>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>
                      Time Limit:{" "}
                      {contest.problems[selectedProbemIndex].timeLimit} seconds
                    </p>
                    <p>
                      Memory Limit:{" "}
                      {contest.problems[selectedProbemIndex].memoryLimit} MB
                    </p>
                  </div>
                </CardContent>
              </Card>
              <CodePlayground
                contest={contest}
                selectedProblem={contest.problems[selectedProbemIndex]}
              />
            </div>
          ) : (
            <div>Select a problem to start coding</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContestViewer;
