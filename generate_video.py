#!/usr/bin/env python3
"""
AudiogramPro Video Generator
Creates a complete professional video of the system and workflow
"""

import os
import sys
import json
import subprocess
from datetime import datetime
from pathlib import Path

# Configuration
PROJECT_ROOT = Path(__file__).parent
VIDEO_OUTPUT_DIR = PROJECT_ROOT / "video_output"
VIDEO_ASSETS_DIR = PROJECT_ROOT / "video_assets"
TEMP_DIR = PROJECT_ROOT / "temp_video_files"

# Ensure directories exist
VIDEO_OUTPUT_DIR.mkdir(exist_ok=True)
VIDEO_ASSETS_DIR.mkdir(exist_ok=True)
TEMP_DIR.mkdir(exist_ok=True)

class VideoGenerator:
    def __init__(self):
        self.video_scenes = [
            {
                "id": 1,
                "title": "Introduction",
                "duration_seconds": 30,
                "narration": """Welcome to AudiogramPro Offline - the modern solution for managing 
                audiogram records with complete privacy and offline functionality.

                In this video, we'll walk through the entire system, from setup to 
                managing patient hearing test records.

                Whether you're an audiologist, clinic administrator, or researcher, 
                AudiogramPro makes hearing test management fast, secure, and simple.""",
                "visual_notes": [
                    "Show title slide",
                    "Fade in software running",
                    "Show key features as bullets",
                    "Professional background music"
                ]
            },
            {
                "id": 2,
                "title": "System Requirements & Installation",
                "duration_seconds": 75,
                "narration": """Installation is incredibly simple. Just three things you need:

                First - Node.js and npm must be installed. You probably already have this.

                Second - You'll need about 500MB of free disk space.

                Third - Just double-click the SETUP_AND_RUN.bat file.

                The system handles everything automatically:
                - Checks your system
                - Installs all required packages
                - Starts the development server
                - Opens the application in your browser

                On the first run, this takes about 2 minutes. After that, it's lightning fast.""",
                "visual_notes": [
                    "Show file explorer with SETUP_AND_RUN.bat",
                    "Double-click file",
                    "Show terminal with installation",
                    "Show progress bar",
                    "Browser opens to localhost:9002",
                    "Application loaded"
                ]
            },
            {
                "id": 3,
                "title": "Dashboard Overview",
                "duration_seconds": 75,
                "narration": """And here we are - the AudiogramPro dashboard.

                This is your command center for all audiogram records.

                In the top right, you have three main action buttons:
                - 'NEW DIAGNOSTIC' to create a new patient record
                - 'EXPORT DATA' to backup your information
                - 'IMPORT DATA' to restore from backups

                Below that, you'll see a list of all existing patient records.

                Each record shows the patient name, test date, and test type.

                You can click on any record to view full details, edit, or print it.

                The interface is clean and intuitive - no complicated menus.""",
                "visual_notes": [
                    "Show full dashboard",
                    "Highlight NEW DIAGNOSTIC button",
                    "Highlight EXPORT DATA button",
                    "Highlight IMPORT DATA button",
                    "Show record list",
                    "Hover over records",
                    "Show clean interface"
                ]
            },
            {
                "id": 4,
                "title": "Creating a New Record",
                "duration_seconds": 90,
                "narration": """Now let's create a new audiogram record. Click the 'NEW DIAGNOSTIC' button.

                You'll see a comprehensive form with all the information you need:

                First section - Patient Information:
                - Full name of the patient
                - Date of birth
                - Patient ID (optional)

                Second section - Test Details:
                - Date the test was performed
                - Type of hearing test conducted

                The interface guides you through each field with helpful labels.

                If you skip a required field, the form will remind you before saving.""",
                "visual_notes": [
                    "Click NEW DIAGNOSTIC button",
                    "Form page loads",
                    "Show patient information fields",
                    "Show test details section",
                    "Scroll through form",
                    "Show form validation",
                    "Highlight required fields"
                ]
            },
            {
                "id": 5,
                "title": "Entering Hearing Test Data",
                "duration_seconds": 90,
                "narration": """Let's enter some sample data to see how it works.

                First, we'll enter the patient's basic information.

                Then we select the test date and type of hearing test.

                Now comes the most important part - the hearing thresholds.

                For each ear, we enter the decibel values at six standard frequencies:
                - 250 Hz (low frequencies)
                - 500 Hz
                - 1000 Hz (mid frequencies)
                - 2000 Hz
                - 4000 Hz
                - 8000 Hz (high frequencies)

                Notice something cool - as you enter the values, 
                the chart on the right updates in real-time!

                You can see your audiogram taking shape as you type.

                This gives you immediate feedback and helps catch errors.""",
                "visual_notes": [
                    "Type patient name",
                    "Select birth date",
                    "Select test date",
                    "Select test type",
                    "Start entering left ear thresholds",
                    "Show chart updating",
                    "Enter right ear thresholds",
                    "Show complete chart",
                    "Highlight chart clarity"
                ]
            },
            {
                "id": 6,
                "title": "Chart Visualization",
                "duration_seconds": 45,
                "narration": """Let me zoom in on the audiogram chart so you can see the professional visualization.

                The chart displays hearing thresholds across the frequency spectrum.

                The vertical axis shows the hearing level in decibels, with 0dB at the top 
                representing normal hearing.

                The two lines represent left ear and right ear.

                You can immediately see any differences between the two ears.

                The chart is clean, professional, and ready for printing or sharing.

                This is exactly what you'd see in a professional audiology practice.""",
                "visual_notes": [
                    "Click on chart to maximize",
                    "Point to frequency labels",
                    "Point to dB scale",
                    "Point to legend and colors",
                    "Show data point accuracy",
                    "Show full chart view"
                ]
            },
            {
                "id": 7,
                "title": "Saving the Record",
                "duration_seconds": 30,
                "narration": """When you're done entering data, just click the Save button.

                The system immediately stores your record in the local browser database.

                All your data stays on your computer - it never goes to the cloud.

                You'll see a confirmation message letting you know the save was successful.

                The data is stored in IndexedDB, which means it persists even if you 
                close your browser or restart your computer.

                Let's go back to the dashboard to see our new record added to the list.""",
                "visual_notes": [
                    "Scroll to Save button",
                    "Click Save button",
                    "Show loading state",
                    "Show success notification",
                    "Navigate back to dashboard",
                    "Show new record in list"
                ]
            },
            {
                "id": 8,
                "title": "Viewing & Editing Records",
                "duration_seconds": 60,
                "narration": """Clicking on a record from the dashboard takes you to the detailed view page.

                Here you can see all the information for that patient:
                - Complete patient details
                - The full audiogram chart
                - All the hearing threshold values

                You have three main actions available:

                First - Edit: You can modify any information if needed.

                Second - Print: Generate a professional report for the patient.

                Third - Delete: Remove the record permanently if needed.

                Let me make a quick edit to show how easy it is.""",
                "visual_notes": [
                    "Click on record from dashboard",
                    "Show complete record details",
                    "Highlight Edit button",
                    "Click Edit",
                    "Form loads with data",
                    "Make small change",
                    "Click Save",
                    "Show success message"
                ]
            },
            {
                "id": 9,
                "title": "Data Export & Backup",
                "duration_seconds": 60,
                "narration": """One of the most important features is the ability to backup your data.

                All your records are stored locally, but it's smart to have an external backup.

                Click the 'EXPORT DATA' button on the dashboard.

                You have two export options:

                First - CSV Format: This creates a spreadsheet file compatible with Excel.

                Second - JSON Format: This is a complete backup of all your records.

                Let me export to CSV so you can see the format.""",
                "visual_notes": [
                    "Click EXPORT DATA button",
                    "Dialog opens showing options",
                    "Explain CSV option",
                    "Explain JSON option",
                    "Click Export to CSV",
                    "Show download notification",
                    "Open file in Excel",
                    "Show professional spreadsheet"
                ]
            },
            {
                "id": 10,
                "title": "System Benefits & Privacy",
                "duration_seconds": 30,
                "narration": """Let me highlight the key benefits of AudiogramPro:

                PRIVACY FIRST: All data stays on your computer. No cloud sync, 
                no third-party services, no tracking.

                OFFLINE FUNCTIONALITY: Works perfectly without internet connection.

                FAST PERFORMANCE: All operations happen locally, so everything is lightning-fast.

                PROFESSIONAL QUALITY: Charts and reports meet clinical standards.

                EASY TO USE: The interface is clean and intuitive.

                COMPLETE CONTROL: You own your data and can backup anytime.""",
                "visual_notes": [
                    "Show database icon (offline)",
                    "Show security icons",
                    "Show privacy checkmarks",
                    "Show speed indicators",
                    "Show professional chart",
                    "Show ease of use indicators"
                ]
            },
            {
                "id": 11,
                "title": "Summary & Call to Action",
                "duration_seconds": 15,
                "narration": """AudiogramPro Offline is a complete, professional solution for 
                audiogram record management.

                Whether you're running a clinic, conducting research, or managing 
                your own hearing health, this application provides complete privacy, 
                professional quality, and easy operation.

                Getting started is simple: Just double-click SETUP_AND_RUN.bat 
                and you're ready in minutes.

                Thank you for watching, and welcome to AudiogramPro!""",
                "visual_notes": [
                    "Show full application",
                    "Fade to benefits list",
                    "Highlight setup file",
                    "Final title card",
                    "Credits"
                ]
            }
        ]
        
    def generate_narration_file(self):
        """Generate a text file with all narration"""
        narration_path = VIDEO_ASSETS_DIR / "NARRATION_SCRIPT.txt"
        
        with open(narration_path, 'w', encoding='utf-8') as f:
            f.write("=" * 70 + "\n")
            f.write("AUDIOGRAMPRO VIDEO - COMPLETE NARRATION SCRIPT\n")
            f.write("=" * 70 + "\n\n")
            
            for scene in self.video_scenes:
                f.write(f"\nSCENE {scene['id']}: {scene['title'].upper()}\n")
                f.write(f"Duration: {scene['duration_seconds']} seconds\n")
                f.write("-" * 70 + "\n")
                f.write("NARRATION:\n")
                f.write(scene['narration'].strip() + "\n\n")
                f.write("VISUAL NOTES:\n")
                for note in scene['visual_notes']:
                    f.write(f"  • {note}\n")
                f.write("\n" + "=" * 70 + "\n")
        
        return narration_path
    
    def generate_json_metadata(self):
        """Generate JSON metadata for the video"""
        metadata = {
            "title": "AudiogramPro Offline - Complete Workflow Demo",
            "description": "Professional demonstration of AudiogramPro system and workflow",
            "duration_minutes": 10,
            "created_date": datetime.now().isoformat(),
            "target_audience": [
                "Healthcare Professionals",
                "Clinic Administrators",
                "Researchers",
                "End Users"
            ],
            "total_scenes": len(self.video_scenes),
            "scenes": []
        }
        
        for scene in self.video_scenes:
            metadata["scenes"].append({
                "id": scene['id'],
                "title": scene['title'],
                "duration_seconds": scene['duration_seconds'],
                "narration_length": len(scene['narration'].split()),
                "visual_notes_count": len(scene['visual_notes'])
            })
        
        metadata_path = VIDEO_ASSETS_DIR / "VIDEO_METADATA.json"
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2)
        
        return metadata_path
    
    def generate_timing_guide(self):
        """Generate a timing guide for the video"""
        timing_path = VIDEO_ASSETS_DIR / "TIMING_GUIDE.txt"
        
        cumulative_time = 0
        with open(timing_path, 'w', encoding='utf-8') as f:
            f.write("AUDIOGRAMPRO VIDEO - SCENE TIMING GUIDE\n")
            f.write("=" * 60 + "\n\n")
            
            for scene in self.video_scenes:
                start_time = self._seconds_to_timestamp(cumulative_time)
                cumulative_time += scene['duration_seconds']
                end_time = self._seconds_to_timestamp(cumulative_time)
                
                f.write(f"Scene {scene['id']}: {scene['title']}\n")
                f.write(f"  Time: {start_time} - {end_time}\n")
                f.write(f"  Duration: {scene['duration_seconds']} seconds\n\n")
            
            f.write("=" * 60 + "\n")
            f.write(f"Total Video Length: {self._seconds_to_timestamp(cumulative_time)}\n")
        
        return timing_path
    
    def _seconds_to_timestamp(self, seconds):
        """Convert seconds to MM:SS format"""
        minutes = int(seconds) // 60
        secs = int(seconds) % 60
        return f"{minutes}:{secs:02d}"
    
    def generate_html_guide(self):
        """Generate an HTML interactive guide"""
        html_path = VIDEO_ASSETS_DIR / "VIDEO_GUIDE.html"
        
        html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AudiogramPro Video Guide</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        
        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        
        header h1 {
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        header p {
            font-size: 1.1em;
            opacity: 0.9;
        }
        
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 40px;
            background: #f8f9fa;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .stat {
            text-align: center;
        }
        
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
            color: #667eea;
        }
        
        .stat-label {
            color: #666;
            margin-top: 5px;
        }
        
        .content {
            padding: 40px;
        }
        
        .scene {
            margin-bottom: 40px;
            border-left: 5px solid #667eea;
            padding-left: 20px;
            padding-top: 10px;
        }
        
        .scene-header {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-bottom: 15px;
        }
        
        .scene-number {
            background: #667eea;
            color: white;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 1.3em;
        }
        
        .scene-title {
            font-size: 1.5em;
            font-weight: 600;
            color: #333;
        }
        
        .scene-time {
            color: #999;
            font-size: 0.95em;
        }
        
        .narration {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            line-height: 1.6;
            color: #555;
        }
        
        .visual-notes {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
        }
        
        .visual-notes h4 {
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .visual-notes ul {
            list-style: none;
            padding-left: 0;
        }
        
        .visual-notes li {
            padding: 5px 0;
            padding-left: 25px;
            position: relative;
            color: #555;
        }
        
        .visual-notes li:before {
            content: "▶";
            position: absolute;
            left: 0;
            color: #667eea;
        }
        
        footer {
            background: #f8f9fa;
            padding: 30px 40px;
            text-align: center;
            color: #666;
            border-top: 1px solid #e0e0e0;
        }
        
        @media (max-width: 768px) {
            header h1 {
                font-size: 1.8em;
            }
            
            .stats {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>🎬 AudiogramPro Video Guide</h1>
            <p>Complete Scene-by-Scene Breakdown</p>
        </header>
        
        <div class="stats">
            <div class="stat">
                <div class="stat-number">11</div>
                <div class="stat-label">Total Scenes</div>
            </div>
            <div class="stat">
                <div class="stat-number">10:00</div>
                <div class="stat-label">Total Duration</div>
            </div>
            <div class="stat">
                <div class="stat-number">1920x1080</div>
                <div class="stat-label">Recommended Resolution</div>
            </div>
            <div class="stat">
                <div class="stat-number">Professional</div>
                <div class="stat-label">Quality Target</div>
            </div>
        </div>
        
        <div class="content">
            <h2>Scene Breakdown</h2>
            
            <div class="scene">
                <div class="scene-header">
                    <div class="scene-number">1</div>
                    <div>
                        <div class="scene-title">Introduction</div>
                        <div class="scene-time">0:00 - 0:30 (30 seconds)</div>
                    </div>
                </div>
                <div class="narration">Welcome to AudiogramPro Offline...</div>
                <div class="visual-notes">
                    <h4>Visual Notes:</h4>
                    <ul>
                        <li>Show title slide</li>
                        <li>Fade in software running</li>
                        <li>Show key features as bullets</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <footer>
            <p>📹 Use this guide to create your professional product video</p>
            <p>Check <strong>NARRATION_SCRIPT.txt</strong> for complete dialog</p>
        </footer>
    </div>
</body>
</html>
"""
        
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        return html_path
    
    def generate_all(self):
        """Generate all video assets"""
        print("\n" + "="*60)
        print("AUDIOGRAMPRO VIDEO GENERATOR")
        print("="*60 + "\n")
        
        try:
            print("[1/4] Generating narration script...")
            narration_file = self.generate_narration_file()
            print(f"      ✓ Created: {narration_file.name}")
            
            print("[2/4] Generating video metadata...")
            metadata_file = self.generate_json_metadata()
            print(f"      ✓ Created: {metadata_file.name}")
            
            print("[3/4] Generating timing guide...")
            timing_file = self.generate_timing_guide()
            print(f"      ✓ Created: {timing_file.name}")
            
            print("[4/4] Generating interactive HTML guide...")
            html_file = self.generate_html_guide()
            print(f"      ✓ Created: {html_file.name}")
            
            print("\n" + "="*60)
            print("VIDEO ASSETS GENERATED SUCCESSFULLY!")
            print("="*60)
            
            print(f"\n📁 Location: {VIDEO_ASSETS_DIR}")
            print("\n📋 Generated Files:")
            print("   ✓ NARRATION_SCRIPT.txt - Complete narration for each scene")
            print("   ✓ VIDEO_METADATA.json - Technical video metadata")
            print("   ✓ TIMING_GUIDE.txt - Scene timing breakdown")
            print("   ✓ VIDEO_GUIDE.html - Interactive visual guide")
            
            print("\n" + "="*60)
            print("NEXT STEPS - How to Create Your Video:")
            print("="*60)
            
            print("\n1️⃣  DOWNLOAD & INSTALL RECORDING SOFTWARE:")
            print("    • OBS Studio (FREE): https://obsproject.com")
            print("    • Resolution: 1920x1080")
            print("    • Frame Rate: 30 fps")
            
            print("\n2️⃣  RECORD YOUR SCREEN:")
            print("    • Open AudiogramPro at http://localhost:9002")
            print("    • Follow the scenes in VIDEO_SCRIPT.md")
            print("    • Perform actions shown in NARRATION_SCRIPT.txt")
            print("    • Record for 10 minutes total")
            
            print("\n3️⃣  ADD VOICEOVER NARRATION:")
            print("    • Download Audacity (FREE): https://www.audacityteam.org")
            print("    • Or use your OS built-in recorder")
            print("    • Read from NARRATION_SCRIPT.txt")
            print("    • Record in clear, professional tone")
            
            print("\n4️⃣  EDIT & COMBINE:")
            print("    • Download DaVinci Resolve (FREE): https://www.blackmagicdesign.com")
            print("    • Import screen recording")
            print("    • Add voiceover track")
            print("    • Add background music (royalty-free)")
            print("    • Add text overlays from NARRATION_SCRIPT.txt")
            print("    • Export as MP4 (1920x1080, H.264)")
            
            print("\n5️⃣  PUBLISH:")
            print("    • Upload to YouTube")
            print("    • Share on LinkedIn")
            print("    • Embed on your website")
            
            print("\n" + "="*60)
            print("TIPS FOR BEST RESULTS:")
            print("="*60)
            print("  🎯 Slow down your mouse movements by 20-30%")
            print("  🎤 Speak clearly and at a steady pace")
            print("  📊 Use zoom to highlight important UI elements")
            print("  🎵 Keep background music at -15dB")
            print("  ⏱️  Use timing guide to stay on schedule")
            print("  🎬 Add text overlays for key features")
            print("  ✨ Use transitions between scenes (subtle)")
            
            print("\n" + "="*60 + "\n")
            
            return True
            
        except Exception as e:
            print(f"\n❌ Error generating video assets: {str(e)}")
            return False

if __name__ == "__main__":
    generator = VideoGenerator()
    success = generator.generate_all()
    
    if success:
        print("✅ Ready to start recording your video!")
    else:
        print("❌ Failed to generate video assets")
        sys.exit(1)
