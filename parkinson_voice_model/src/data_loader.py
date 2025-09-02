import os
import pandas as pd
import numpy as np
from glob import glob
from tqdm import tqdm
from config import Config


class DatasetLoader:
    """Handles loading and organizing audio files from both datasets"""
    
    def __init__(self):
        self.config = Config()
    
    def recursive_directory_explorer(self, path, depth=0, max_depth=10):
        """Recursively explore directory structure and count .wav files"""
        indent = "  " * depth
        
        if depth > max_depth:
            print(f"{indent}... (max depth reached)")
            return 0
        
        if not os.path.exists(path):
            print(f"{indent}❌ Path not found")
            return 0
        
        if not os.path.isdir(path):
            return 0
        
        total_wav_files = 0
        
        try:
            items = os.listdir(path)
            
            # Count .wav files in current directory
            wav_files = [f for f in items if f.endswith('.wav')]
            wav_count = len(wav_files)
            
            # Get subdirectories
            subdirs = [f for f in items if os.path.isdir(os.path.join(path, f))]
            
            # Print current directory info
            dir_name = os.path.basename(path) if os.path.basename(path) else path
            if wav_count > 0:
                print(f"{indent}📁 {dir_name}/ -> {wav_count} .wav files")
                total_wav_files += wav_count
            else:
                print(f"{indent}📁 {dir_name}/")
            
            # Show some example .wav files if present
            if wav_count > 0 and depth < 4:  # Only show examples for first few levels
                sample_files = wav_files[:3]  # Show first 3 files
                for sample_file in sample_files:
                    print(f"{indent}  📄 {sample_file}")
                if wav_count > 3:
                    print(f"{indent}  📄 ... and {wav_count - 3} more files")
            
            # Recursively explore subdirectories
            for subdir in sorted(subdirs):
                subdir_path = os.path.join(path, subdir)
                subdir_wav_count = self.recursive_directory_explorer(subdir_path, depth + 1, max_depth)
                total_wav_files += subdir_wav_count
                
        except PermissionError:
            print(f"{indent}❌ Permission denied")
        except Exception as e:
            print(f"{indent}❌ Error accessing directory: {str(e)}")
        
        return total_wav_files
        
    def debug_dataset_structure(self):
        """Debug and show actual dataset structure with full recursion"""
        print("="*60)
        print("DEBUGGING DATASET STRUCTURE (RECURSIVE)")
        print("="*60)
        
        # Check A-sound dataset
        print("\n1. A-SOUND DATASET:")
        print("-" * 30)
        a_sound_base = self.config.A_SOUND_PATH
        print(f"Base path: {a_sound_base}")
        
        if os.path.exists(a_sound_base):
            total_a_sound_wav = self.recursive_directory_explorer(a_sound_base)
            print(f"Total .wav files in A-sound dataset: {total_a_sound_wav}")
        else:
            print("❌ A-sound dataset path not found!")
        
        # Check Italian dataset
        print("\n2. ITALIAN DATASET:")
        print("-" * 30)
        italian_base = self.config.ITALIAN_PATH
        print(f"Base path: {italian_base}")
        
        if os.path.exists(italian_base):
            total_italian_wav = self.recursive_directory_explorer(italian_base)
            print(f"Total .wav files in Italian dataset: {total_italian_wav}")
        else:
            print("❌ Italian dataset path not found!")
        
        # Detailed look at PwPD folder specifically
        print("\n3. DETAILED PwPD STRUCTURE:")
        print("-" * 30)
        pwpd_path = os.path.join(self.config.ITALIAN_PATH, "PwPD")
        if os.path.exists(pwpd_path):
            total_pwpd_wav = self.recursive_directory_explorer(pwpd_path)
            print(f"Total .wav files in PwPD folder: {total_pwpd_wav}")
        else:
            print("❌ PwPD folder not found!")
        
        print("\n" + "="*60)
    
    def load_a_sound_dataset(self):
        """Load /a/ sound dataset"""
        print("Loading /a/ sound dataset...")
        
        file_list = []
        
        # Healthy Controls
        hc_path = os.path.join(self.config.A_SOUND_PATH, "HC_AH")
        if os.path.exists(hc_path):
            hc_files = glob(os.path.join(hc_path, "*.wav"))
            for file_path in hc_files:
                file_list.append({
                    'file_path': file_path,
                    'label': 0,  # Healthy = 0
                    'subject_group': 'HC_AH',
                    'audio_type': 'vowel_a',
                    'source_dataset': 'a_sound',
                    'file_name': os.path.basename(file_path)
                })
        
        # Parkinson's Disease - Try multiple possible folder names
        pd_possible_names = ["PD_AH", "PD", "pd", "Parkinson", "parkinson"]
        pd_files_found = []
        
        for pd_name in pd_possible_names:
            pd_path = os.path.join(self.config.A_SOUND_PATH, pd_name)
            if os.path.exists(pd_path):
                print(f"✅ Found PD folder: {pd_name}")
                pd_files = glob(os.path.join(pd_path, "*.wav"))
                for file_path in pd_files:
                    file_list.append({
                        'file_path': file_path,
                        'label': 1,  # PD = 1
                        'subject_group': f'PD_{pd_name}',
                        'audio_type': 'vowel_a',
                        'source_dataset': 'a_sound',
                        'file_name': os.path.basename(file_path)
                    })
                pd_files_found.extend(pd_files)
                break
        
        if not pd_files_found:
            print("⚠️  WARNING: No PD files found in A-sound dataset!")
            print("Checked folders:", pd_possible_names)
        
        print(f"Loaded {len([f for f in file_list if f['label'] == 0])} healthy controls")
        print(f"Loaded {len([f for f in file_list if f['label'] == 1])} PD patients")
        
        return file_list
    
    def find_wav_files_recursive(self, base_path, audio_type_prefix="unknown"):
        """Recursively find all .wav files in a directory structure"""
        wav_files_info = []
        
        for root, dirs, files in os.walk(base_path):
            wav_files = [f for f in files if f.endswith('.wav')]
            
            for wav_file in wav_files:
                full_path = os.path.join(root, wav_file)
                
                # Determine audio type from path structure
                rel_path = os.path.relpath(root, base_path)
                path_parts = rel_path.split(os.sep)
                
                # Create more descriptive audio type
                audio_type = audio_type_prefix
                if len(path_parts) >= 1 and path_parts[0] != '.':
                    audio_type += f"_{path_parts[-1].lower()}"  # Use the deepest folder name
                
                wav_files_info.append({
                    'full_path': full_path,
                    'relative_path': rel_path,
                    'audio_type': audio_type,
                    'filename': wav_file,
                    'folder_structure': path_parts
                })
        
        return wav_files_info
    
    def load_italian_dataset(self):
        """Load Italian dataset with enhanced recursive search"""
        print("Loading Italian dataset...")
        
        file_list = []
        
        # 1. Elderly Healthy Controls (EHC)
        ehc_path = os.path.join(self.config.ITALIAN_PATH, "EHC")
        if os.path.exists(ehc_path):
            print(f"Searching EHC folder recursively...")
            ehc_files = self.find_wav_files_recursive(ehc_path, "ehc")
            
            for file_info in ehc_files:
                file_list.append({
                    'file_path': file_info['full_path'],
                    'label': 0,  # Healthy = 0
                    'subject_group': 'EHC',
                    'audio_type': file_info['audio_type'],
                    'source_dataset': 'italian',
                    'file_name': file_info['filename']
                })
        
        # 2. Young Healthy Controls (YHC)
        yhc_path = os.path.join(self.config.ITALIAN_PATH, "YHC")
        if os.path.exists(yhc_path):
            print(f"Searching YHC folder recursively...")
            yhc_files = self.find_wav_files_recursive(yhc_path, "yhc")
            
            for file_info in yhc_files:
                file_list.append({
                    'file_path': file_info['full_path'],
                    'label': 0,  # Healthy = 0
                    'subject_group': 'YHC',
                    'audio_type': file_info['audio_type'],
                    'source_dataset': 'italian',
                    'file_name': file_info['filename']
                })
        
        # 3. People with Parkinson's Disease (PwPD) - Enhanced recursive search
        pwpd_path = os.path.join(self.config.ITALIAN_PATH, "PwPD")
        
        if os.path.exists(pwpd_path):
            print(f"✅ Found PwPD folder - searching recursively...")
            pwpd_files = self.find_wav_files_recursive(pwpd_path, "pwpd")
            
            for file_info in pwpd_files:
                # Determine patient group from folder structure
                folder_parts = file_info['folder_structure']
                subject_group = 'PwPD_unknown'
                
                if len(folder_parts) >= 1:
                    # First part should be the patient group (1-5, 6-10, etc.)
                    patient_group = folder_parts[0]
                    subject_group = f'PwPD_{patient_group}'
                
                file_list.append({
                    'file_path': file_info['full_path'],
                    'label': 1,  # PD = 1
                    'subject_group': subject_group,
                    'audio_type': file_info['audio_type'],
                    'source_dataset': 'italian',
                    'file_name': file_info['filename']
                })
            
            if pwpd_files:
                print(f"✅ Found {len(pwpd_files)} PD files in PwPD folder!")
            else:
                print("⚠️  No .wav files found in PwPD folder structure")
        else:
            print("⚠️  WARNING: No PwPD folder found!")
        
        italian_healthy = len([f for f in file_list if f['label'] == 0])
        italian_pd = len([f for f in file_list if f['label'] == 1])
        
        print(f"Loaded {italian_healthy} Italian healthy controls")
        print(f"Loaded {italian_pd} Italian PD patients")
        
        return file_list
    
    def load_all_datasets(self):
        """Load both datasets and combine them"""
        print("="*50)
        print("LOADING ALL DATASETS")
        print("="*50)
        
        # First, debug the structure
        self.debug_dataset_structure()
        
        # Load individual datasets
        a_sound_files = self.load_a_sound_dataset()
        italian_files = self.load_italian_dataset()
        
        # Combine all files
        all_files = a_sound_files + italian_files
        
        # Convert to DataFrame
        df = pd.DataFrame(all_files)
        
        print("\n" + "="*50)
        print("DATASET SUMMARY")
        print("="*50)
        print(f"Total files: {len(df)}")
        
        if len(df) > 0:
            print(f"Healthy controls: {len(df[df['label'] == 0])}")
            print(f"PD patients: {len(df[df['label'] == 1])}")
            print(f"\nBy source dataset:")
            print(df['source_dataset'].value_counts())
            print(f"\nBy audio type:")
            print(df['audio_type'].value_counts())
            
            # Check for class imbalance
            if len(df[df['label'] == 1]) == 0:
                print("\n❌ CRITICAL ERROR: No PD patients found!")
                print("Please check your dataset structure and ensure PD files are present.")
                return None
            elif len(df[df['label'] == 0]) == 0:
                print("\n❌ CRITICAL ERROR: No healthy controls found!")
                return None
        else:
            print("❌ No files loaded!")
            return None
        
        return df
    
    def save_file_list(self, df, filename="file_list.csv"):
        """Save the file list to processed folder"""
        if df is None:
            print("Cannot save - no data loaded")
            return None
            
        os.makedirs(self.config.PROCESSED_PATH, exist_ok=True)
        filepath = os.path.join(self.config.PROCESSED_PATH, filename)
        df.to_csv(filepath, index=False)
        print(f"\nFile list saved to: {filepath}")
        return filepath


if __name__ == "__main__":
    # Test the data loader
    loader = DatasetLoader()
    df = loader.load_all_datasets()
    if df is not None:
        loader.save_file_list(df)