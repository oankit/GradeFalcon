const express = require("express");
const {
  saveQuestions,
  newExam,
  examBoard,
  getAnswerKeyForExam,
  getAveragePerExam,
  getAveragePerCourse,
  getStudentGrades,
  getStudentNameById,
  getScoreByExamId,
  saveResults,
} = require("../controllers/examController");
const { createUploadMiddleware } = require("../middleware/uploadMiddleware");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { Parser } = require("json2csv");
const { PDFDocument } = require("pdf-lib");
const multer = require("multer");
const router = express.Router();

router.post("/saveQuestions", saveQuestions);
router.post("/NewExam/:class_id", newExam);
router.post("/ExamBoard", examBoard);
router.get("/average-per-exam", getAveragePerExam);
router.get("/average-per-course", getAveragePerCourse); // Updated route
router.get("/grades/:studentId", getStudentGrades);

// Function to get the answer key for a specific exam

router.get("/getAnswerKey/:exam_id", async (req, res, next) => {
  try {
    const exam_id = parseInt(req.params.exam_id, 10);
    if (isNaN(exam_id)) {
      throw new Error("Invalid exam_id");
    }
    const answerKey = await getAnswerKeyForExam(exam_id);
    res.json({ answerKey });
  } catch (error) {
    console.error("Error in /getAnswerKey:", error);
    res.status(500).send("Error getting answer key");
  }
});

// Add this route to the examRoutes.js file

router.get("/studentScores", async function (req, res) {
  const filePath = path.join(__dirname, "../../omr/outputs/combined.csv");
  const results = []; // Array to hold student number and score

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) =>
      results.push({
        StudentID: data.StudentID,
        Score: data.score,
        front_page: data.front_page_file_id,
        back_page: data.back_page_file_id,
      })
    ) // Extract only the student number (Roll) and score
    .on("end", async () => {
      try {
        // Map each result to include the student name
        const resultsWithNames = await Promise.all(
          results.map(async (result) => {
            const studentName = await getStudentNameById(result.StudentID); // Assuming this function exists and returns the student's name
            return { StudentName: studentName, ...result };
          })
        );

        res.json(resultsWithNames); // Send the data including student names as a response
      } catch (error) {
        console.error("Error fetching student names:", error);
        res.status(500).send("Error fetching student names");
      }
    })
    .on("error", (error) => {
      console.error("Error reading CSV file:", error);
      res.status(500).send("Error reading CSV file");
    });
});

router.get("/getResults", async function (req, res) {
  // const filePath = path.join(__dirname,"../../omr/outputs/Results/Results.csv");
  const inputDirPath = path.join(__dirname, "../../omr/inputs");
  const outputDirPath = path.join(__dirname, "../../omr/outputs");
  const results = []; // Array to hold all rows of data

  fs.createReadStream(path.join(outputDirPath, "Results/Results.csv"))
    .pipe(csv())
    .on("data", (data) => results.push(data)) // Push each row of data into the results array
    .on("end", () => {
      // Once file reading is done, send the entire results array as a response
      res.json({ csv_file: results });

      // Function to delete all files in a directory
      const deleteAllFilesInDir = (dirPath) => {
        fs.readdir(dirPath, (err, files) => {
          if (err) {
            console.error(`Error reading directory ${dirPath}:`, err);
            return;
          }

          files.forEach((file) => {
            const fileToDelete = path.join(dirPath, file);
            fs.stat(fileToDelete, (err, stats) => {
              if (err) {
                console.error(`Error stating file ${fileToDelete}:`, err);
                return;
              }

              if (stats.isFile()) {
                fs.unlink(fileToDelete, (err) => {
                  if (err) {
                    console.error(`Error deleting file ${fileToDelete}:`, err);
                  } else {
                    console.log(`File ${fileToDelete} deleted successfully`);
                  }
                });
              } else if (stats.isDirectory()) {
                fs.rmdir(fileToDelete, { recursive: true }, (err) => {
                  if (err) {
                    console.error(`Error deleting directory ${fileToDelete}:`, err);
                  } else {
                    console.log(`Directory ${fileToDelete} deleted successfully`);
                  }
                });
              }
            });
          });
        });
      };

      // Delete all files in the input and output directories
      deleteAllFilesInDir(inputDirPath);
      deleteAllFilesInDir(outputDirPath);
    })

    .on("error", (error) => {
      // Handle any errors during file reading
      console.error("Error reading CSV file:", error);
      res.status(500).send("Error reading CSV file");
    });
});

// Save the exam key uploaded by the user
router.post("/saveExamKey/:examType", async function (req, res) {
  const template = req.params.examType;
  console.log("template", template);
  if (template === "100mcq") {
    //only one page
    const destinationDir = "/code/omr/inputs";
    const upload = createUploadMiddleware(destinationDir);
    upload.single("examKey")(req, res, function (err) {
      if (err) {
        return res.status(500).send("Error uploading file.");
      }
      console.log(req.file);
      res.send(JSON.stringify("File uploaded successfully"));
    });
  } else {
    // template === "200mcq"
    // 2 pages
    // WILL COME BACK TO THIS LATER
    const ensureDirectoryExistence = (dirPath) => {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    };

    const upload = multer({ dest: "uploads/" }).single("examKey");

    upload(req, res, async function (err) {
      if (err) {
        return res.status(500).send("Error uploading 200mcq key.");
      }
      const { path: tempFilePath } = req.file;
      const destinationDir1 = "/code/omr/inputs/page_1";
      const destinationDir2 = "/code/omr/inputs/page_2";

      ensureDirectoryExistence(destinationDir1);
      ensureDirectoryExistence(destinationDir2);

      try {
        const existingPdfBytes = fs.readFileSync(tempFilePath);
        const keyPDF = await PDFDocument.load(existingPdfBytes);

        const key_page_1 = await PDFDocument.create();
        const key_page_2 = await PDFDocument.create();

        const [page1] = await key_page_1.copyPages(keyPDF, [0]);
        const [page2] = await key_page_2.copyPages(keyPDF, [1]);

        key_page_1.addPage(page1);
        key_page_2.addPage(page2);
        const key_page_1_Bytes = await key_page_1.save();
        fs.writeFileSync(path.join(destinationDir1, "page_1.pdf"), key_page_1_Bytes);
        const key_page_2_Bytes = await key_page_2.save();
        fs.writeFileSync(path.join(destinationDir2, "page_2.pdf"), key_page_2_Bytes);

        fs.unlinkSync(tempFilePath); // Clean up the temporary file

        res.json({ message: "200mcq key uploaded and split successfully" });
      } catch (error) {
        console.error("Error processing PDF file:", error);
        res.status(500).send("Error processing PDF file");
      }
    });
  }
});

// Copy the template JSON file to the shared volume
router.post("/copyTemplate", async function (req, res) {
  console.log("copyTemplate");
  const examType = req.body.examType;
  const keyOrExam = req.body.keyOrExam;

  const ensureDirectoryExistence = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  };

  if (examType === "100mcq") {
    if (keyOrExam === "key") {
      // copying template for the key
      // only template for the second page
      // we can just store it straight in the inputs folder since it's just 1 page
      const filePath = "/code/omr/inputs";
      const templatePath = path.join(__dirname, "../assets/100mcq_page_2.json");
      const destinationTemplatePath = path.join(filePath, "template.json");

      ensureDirectoryExistence(filePath);

      try {
        fs.copyFileSync(templatePath, destinationTemplatePath);
        console.log("Template.json copied successfully");
      } catch (error) {
        console.error("Error copying template.json:", error);
        return res.status(500).send("Error copying template.json");
      }
    } else {
      // keyOrExam === "exam"
      // copying template for the exam
      // template for both ID and question page
      const filePath_1 = "/code/omr/inputs/page_1";
      const filePath_2 = "/code/omr/inputs/page_2";
      const templatePath_1 = path.join(__dirname, "../assets/100mcq_page_1.json");
      const templatePath_2 = path.join(__dirname, "../assets/100mcq_page_2.json");
      const destinationTemplatePath1 = path.join(filePath_1, "template.json");
      const destinationTemplatePath2 = path.join(filePath_2, "template.json");

      ensureDirectoryExistence(filePath_1);
      ensureDirectoryExistence(filePath_2);

      try {
        fs.copyFileSync(templatePath_1, destinationTemplatePath1);
        console.log("First template.json copied successfully");
        fs.copyFileSync(templatePath_2, destinationTemplatePath2);
        console.log("Second template.json copied successfully");
      } catch (error) {
        console.error("Error copying template.json:", error);
        return res.status(500).send("Error copying template.json");
      }
    }
  } else {
    // examType === "200mcq"
    // will get back to this
    if (keyOrExam === "key") {
      const filePath_1 = "/code/omr/inputs/page_1";
      const filePath_2 = "/code/omr/inputs/page_2";
      const templatePath_1 = path.join(__dirname, "../assets/200mcq_page_1.json");
      const templatePath_2 = path.join(__dirname, "../assets/200mcq_page_2.json");
      const destinationTemplatePath1 = path.join(filePath_1, "template.json");
      const destinationTemplatePath2 = path.join(filePath_2, "template.json");

      ensureDirectoryExistence(filePath_1);
      ensureDirectoryExistence(filePath_2);

      try {
        fs.copyFileSync(templatePath_1, destinationTemplatePath1);
        console.log("First template.json copied successfully");
        fs.copyFileSync(templatePath_2, destinationTemplatePath2);
        console.log("Second template.json copied successfully");
      } catch (error) {
        console.error("Error copying template.json:", error);
        return res.status(500).send("Error copying template.json");
      }
    }
  }
  res.send(JSON.stringify("File copied successfully"));
});

router.post("/callOMR", async function (req, res) {
  console.log("callOMR");
  try {
    const response = await fetch("http://flaskomr:5000/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("OMR Response: ", response);
    res.send(JSON.stringify("OMR called successfully in /callOMR"));
  } catch (error) {
    console.error("Error calling OMR: ", error);
  }
});

router.post("/UploadExam", async function (req, res) {
  const upload = multer({ dest: "uploads/" }).single("examPages");

  upload(req, res, async function (err) {
    if (err) {
      return res.status(500).send("Error uploading file.");
    }

    const { path: tempFilePath } = req.file;
    const destinationDir1 = "/code/omr/inputs/page_1";
    const destinationDir2 = "/code/omr/inputs/page_2";

    try {
      const existingPdfBytes = fs.readFileSync(tempFilePath);
      const examsPDF = await PDFDocument.load(existingPdfBytes);
      const totalPages = examsPDF.getPageCount();
      console.log("Total pages:", totalPages);

      const oddPagesPdf = await PDFDocument.create();
      const evenPagesPdf = await PDFDocument.create();

      for (let i = 0; i < totalPages; i++) {
        if ((i + 1) % 2 === 1) {
          const [pageToCopy] = await oddPagesPdf.copyPages(examsPDF, [i]);
          oddPagesPdf.addPage(pageToCopy);
        } else {
          const [pageToCopy] = await evenPagesPdf.copyPages(examsPDF, [i]);
          evenPagesPdf.addPage(pageToCopy);
        }
      }

      const oddBytes = await oddPagesPdf.save();
      fs.writeFileSync(path.join(destinationDir1, "front_pages.pdf"), oddBytes);
      const evenBytes = await evenPagesPdf.save();
      fs.writeFileSync(path.join(destinationDir2, "back_pages.pdf"), evenBytes);

      fs.unlinkSync(tempFilePath); // Clean up the temporary file

      res.json({ message: "File uploaded and split successfully" });
    } catch (error) {
      console.error("Error processing PDF file:", error);
      res.status(500).send("Error processing PDF file");
    }
  });
});

// Generate the evaluation JSON for an exam
router.post("/GenerateEvaluation", async function (req, res) {
  const { exam_id } = req.body;

  try {
    // Validate exam_id
    if (!exam_id) {
      return res.status(400).send("Missing exam_id");
    }

    // Get answer key from the database
    const answerKey = await getAnswerKeyForExam(exam_id);

    // Create evaluation.json
    const evaluationJson = {
      source_type: "custom",
      options: {
        questions_in_order: Array.from({ length: answerKey.length }, (_, i) => `q${i + 1}`),
        answers_in_order: answerKey,
      },
      outputs_configuration: {
        should_explain_scoring: true,
        draw_score: {
          enabled: true,
          position: [600, 1100],
          size: 1.5,
        },
        draw_answers_summary: {
          enabled: true,
          position: [300, 1200],
          size: 1.0,
        },
        draw_question_verdicts: {
          enabled: true,
          verdict_colors: {
            correct: "#00ff00",
            neutral: "#ff0000",
            incorrect: "#ff0000",
          },
          verdict_symbol_colors: {
            positive: "#000000",
            neutral: "#000000",
            negative: "#000000",
          },
          draw_answer_groups: {
            enabled: true,
          },
        },
        draw_detected_bubble_texts: {
          enabled: false,
        },
      },
      marking_schemes: {
        DEFAULT: {
          correct: "1",
          incorrect: "0",
          unmarked: "0",
        },
      },
    };

    const destinationDir = `/code/omr/inputs/page_2`;
    // Function to ensure the directory exists
    const ensureDirectoryExistence = (dirPath) => {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    };
    ensureDirectoryExistence(destinationDir);
    // const destinationDir = `/code/omr/inputs`;
    const evaluationFilePath = path.join(destinationDir, "evaluation.json");
    fs.writeFileSync(evaluationFilePath, JSON.stringify(evaluationJson, null, 2));

    res.json({ message: "evaluation.json created successfully" });
  } catch (error) {
    console.error("Error in /GenerateEvaluation:", error);
    res.status(500).send("Error generating evaluation file");
  }
});

// Call the OMR processing service
router.post("/callOMR", async function (req, res) {
  console.log("callOMR");
  try {
    const response = await fetch("http://flaskomr:5000/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("OMR Response: ", response);
    res.send(JSON.stringify("OMR called successfully in /callOMR"));
  } catch (error) {
    console.error("Error calling OMR: ", error);
  }
});

// Route to fetch the first PNG image in the folder
router.post("/fetchImage", async function (req, res) {
  let imagesFolderPath;
  if (req.body.side === "back") {
    imagesFolderPath = path.join(
      __dirname,
      `../../omr/outputs/page_2/CheckedOMRs/colored/${req.body.file_name}`
    );
  } else {
    imagesFolderPath = path.join(
      __dirname,
      `../../omr/outputs/page_1/CheckedOMRs/colored/${req.body.file_name}`
    );
  }
  console.log(req.body.file_name);
  try {
    // Send the image file
    res.sendFile(imagesFolderPath);
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).send("Error fetching image");
  }
});

router.get("/getScoreByExamId/:exam_id", async (req, res) => {
  try {
    const exam_id = parseInt(req.params.exam_id, 10);
    if (isNaN(exam_id)) {
      return res.status(400).send("Invalid exam_id");
    }
    const scores = await getScoreByExamId(exam_id);
    if (scores.length === 0) {
      return res.status(404).send("No scores found for this exam");
    }
    res.json({ scores });
  } catch (error) {
    console.error("Error in /getScoreByExamId:", error);
    res.status(500).send("Error retrieving scores");
  }
});

router.post("/saveResults", saveResults);

router.get("/searchExam/:student_id", async (req, res) => {
  const studentId = req.params.student_id;
  const filePath = path.join(__dirname, "../../omr/outputs/Results/Results.csv");
  let found = false; // Flag to check if student is found

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (data) => {
      if (data.StudentID === studentId) {
        found = true;
        res.json({ file_id: data.file_id });
      }
    })
    .on("end", () => {
      if (!found) {
        res.status(404).send("Student ID not found");
      }
    })
    .on("error", (error) => {
      console.error("Error reading CSV file:", error);
      res.status(500).send("Error reading CSV file");
    });
});

// There are 2 folders in outputs: page_1 and page_2
// The first folder contains the ID page and the second folder contains the question page
// Each ID page has a matching question page
// e.g front_pages_page_1.png = back_pages_page_1.png
// We extract the ID from front_pages_page_1.png and the answers from back_pages_page_1.png
// Create a CSV file with the following fields:
// "front_page_id", "back_page_id", "score", "student_id", "question_1", "question_2", ..., "question_100"
router.get("/preprocessingCSV", async (req, res) => {
  console.log("Hello from preprocessingCSV");
  const frontPagePath = path.join(__dirname, "../../omr/outputs/page_1/Results/Results.csv");
  const backPagePath = path.join(__dirname, "../../omr/outputs/page_2/Results/Results.csv");
  const outputPath = path.join(__dirname, "../../omr/outputs/combined.csv");

  const frontPageData = [];
  const backPageData = [];

  // Read front_page.csv
  fs.createReadStream(frontPagePath)
    .pipe(csv())
    .on("data", (data) => {
      frontPageData.push({
        front_page_file_id: data.file_id,
        FirstName: data.FirstName,
        LastName: data.LastName,
        StudentID: data.StudentID,
      });
    })
    .on("end", () => {
      // Read back_page.csv
      fs.createReadStream(backPagePath)
        .pipe(csv())
        .on("data", (data) => {
          backPageData.push({
            back_page_file_id: data.file_id,
            score: data.score,
          });
        })
        .on("end", () => {
          // Combine data from both CSV files
          const combinedData = frontPageData.map((frontData) => {
            const backData = backPageData.find(
              (back) => back.back_page_file_id.slice(-6) === frontData.front_page_file_id.slice(-6)
            );
            return {
              ...frontData,
              back_page_file_id: backData ? backData.back_page_file_id : null,
              score: backData ? backData.score : null,
            };
          });

          // Convert combined data to CSV format
          const json2csvParser = new Parser();
          const csvData = json2csvParser.parse(combinedData);

          // Save the combined CSV data to a file
          fs.writeFile(outputPath, csvData, (err) => {
            if (err) {
              console.error("Error writing combined.csv:", err);
              res.status(500).send("Error writing combined.csv");
            } else {
              console.log("Combined CSV file saved successfully.");
              res.status(200).send("Combined CSV file saved successfully.");
            }
          });
        })
        .on("error", (error) => {
          console.error("Error reading back_page.csv:", error);
          res.status(500).send("Error reading back_page.csv");
        });
    })
    .on("error", (error) => {
      console.error("Error reading front_page.csv:", error);
      res.status(500).send("Error reading front_page.csv");
    });
});

//test routes
router.post("/test", async function (req, res) {
  console.log("test called");
  res.send(JSON.stringify("Test route called successfully"));
});

module.exports = router;
