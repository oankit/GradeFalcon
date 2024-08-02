import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Progress } from "../../components/ui/progress"; // Importing the Progress component from Shadcn UI
import { Button } from "../../components/ui/button"; // Importing the Button component from Shadcn UI
import "../../css/App.css";

const ViewExam = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { student_id, exam_id, front_page, back_page } = location.state || {};
  const [frontSrc, setFrontSrc] = useState("");
  const [backSrc, setBackSrc] = useState("");
  const [loadingProgress, setLoadingProgress] = useState({ front: 0, back: 0 });

  useEffect(() => {
    const fetchExam = async () => {
      if (!student_id) {
        console.log("Student ID is missing");
        return;
      }
      try {
        const loadImage = async (side, file_name, setSrc) => {
          const response = await fetch("/api/exam/fetchImage", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ side, file_name }),
          });

          const blob = await response.blob();
          const url = URL.createObjectURL(blob);

          const img = new Image();
          img.src = url;

          img.onload = () => {
            setSrc(url);
            setLoadingProgress((prev) => ({
              ...prev,
              [side]: 100,
            }));
          };

          img.onerror = () => {
            console.error(`Failed to load ${side} image.`);
          };

          const reader = new FileReader();
          reader.onloadstart = () => setLoadingProgress((prev) => ({
            ...prev,
            [side]: 0,
          }));

          reader.onprogress = (e) => {
            if (e.lengthComputable) {
              const progress = (e.loaded / e.total) * 100;
              setLoadingProgress((prev) => ({
                ...prev,
                [side]: progress,
              }));
            }
          };

          reader.onloadend = () => {
            setLoadingProgress((prev) => ({
              ...prev,
              [side]: 100,
            }));
          };

          reader.readAsDataURL(blob);
        };

        await loadImage("front", front_page, setFrontSrc);
        await loadImage("back", back_page, setBackSrc);
      } catch (error) {
        console.error("Failed to fetch exam:", error);
      }
    };

    fetchExam();
  }, [student_id, front_page, back_page]);

  return (
    <div className="App">
      <div className="main-content">
        <div className="flex flex-col items-center mt-8 space-y-8"> {/* Adjusted margin-top and space between items */}
          {!frontSrc && (
            <div className="flex flex-col items-center">
              <p>Loading front page...</p>
              <Progress value={loadingProgress.front} className="w-80" style={{ '--progress-bar-color': 'hsl(var(--primary))' }} />
            </div>
          )}
          {frontSrc && (
            <img
              src={frontSrc}
              alt="Student ID"
              style={{
                maxWidth: "30%",
                height: "auto",
                marginBottom: "1rem",
              }}
            />
          )}

          {!backSrc && (
            <div className="flex flex-col items-center">
              <p>Loading back page...</p>
              <Progress value={loadingProgress.back} className="w-80" style={{ '--progress-bar-color': 'hsl(var(--primary))' }} />
            </div>
          )}
          {backSrc && (
            <img
              src={backSrc}
              alt="Student Answers"
              style={{
                maxWidth: "30%",
                height: "auto",
                marginBottom: "1rem",
              }}
            />
          )}

          <Button onClick={() => navigate(-1)} className="save-changes-btn">
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewExam;
