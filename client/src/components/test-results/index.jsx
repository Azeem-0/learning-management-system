import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle } from "lucide-react";

const TestResults = ({ results }) => {
  if (!results || results.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Test Results</h3>
      <div className="space-y-2">
        {results.map((result, index) => (
          <div
            key={index}
            className={cn(
              "p-4 rounded-lg border",
              result.passed
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {result.passed ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">
                  Test Case {index + 1}: {result.passed ? "Passed" : "Failed"}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Time: {result.executionTime}s | Memory: {result.memory}KB
              </div>
            </div>
            {!result.passed && result.error && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                {result.error}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestResults;
