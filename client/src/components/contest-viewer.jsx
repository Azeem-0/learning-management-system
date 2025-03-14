import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import CodePlayground from "./playground";

function ContestViewer({ contest }) {
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
          <Card>
            <CardHeader>
              <CardTitle>Problems</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {contest.problems.map((problem, index) => (
                <Button
                  key={index}
                  variant={
                    contest.selectedProblem === problem ? "default" : "outline"
                  }
                  className="w-full justify-start"
                  onClick={() => contest.onProblemSelect(problem)}
                >
                  {problem.title}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-9">
          {contest.selectedProblem ? (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{contest.selectedProblem.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Problem Statement</h3>
                    <p className="whitespace-pre-wrap">
                      {contest.selectedProblem.problemStatement}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Input Format</h3>
                      <p className="whitespace-pre-wrap">
                        {contest.selectedProblem.inputFormat}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Output Format</h3>
                      <p className="whitespace-pre-wrap">
                        {contest.selectedProblem.outputFormat}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Sample Input</h3>
                      <pre className="bg-gray-100 p-2 rounded">
                        {contest.selectedProblem.sampleInput}
                      </pre>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Sample Output</h3>
                      <pre className="bg-gray-100 p-2 rounded">
                        {contest.selectedProblem.sampleOutput}
                      </pre>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>
                      Time Limit: {contest.selectedProblem.timeLimit} seconds
                    </p>
                    <p>
                      Memory Limit: {contest.selectedProblem.memoryLimit} MB
                    </p>
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

export default ContestViewer;
