"""
Ecomlytics - Run All Backend Steps
Run this file once to generate all data and ML outputs.
Usage: python run_backend.py
"""
import subprocess
import sys
import os

steps = [
    ("Generating dataset...",      "data_generator.py"),
    ("Running ML models...",       "ml_engine.py"),
    ("Running insight engine...",  "insight_engine.py"),
]

os.chdir(os.path.dirname(os.path.abspath(__file__)))

print("=" * 50)
print("  Ecomlytics Backend Setup")
print("=" * 50)

for label, script in steps:
    print(f"\n{label}")
    result = subprocess.run([sys.executable, script], capture_output=True, text=True)
    if result.returncode == 0:
        print(f"  Done: {result.stdout.strip()}")
    else:
        print(f"  Error: {result.stderr.strip()}")
        sys.exit(1)

print("\n" + "=" * 50)
print("  All backend steps complete!")
print("  Files generated:")
print("    - dataset.json")
print("    - ml_results.json")
print("    - engine_results.json")
print("=" * 50)
print("\nNow go to the frontend/ folder and run:")
print("  npm install")
print("  npm start")
