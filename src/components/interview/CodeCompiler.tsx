import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Play, 
  Code, 
  Terminal, 
  Check, 
  X, 
  Copy,
  RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CodeCompilerProps {
  question: string;
  onSubmit: (code: string) => void;
  timeRemaining: number;
  isActive: boolean;
}

const CodeCompiler = ({ question, onSubmit, timeRemaining, isActive }: CodeCompilerProps) => {
  const [code, setCode] = useState(`// Write your solution here
function solution() {
    // Your code goes here
    
}

// Test your solution
console.log(solution());`);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const runCode = () => {
    setIsRunning(true);
    setOutput("");
    
    try {
      // Create a safe execution environment
      const originalConsole = console.log;
      let capturedOutput = "";
      
      // Override console.log to capture output
      console.log = (...args) => {
        capturedOutput += args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ') + '\n';
      };
      
      // Execute the code in a try-catch block
      const result = new Function(code)();
      
      // Restore original console.log
      console.log = originalConsole;
      
      setOutput(capturedOutput || String(result || "No output"));
      
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Code copied!",
      description: "Your code has been copied to clipboard.",
    });
  };

  const resetCode = () => {
    setCode(`// Write your solution here
function solution() {
    // Your code goes here
    
}

// Test your solution
console.log(solution());`);
    setOutput("");
  };

  const submitCode = () => {
    onSubmit(code);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = (): string => {
    if (timeRemaining <= 30) return "text-destructive";
    if (timeRemaining <= 60) return "text-warning";
    return "text-foreground";
  };

  return (
    <Card className="h-full shadow-medium">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Coding Challenge
          </span>
          {isActive && (
            <Badge variant="outline" className={`font-mono ${getTimerColor()}`}>
              <Terminal className="w-4 h-4 mr-1" />
              {formatTime(timeRemaining)}
            </Badge>
          )}
        </CardTitle>
        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
          {question}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Code Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Your Solution</label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyCode}
                className="px-2"
              >
                <Copy className="w-3 h-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetCode}
                className="px-2"
              >
                <RotateCcw className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="font-mono text-sm min-h-[300px] resize-none bg-slate-50 dark:bg-slate-900"
            placeholder="Write your JavaScript solution here..."
          />
        </div>

        <Separator />

        {/* Controls */}
        <div className="flex gap-3">
          <Button
            onClick={runCode}
            disabled={isRunning}
            variant="outline"
            className="flex-1"
          >
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? "Running..." : "Run Code"}
          </Button>
          <Button
            onClick={submitCode}
            disabled={!code.trim()}
            className="flex-1"
          >
            <Check className="w-4 h-4 mr-2" />
            Submit Solution
          </Button>
        </div>

        {/* Output */}
        {output && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Output
            </label>
            <div className="bg-slate-900 text-green-400 p-3 rounded-lg font-mono text-sm whitespace-pre-wrap">
              {output}
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
          <strong>Tips:</strong>
          <ul className="mt-1 space-y-1 list-disc list-inside">
            <li>Use console.log() to debug and test your solution</li>
            <li>Make sure your function returns the expected result</li>
            <li>Consider edge cases and error handling</li>
            <li>Click "Run Code" to test before submitting</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CodeCompiler;