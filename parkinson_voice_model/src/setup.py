#!/usr/bin/env python3
"""
Quick setup and validation script for Parkinson's Disease Voice Detection Project
Checks dependencies, validates dataset structure, and runs basic tests.

Usage:
    python setup.py

Author: Your Name
Date: September 2025
"""

import os
import sys
import subprocess
import importlib
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    print("Checking Python version...")
    if sys.version_info < (3, 7):
        print("❌ Error: Python 3.7 or higher is required!")
        print(f"Current version: {sys.version}")
        return False
    print(f"✅ Python version: {sys.version.split()[0]}")
    return True

def install_requirements():
    """Install required packages"""
    print("\nInstalling required packages...")
    
    requirements = [
        'numpy>=1.21.0',
        'pandas>=1.3.0',
        'scikit-learn>=1.0.0',
        'xgboost>=1.5.0',
        'librosa>=0.8.1',
        'praat-parselmouth>=0.4.0',
        'soundfile>=0.10.0',
        'scipy>=1.7.0',
        'matplotlib>=3.5.0',
        'seaborn>=0.11.0',
        'joblib>=1.1.0',
        'openpyxl>=3.0.0',
        'tqdm>=4.62.0'
    ]
    
    failed_packages = []
    
    for package in requirements:
        try:
            package_name = package.split('>=')[0].replace('-', '_')
            
            # Special handling for praat-parselmouth
            if package_name == 'praat_parselmouth':
                package_name = 'parselmouth'
            
            importlib.import_module(package_name)
            print(f"✅ {package.split('>=')[0]} - already installed")
            
        except ImportError:
            print(f"⚠️  Installing {package.split('>=')[0]}...")
            try:
                subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
                print(f"✅ {package.split('>=')[0]} - installed successfully")
            except subprocess.CalledProcessError:
                print(f"❌ Failed to install {package.split('>=')[0]}")
                failed_packages.append(package)
    
    if failed_packages:
        print(f"\n❌ Failed to install: {', '.join(failed_packages)}")
        print("Please install these packages manually:")
        for pkg in failed_packages:
            print(f"  pip install {pkg}")
        return False
    
    print("✅ All packages installed successfully!")
    return True

def validate_dataset_structure():
    """Validate that dataset structure is correct"""
    print("\nValidating dataset structure...")
    
    # Get project root (parent of src)
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    
    required_paths = [
        os.path.join(project_root, "dataset"),
        os.path.join(project_root, "dataset", "a_sound_dataset"),
        os.path.join(project_root, "dataset", "a_sound_dataset", "HC_AH"),
        os.path.join(project_root, "dataset", "a_sound_dataset", "PD_AH"),
        os.path.join(project_root, "dataset", "italian_dataset"),
        os.path.join(project_root, "dataset", "italian_dataset", "EHC"),
        os.path.join(project_root, "dataset", "italian_dataset", "YHC"), 
        os.path.join(project_root, "dataset", "italian_dataset", "PwPD"),
        os.path.join(project_root, "models")
    ]
    
    missing_paths = []
    for path in required_paths:
        if not os.path.exists(path):
            missing_paths.append(path)
        else:
            print(f"✅ Found: {os.path.relpath(path, project_root)}")
    
    if missing_paths:
        print(f"\n⚠️  Missing directories:")
        for path in missing_paths:
            rel_path = os.path.relpath(path, project_root)
            print(f"  - {rel_path}")
        print("\nPlease create the missing directories and add your data files.")
        return False
    
    # Check for audio files
    a_sound_hc_path = os.path.join(project_root, "dataset", "a_sound_dataset", "HC_AH")
    a_sound_pd_path = os.path.join(project_root, "dataset", "a_sound_dataset", "PD_AH")
    
    if os.path.exists(a_sound_hc_path) and os.path.exists(a_sound_pd_path):
        a_sound_hc = len([f for f in os.listdir(a_sound_hc_path) if f.endswith('.wav')])
        a_sound_pd = len([f for f in os.listdir(a_sound_pd_path) if f.endswith('.wav')])
        print(f"✅ A-sound dataset: {a_sound_hc} HC files, {a_sound_pd} PD files")
    
    # Check Italian dataset structure
    italian_base = os.path.join(project_root, "dataset", "italian_dataset")
    italian_checks = [
        (os.path.join(italian_base, "EHC", "speech"), "EHC speech files"),
        (os.path.join(italian_base, "EHC", "vowels"), "EHC vowel files"),
        (os.path.join(italian_base, "YHC", "speech"), "YHC speech files"),
        (os.path.join(italian_base, "PwPD"), "PwPD patient groups")
    ]
    
    for path, description in italian_checks:
        if os.path.exists(path):
            print(f"✅ Found: {description}")
        else:
            print(f"⚠️  Missing: {description} at {os.path.relpath(path, project_root)}")
    
    print("✅ Dataset structure validation completed!")
    return True

def test_feature_extraction():
    """Test feature extraction on a sample file"""
    print("\nTesting feature extraction...")
    
    try:
        # Find a test audio file
        test_file = None
        
        # Get project root
        current_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.dirname(current_dir)
        
        # Check A-sound dataset first
        hc_path = os.path.join(project_root, "dataset", "a_sound_dataset", "HC_AH")
        if os.path.exists(hc_path):
            wav_files = [f for f in os.listdir(hc_path) if f.endswith('.wav')]
            if wav_files:
                test_file = os.path.join(hc_path, wav_files[0])
        
        if test_file is None:
            print("⚠️  No audio files found for testing")
            return True
        
        print(f"Testing with file: {os.path.basename(test_file)}")
        
        # Import and test feature extractor
        from feature_extractor import VoiceFeatureExtractor
        
        extractor = VoiceFeatureExtractor()
        features = extractor.extract_all_features(test_file)
        
        if features and len(features) > 20:
            print(f"✅ Feature extraction successful! Extracted {len(features)} features")
            print("Sample features:", list(features.keys())[:5])
            return True
        else:
            print("❌ Feature extraction failed - insufficient features extracted")
            return False
            
    except Exception as e:
        print(f"❌ Feature extraction test failed: {str(e)}")
        return False

def create_project_structure():
    """Create additional project directories"""
    print("\nCreating project structure...")
    
    # Get project root
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(current_dir)
    
    directories = [
        os.path.join(project_root, "dataset", "processed"),
        os.path.join(project_root, "models"),
        os.path.join(project_root, "results"),
        os.path.join(project_root, "plots")
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        rel_path = os.path.relpath(directory, project_root)
        print(f"✅ Created: {rel_path}")

def main():
    """Main setup function"""
    print("="*60)
    print("PARKINSON'S DISEASE VOICE DETECTION - SETUP")
    print("="*60)
    
    # Step 1: Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Step 2: Install requirements
    if not install_requirements():
        print("\n⚠️  Some packages failed to install. You may need to install them manually.")
        print("Continue with dataset validation? (y/n): ", end="")
        if input().lower() != 'y':
            sys.exit(1)
    
    # Step 3: Create project structure
    create_project_structure()
    
    # Step 4: Validate dataset
    validate_dataset_structure()
    
    # Step 5: Test feature extraction
    test_feature_extraction()
    
    print("\n" + "="*60)
    print("SETUP COMPLETED!")
    print("="*60)
    print("Next steps:")
    print("1. Ensure your audio files are in the correct directories")
    print("2. Run: python main.py")
    print("3. Wait for training to complete (~20-30 minutes)")
    print("4. Check results in dataset/processed/ and models/ folders")
    print("\nFor multimodal fusion:")
    print("5. Use late_fusion.py to combine with text/DATscan models")
    print("="*60)

if __name__ == "__main__":
    main()