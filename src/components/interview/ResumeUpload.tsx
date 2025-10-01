import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { CandidateProfile } from "@/pages/IntervieweeTab";
import { useToast } from "@/hooks/use-toast";

interface ResumeUploadProps {
  onResumeUploaded: (profile: CandidateProfile) => void;
}

const ResumeUpload = ({ onResumeUploaded }: ResumeUploadProps) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    setUploadedFile(file);
    setIsProcessing(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Extract text from the document
      let extractedText = "";
      let name = "";
      let email = "";
      let phone = "";

      // For demo purposes, we'll simulate document parsing
      // In a real app, you'd use a document parsing service or library
      
      if (file.type === "application/pdf") {
        // Simulate PDF parsing
        await simulateDocumentParsing(file);
        extractedText = "Sample resume content extracted from PDF...";
        
        // Mock extraction of fields
        name = extractNameFromText(extractedText) || "";
        email = extractEmailFromText(extractedText) || "";
        phone = extractPhoneFromText(extractedText) || "";
      } else {
        // For other file types, we'll use a simplified approach
        extractedText = "Resume content extracted...";
        name = ""; // Will be collected by chatbot
        email = "";
        phone = "";
      }

      setUploadProgress(100);
      
      const profile: CandidateProfile = {
        id: Date.now().toString(),
        name,
        email,
        phone,
        resumeText: extractedText,
        resumeFileName: file.name,
        createdAt: new Date().toISOString(),
      };

      setTimeout(() => {
        setIsProcessing(false);
        onResumeUploaded(profile);
      }, 500);

    } catch (err) {
      console.error("Error processing resume:", err);
      setError("Failed to process resume. Please try again.");
      setIsProcessing(false);
      setUploadProgress(0);
    }
  }, [onResumeUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  const removeFile = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {!uploadedFile && (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
            }
            ${isProcessing ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            {isDragActive ? "Drop your resume here" : "Upload your resume"}
          </h3>
          <p className="text-muted-foreground mb-4">
            Drag and drop your resume, or click to browse
          </p>
          <p className="text-sm text-muted-foreground">
            Supported formats: PDF, DOCX, DOC (Max 10MB)
          </p>
        </div>
      )}

      {uploadedFile && (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <p className="font-medium text-sm">{uploadedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            {!isProcessing && (
              <Button variant="ghost" size="sm" onClick={removeFile}>
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing resume...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Your resume will be analyzed to extract basic information</p>
        <p>• Missing details will be collected through our chatbot</p>
        <p>• All data is stored locally on your device</p>
      </div>
    </div>
  );
};

// Helper functions for extracting information from resume text
const extractNameFromText = (text: string): string | null => {
  // Simple regex patterns for name extraction
  const namePatterns = [
    /^([A-Z][a-z]+ [A-Z][a-z]+)/m,
    /Name:\s*([A-Z][a-z]+ [A-Z][a-z]+)/i,
  ];
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const extractEmailFromText = (text: string): string | null => {
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const match = text.match(emailPattern);
  return match ? match[0] : null;
};

const extractPhoneFromText = (text: string): string | null => {
  const phonePatterns = [
    /[\+]?[1-9]?[\d\s\-\(\)]{10,}/g,
    /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g,
  ];
  
  for (const pattern of phonePatterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
};

const simulateDocumentParsing = (file: File): Promise<void> => {
  return new Promise((resolve) => {
    // Simulate processing time
    setTimeout(resolve, 2000);
  });
};

export default ResumeUpload;