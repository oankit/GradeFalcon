import React, { useState, useEffect } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import "../../css/App.css";
import { Button } from "../../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Select, SelectItem, SelectContent, SelectValue, SelectTrigger } from "../../components/ui/select";
import { ChevronLeftIcon, ExclamationCircleIcon } from "@heroicons/react/20/solid";
import { Form } from "../../components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import { useAuth0 } from "@auth0/auth0-react";

const NewExam = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [examTitle, setExamTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [template, setTemplate] = useState("100mcq");
  const [classes, setClasses] = useState([]); // State to store fetched classes
  const [selectedClass, setSelectedClass] = useState(""); // State to store the selected class
  const [showAlert, setShowAlert] = useState(false); // State to manage alert visibility
  const [error, setError] = useState(null); // State to handle errors
  const params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const class_id = params.class_id || "defaultClassId"; // Set default class_id if not provided

  const fetchClasses = async () => {
    try {
      const token = await getAccessTokenSilently(); // Get the token
      const response = await fetch("/api/class/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Include the token in the request
        },
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      } else {
        setError("Failed to fetch classes");
      }
    } catch (error) {
      setError("Error fetching classes");
    }
  };

  useEffect(() => {
    fetchClasses(); // Fetch classes when component mounts
  }, []);

  const handleInputChange = (event) => {
    const value = event.target.value;
    const sanitizedValue = value.replace(/[^a-zA-Z0-9\s.,!?-]/g, "");
    setExamTitle(sanitizedValue);
  };

  const handleTemplateChange = (event) => {
    setTemplate(event.target.value);
  };

  const handleClassChange = (value) => {
    setSelectedClass(value);
    setCourseId(value); // Set course ID based on selected class
  };

  const isFormValid = () => {
    return examTitle.trim() !== "" && selectedClass !== ""; // Simple validation check
  };

  const handleButtonClick = (event) => {
    if (!isFormValid()) {
      event.preventDefault();
      setShowAlert(true);
    } else {
      setShowAlert(false);
    }
  };

  useEffect(() => {
    if (location.state) {
      setCourseId(location.state.courseID); // Set courseID from state
      setTemplate(location.state.template); // Set template from state
    }
  }, [location.state]);

  return (
    <main className="flex flex-col gap-4 p-2">
      <div className="w-full mx-auto flex items-center gap-8">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10"
          onClick={() => window.history.back()}
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="flex-1 text-3xl font-semibold tracking-tight">
          Create Exam
        </h1>
        <div className="hidden items-center gap-2 md:ml-auto md:flex"></div>
      </div>

      {showAlert && (
        <Alert className="mb-4">
          <ExclamationCircleIcon className="h-4 w-4" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>Please fill in all required fields before proceeding.</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="mb-4">
          <ExclamationCircleIcon className="h-4 w-4" />
          <AlertTitle>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
        <div className="grid auto-rows-max items-start gap-8">
          <Card className="bg-white border rounded-lg p-6">
            <CardHeader>
              <CardTitle>Exam Details</CardTitle>
              <CardDescription>The following details will define the exam's configuration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="exam-title">Exam Name</Label>
                  <Input
                    id="exam-title"
                    type="text"
                    className="w-full"
                    placeholder="Enter exam title"
                    value={examTitle}
                    onChange={handleInputChange}
                    data-testid="exam-title-input"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid auto-rows-max items-start gap-4 lg:col-span-1 lg:gap-8">
          <Card className="bg-white border rounded md:w-2/3">
            <CardHeader>
              <CardTitle>Select Class</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="Class">Class</Label>
                  <Select onValueChange={handleClassChange}>
                    <SelectTrigger id="class" aria-label="Select class">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.class_id} value={cls.class_id}>
                          {cls.course_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
        <div className="grid auto-rows-max items-start gap-8">
          <Card className="bg-white border rounded-lg p-6">
            <CardHeader className="flex justify-between px-6 py-4">
              <CardTitle className="mb-2">Upload Exam Options</CardTitle>
            </CardHeader>
            <CardContent>
              <Form>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="answer-key">Answer Key</Label>
                    <div className="flex gap-4 mt-1">
                      <Button asChild size="sm">
                        <Link
                          to={isFormValid() ? "/UploadExamKey" : "#"}
                          state={{ examTitle: examTitle, classID: selectedClass }} // Pass examTitle and selected class ID as state
                          data-testid="upload-answer-key-btn"
                          onClick={handleButtonClick}
                        >
                          Upload Answer Key
                        </Link>
                      </Button>
                      <Button asChild size="sm">
                        <Link
                          to={isFormValid() ? "/ManualExamKey" : "#"}
                          state={{ examTitle: examTitle, classID: selectedClass }}
                          data-testid="manual-answer-key-btn"
                          onClick={handleButtonClick}
                        >
                          Manually Select Answers
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default NewExam;
