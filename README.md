# GradeFalcon
### An optical marking management system for the Department of Computer Science, Mathematics, Physics, and Statistics at the University of British Columbia - Okanagan

**Team Members**
1. Omar Ankit
2. Ahmad Saleem Mirza
3. Nelson Nguru Ngumo
4. Jusnoor Kaur Sachdeva
5. Bennett Witt

User guides for this app can be found in `docs/guides`  
[Instructor guide](docs/guides/instructor_guide.md)  
[Student guide](docs/guides/student_guide.md)

**File Structure**
```
├── docs                    # Documentation files
│   ├── TOC.md              # Table of contents
│   ├── plan                # Scope and Charter
│   ├── design              # Getting started guide
│   ├── final               # Getting started guide
│   ├── logs                # Team Logs
│   └── ...
├── build                   # Compiled files    
├── app                     # Source files
├── test                    # Automated tests
├── tools                   # Tools and utilities
├── LICENSE                 # The license for this project 
└── README.md
```

## Main Features
GradeFalcon offers a range of features designed to simplify and enhance the exam management process for instructors. Below are some key functionalities, including creating new exams, uploading and grading answer keys, and generating custom exam sheets. Each feature is accompanied by visual guides to provide a quick and intuitive understanding of how to use the platform.

### **Creating a New Exam**
1. Create an exam by navigating to the new exam page.
   ![New exam](docs/guides/instructorView/new_exam_1.png)

2. Select an existing template or create a custom one.
   ![Select template](docs/guides/instructorView/new_exam_2.png)

3. Choose to upload an exam key or manually select answers.
   ![Upload or manual](docs/guides/instructorView/new_exam_3.png)

4. Set questions and choose answers.
   ![manual](docs/guides/instructorView/manual_exam_key.png)

5. Apply a custom marking scheme.
   ![custom marking](docs/guides/instructorView/custom_marking.png)

6. Configure student viewing options and save the exam.
   ![viewing options](docs/guides/instructorView/viewing_options.png)

7. View your exam on the exam board.
   ![exam board](docs/guides/instructorView/exam_board.png)

### **Uploading the Solution Key**
1. Upload an existing filled-out bubble sheet to create an exam key.
   ![Upload or manual](docs/guides/instructorView/new_exam_3.png)

2. Import the file for OMR scanning.
   ![upload exam key](docs/guides/instructorView/upload_exam_key.png)

3. The OMR will auto-fill the bubble grid based on the uploaded key.
   ![exam key scan](docs/guides/instructorView/exam_key_scan.png)

### **Creating a Custom Exam Sheet**
1. Select the 'Custom' option to set the number of questions and options.
   ![select custom template](docs/guides/instructorView/select_custom_template.png)

2. Generate and download the custom PDF.
   ![downloaded pdf](docs/guides/instructorView/downloaded_pdf.png)

### **Grading Exams**
1. Start grading by selecting an exam from the Exam Board.
   ![exam board grading](docs/guides/instructorView/exam_board_grading.png)

2. Upload exam stacks and begin the OMR process.
3. Review the scanned results, handle unknown student IDs if necessary.
   ![review exams](docs/guides/instructorView/review_exams.png)

4. View exam details, including original and scanned copies.
   ![view page](docs/guides/instructorView/view_page.png)
   ![scanned exams](docs/guides/instructorView/view_scanned.png)

5. Save the graded results.
   ![review exams](docs/guides/instructorView/review_exams.png)
