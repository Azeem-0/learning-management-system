"use client";

import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Play,
  Copy,
  Code2,
  FileCode,
  Download,
  ChevronLeft,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/use-local-storage";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const JUDGE0_API_URL = "https://judge0-ce.p.rapidapi.com";
const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  java: 62,
  c: 50,
  cpp: 54,
  typescript: 74,
  ruby: 72,
  go: 60,
  rust: 73,
  csharp: 51,
  php: 68,
  swift: 83,
  kotlin: 78,
};

const LANGUAGE_TEMPLATES = {
  javascript: `// JavaScript Example
console.log("Hello, world!");

// Try creating a function
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("Developer"));`,
  python: `# Python Example
print("Hello, world!")

# Try creating a function
def greet(name):
    return f"Hello, {name}!"

print(greet("Developer"))`,
  java: `// Java Example
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
        System.out.println(greet("Developer"));
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
}`,
};

const CodePlayground = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useLocalStorage(
    "code-playground-language",
    "javascript"
  );
  const [theme, setTheme] = useLocalStorage("code-playground-theme", "vs-dark");
  const [code, setCode] = useLocalStorage(
    "code-playground-code",
    LANGUAGE_TEMPLATES.javascript || ""
  );
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("output");
  const [executionTime, setExecutionTime] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set initial code template when language changes
    if (LANGUAGE_TEMPLATES[language] && !code) {
      setCode(LANGUAGE_TEMPLATES[language]);
    }
  }, [language, code, setCode]);

  const handleEditorChange = (value) => {
    setCode(value || "");
  };

  const handleLanguageChange = (value) => {
    setLanguage(value);
    // Offer to load template if editor is empty or user is switching languages
    if (!code || code === LANGUAGE_TEMPLATES[language]) {
      setCode(LANGUAGE_TEMPLATES[value] || "");
    }
  };

  const handleThemeChange = (value) => {
    setTheme(value);
  };

  const handleRunCode = async () => {
    if (!code.trim()) {
      toast({
        title: "Empty Code",
        description: "Please write some code before running.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setOutput("");
    setActiveTab("output");
    const startTime = performance.now();

    try {
      // Create submission
      const submissionResponse = await fetch(`${JUDGE0_API_URL}/submissions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "Content-Type": "application/json",
          "X-RapidAPI-Key":
            "d048904afamsh7c58dce1604a4e9p176967jsna9a437cfb37f",
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
        body: JSON.stringify({
          language_id: LANGUAGE_IDS[language],
          source_code: code,
          base64_encoded: false,
          stdin: "",
        }),
      });

      const { token } = await submissionResponse.json();

      // Get submission result
      const resultResponse = await fetch(
        `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=false&fields=stdout,stderr,status_id,compile_output,time`,
        {
          method: "GET",
          headers: {
            "X-RapidAPI-Key":
              "d048904afamsh7c58dce1604a4e9p176967jsna9a437cfb37f",
            "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          },
        }
      );

      const result = await resultResponse.json();
      const endTime = performance.now();
      setExecutionTime(((endTime - startTime) / 1000).toFixed(2));

      // Handle different types of output
      if (result.compile_output) {
        setOutput(result.compile_output);
      } else if (result.stderr) {
        setOutput(result.stderr);
      } else if (result.stdout) {
        setOutput(result.stdout);
        toast({
          title: "Code executed successfully",
          description: `Execution completed in ${(
            (endTime - startTime) /
            1000
          ).toFixed(2)}s`,
        });
      } else {
        setOutput("No output");
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
      toast({
        title: "Execution Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied to clipboard",
      description: "Your code has been copied to the clipboard",
    });
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    toast({
      title: "Copied to clipboard",
      description: "Output has been copied to the clipboard",
    });
  };

  const downloadCode = () => {
    const fileExtensions = {
      javascript: "js",
      python: "py",
      java: "java",
      c: "c",
      cpp: "cpp",
      typescript: "ts",
      ruby: "rb",
      go: "go",
      rust: "rs",
      csharp: "cs",
      php: "php",
      swift: "swift",
      kotlin: "kt",
    };

    const extension = fileExtensions[language] || "txt";
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Code downloaded",
      description: `Your ${language} code has been downloaded`,
    });
  };

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-100 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            size="sm"
            className="mr-4"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  <Code2 className="mr-2 h-5 w-5" />
                  <h1 className="text-xl font-bold">Code Playground</h1>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Write, run, and experiment with code</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="c">C</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="ruby">Ruby</SelectItem>
              <SelectItem value="go">Go</SelectItem>
              <SelectItem value="rust">Rust</SelectItem>
              <SelectItem value="csharp">C#</SelectItem>
              <SelectItem value="php">PHP</SelectItem>
              <SelectItem value="swift">Swift</SelectItem>
              <SelectItem value="kotlin">Kotlin</SelectItem>
            </SelectContent>
          </Select>

          <Select value={theme} onValueChange={handleThemeChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vs-dark">Dark</SelectItem>
              <SelectItem value="light">Light</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={copyCode}>
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy code</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={downloadCode}>
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download code</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="ml-2 gap-2 px-4"
                  onClick={handleRunCode}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Run Code
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Run code (Ctrl+Enter)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="border rounded-lg overflow-hidden shadow-sm h-[600px] bg-white dark:bg-gray-800"
        >
          <div className="p-3 border-b flex items-center justify-between bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center">
              <FileCode className="h-4 w-4 mr-2" />
              <span className="font-medium">Editor</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {code?.length || 0} characters
            </div>
          </div>
          <div className="h-[calc(100%-48px)]">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              language={language}
              value={code}
              theme={theme}
              onChange={handleEditorChange}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: "on",
                quickSuggestions: true,
                folding: true,
                dragAndDrop: true,
                formatOnPaste: true,
                formatOnType: true,
              }}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  e.preventDefault();
                  handleRunCode();
                }
              }}
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="border rounded-lg overflow-hidden shadow-sm h-[600px] bg-white dark:bg-gray-800"
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full flex flex-col"
          >
            <div className="p-3 border-b flex items-center justify-between bg-gray-50 dark:bg-gray-700">
              <TabsList className="grid w-[200px] grid-cols-1">
                <TabsTrigger value="output" className="flex items-center gap-2">
                  Output
                  {executionTime && (
                    <span className="text-xs bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded-full">
                      {executionTime}s
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              {output && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={copyOutput}>
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        Copy
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copy output</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>

            <TabsContent
              value="output"
              className="flex-1 overflow-auto p-0 m-0"
            >
              <div className="p-4 h-full overflow-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3">Executing code...</span>
                  </div>
                ) : output ? (
                  <pre
                    className={cn(
                      "whitespace-pre-wrap font-mono text-sm p-2 rounded",
                      output.includes("Error") ? "text-red-500" : ""
                    )}
                  >
                    {output}
                  </pre>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Play className="h-12 w-12 mb-4 opacity-20" />
                    <p className="text-center">
                      Run your code to see the output here
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center"
      >
        <p>
          Keyboard shortcuts:{" "}
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
            Ctrl+Enter
          </kbd>{" "}
          to run code
        </p>
      </motion.div>
    </div>
  );
};

export default CodePlayground;
