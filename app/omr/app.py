from flask import Flask, request, jsonify
import subprocess
import os

app = Flask(__name__)

@app.route('/')
def home():
    return "Flask OMR Service is running"

@app.route('/process', methods=['POST'])
def process_omr():
    input_dir = "code/omr/inputs"
    out_dir = "code/omr/outputs"
    
    # Log the current directory structure for debugging
    for root, dirs, files in os.walk("/code/omr"):
        app.logger.info(f"Root: {root}, Dirs: {dirs}, Files: {files}")

    try:
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

        return jsonify({"output": result.stdout}), 200

    except subprocess.CalledProcessError as e:
        app.logger.error(f"OMR Script CalledProcessError: {e}")
        return jsonify({"error": str(e), "output": e.stdout, "errors": e.stderr}), 500
    except Exception as e:
        app.logger.error(f"OMR Script Exception: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
