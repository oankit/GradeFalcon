from flask import Flask, request, jsonify
import subprocess
import os
import shutil


app = Flask(__name__)

#To run the demo please run "docker cp src/assets/template.json  app-backend-1:/code/omr/inputs/template.json". We are currently working to automate the process.

@app.route('/')
def home():
    return "Flask OMR Service is running"


@app.route('/process', methods=['POST'])
def process_omr():
    print(app.root_path)
    input_dir = "./inputs"
    out_dir = "./outputs"
    
    # Log the current directory structure for debugging
    for root, dirs, files in os.walk("/omr"):
        app.logger.info(f"Root: {root}, Dirs: {dirs}, Files: {files}")

    try:
          # Run the PDF conversion script
        subprocess.run(
            ["python3", "pdf_to_images.py"], #change to ["python3", "./scripts/pdf_to_images.py"]
            capture_output=True,
            text=True,
            check=True
        )

          # Log contents of input directory before processing
        app.logger.info(f"Contents of input directory before processing: {os.listdir(input_dir)}")
        

        # Run the OMR processing script
        result = subprocess.run(
            ["python3", "main.py", "--inputDir", input_dir, "--outputDir", out_dir],
            capture_output=True,
            text=True,
            check=True
        )

        # Log the stdout and stderr for debugging
        app.logger.info(f"OMR Script Output: {result.stdout}")
        app.logger.info(f"OMR Script Errors: {result.stderr}")

            # Clean up the input directory
        # for filename in os.listdir(input_dir):
        #     file_path = os.path.join(input_dir, filename)
        #     try:
        #         if os.path.isfile(file_path) or os.path.islink(file_path):
        #             os.unlink(file_path)
        #         elif os.path.isdir(file_path):
        #             shutil.rmtree(file_path)
        #     except Exception as e:
        #         app.logger.error(f'Failed to delete {file_path}. Reason: {e}')

        return jsonify({"output": result.stdout}), 200
    
    except subprocess.CalledProcessError as e:
        app.logger.error(f"OMR Script CalledProcessError: {e}")
        app.logger.error(f"OMR Script stderr: {e.stderr}")
        return jsonify({"error": str(e), "output": e.stdout, "errors": e.stderr}), 500
    except Exception as e:
        app.logger.error(f"OMR Script Exception: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
