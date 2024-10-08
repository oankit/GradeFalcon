import React, { useState, useRef, useEffect, useCallback } from "react";
import "../../css/App.css";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useToast } from "../../components/ui/use-toast";
import { Toaster } from "../../components/ui/toaster";
import { ChevronLeftIcon } from "@heroicons/react/20/solid";
import { useAuth0 } from "@auth0/auth0-react"; // Import Auth0

const UploadExamKey = () => {
  const { getAccessTokenSilently } = useAuth0(); // Get the token
  const [fileURL, setFileURL] = useState(null);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const location = useLocation();
  const { examTitle, classID, courseId, template, numQuestions, numOptions } = location.state || {};
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileSelect = useCallback(
    (event) => {
      const file = event.target.files[0];
      if (file && file.type === "application/pdf") {
        const fileURL = URL.createObjectURL(file);
        setFileURL(fileURL);
        setFile(file);
        toast({ title: "File Uploaded", description: "PDF file has been selected successfully." });
      } else {
        setFileURL(null);
        setFile(null);
        toast({ title: "Invalid File", description: "Please upload a valid PDF file." });
      }
    },
    [toast]
  );

  useEffect(() => {
    console.log("Received state:", {
      examTitle,
      classID,
      template,
      courseId,
    });

    const fileInput = fileInputRef.current;
    if (fileInput) {
      fileInput.addEventListener("change", handleFileSelect);
    }

    return () => {
      if (fileInput) {
        fileInput.removeEventListener("change", handleFileSelect);
      }
    };
  }, [handleFileSelect]);

  const resetUpload = () => {
    setFileURL(null);
    setFile(null); // Clear the file state
    if (fileInputRef.current) {
      fileInputRef.current.value = null; // Ensure the file input is cleared and ready for new selection
    }
    toast({ title: "Reset", description: "File upload has been reset." });
  };

  const sendToBackend = async () => {
    if (!file) {
      toast({ title: "No File", description: "No file selected to upload." });
      return;
    }

    const formData = new FormData();
    formData.append("examKey", file);
    formData.append("fileName", file.name);
    formData.append("examTitle", examTitle);
    formData.append("classID", classID);
    formData.append("template", template);
    formData.append("numQuestions", numQuestions);

    try {
      const token = await getAccessTokenSilently(); // Get the token
      const responses = await Promise.all([
        fetch(`/api/exam/saveExamKey/${template}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request
          },
          body: formData,
        }),
        fetch("/api/exam/copyTemplate", {
          method: "POST",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the request
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            examType: template,
            keyOrExam: "key",
            numQuestions: numQuestions,
            examTitle: examTitle,
            classID: classID,
            courseId: courseId,
          }),
        }),
      ]);

      const dataSaveExamKey = await responses[0].json();
      const dataCopyTemplate = await responses[1].json();

      console.log("Data from saveExamKey:", dataSaveExamKey);
      console.log("Data from copyTemplate:", dataCopyTemplate);

      toast({
        title: "Upload Successful",
        description: "The file has been uploaded successfully.",
      });

      navigate("/OMRProcessing", {
        state: {
          examTitle: examTitle,
          classID: classID,
          template: template,
          numOptions: numOptions,
          numQuestions: numQuestions,
        },
      });
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Upload Failed", description: "An error occurred while uploading the file." });
    }
  };

  return (
    <main className="flex flex-col gap-4 p-2">
      <div className="w-full mx-auto grid flex-1 auto-rows-max gap-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => window.history.back()}
          >
            <ChevronLeftIcon className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
            Upload Exam Key
          </h1>
          <div className="hidden items-center gap-2 md:ml-auto md:flex"></div>
          <div className="flex items-center gap-2 ml-auto">
            <Button size="sm" variant="outline" onClick={resetUpload}>
              Reset
            </Button>
            <Button size="sm" className="gap-1" onClick={sendToBackend}>
              Import
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 w-full">
          <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm p-6 bg-white w-full h-[200vh]">
            {!fileURL ? (
              <div className="flex flex-col items-center gap-1 text-center w-full h-full">
                <h3 className="text-2xl font-bold tracking-tight">No File Selected</h3>
                <p className="text-sm text-muted-foreground">
                  You can upload the exam answer key as a PDF file.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => fileInputRef.current && fileInputRef.current.click()}
                >
                  Browse Files
                </Button>
                <input
                  type="file"
                  id="file-input"
                  data-testid="file-input"
                  hidden
                  accept="application/pdf"
                  ref={fileInputRef}
                  onChange={handleFileSelect} // Ensure event handler is attached
                />
              </div>
            ) : (
              <div className="pdf-display w-full h-full">
                <iframe
                  src={fileURL}
                  title="PDF Preview"
                  className="w-full h-[90vh] border rounded-lg"
                ></iframe>
              </div>
            )}
          </div>
        </div>
        <Toaster />
      </div>
    </main>
  );
};

export default UploadExamKey;
