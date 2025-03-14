import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const CodePlayground = () => {
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("vs-dark");
  const [code, setCode] = useState("// Start coding here\n");
  const [output, setOutput] = useState("");

  const handleEditorChange = (value) => {
    setCode(value);
  };

  const handleLanguageChange = (value) => {
    setLanguage(value);
    setCode("// Start coding here\n");
  };

  const handleThemeChange = (value) => {
    setTheme(value);
  };

  const handleRunCode = () => {
    try {
      // For JavaScript, we can use eval for demonstration
      // In a production environment, you should use a secure backend service
      if (language === "javascript") {
        const result = eval(code);
        setOutput(String(result));
      } else {
        setOutput(
          "Code execution for other languages requires backend integration."
        );
      }
    } catch (error) {
      setOutput(`Error: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="mb-4 flex items-center gap-4">
        <Select value={language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="java">Java</SelectItem>
          </SelectContent>
        </Select>

        <Select value={theme} onValueChange={handleThemeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vs-dark">Dark</SelectItem>
            <SelectItem value="light">Light</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleRunCode}>Run Code</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border rounded-lg overflow-hidden h-[600px] bg-white dark:bg-gray-800">
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
            }}
          />
        </div>
        <div className="border rounded-lg p-4 h-[600px] overflow-auto bg-white dark:bg-gray-800">
          <h3 className="text-lg font-semibold mb-2">Output:</h3>
          <pre className="whitespace-pre-wrap">{output}</pre>
        </div>
      </div>
    </div>
  );
};

export default CodePlayground;
