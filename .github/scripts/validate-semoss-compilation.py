#!/usr/bin/env python3
"""
Script to validate Java reactor compilation in SEMOSS
Creates temporary project, uploads code, compiles, then cleans up
@author: Patel, Parth

TODOS:
- Retry potentially? Error with invalid session
    - Log errors for sure
- Potentially - on merge to deployment/default branch, have a cd action to just build the zip (can also have action to run manually)
- Make python version an env var
- Semantic versioning - work on this
"""

import zipfile
import os
import requests
import base64
import subprocess
from datetime import datetime

# Total number of primary workflow steps (display-only constant)
TOTAL_STEPS = 8

def print_step_header(step_name, step_number=None, total_steps=None):
    """Print formatted step header with optional numbering.

    Args:
        step_name (str): Descriptive name of the step.
        step_number (int, optional): The ordinal position of the step.
            Positive numbers indicate workflow steps.
            Negative numbers indicate cleanup/teardown steps.
        total_steps (int, optional): Total number of steps for context.
    """
    print("=" * 60)
    if step_number is not None:
        if step_number < 0:
            # Cleanup/teardown step
            print(f"CLEANUP: {step_name}")
        elif total_steps is not None:
            print(f"STEP {step_number}/{total_steps}: {step_name}")
        else:
            print(f"STEP {step_number}: {step_name}")
    else:
        print(f"STEP: {step_name}")
    print("=" * 60)

def print_section_divider(title):
    """Print section divider"""
    print("=" * 60)
    print(title)
    print("=" * 60)

def print_pixel_output(result, show_detailed=False):
    """Print pixel execution output in a consistent format"""
    if not result:
        print("[WARN] No result returned")
        return
    
    if isinstance(result, dict) and 'pixelReturn' in result:
        pixel_return = result['pixelReturn'][0] if result['pixelReturn'] else {}
        output = pixel_return.get('output', 'No output')
        
        if show_detailed:
            # For compilation results - show with line numbers (no separate section)
            if isinstance(output, list):
                for i, line in enumerate(output, 1):
                    print(f"{i:3d}: {line}")
            else:
                print(f"Output: {output}")
        else:
            # For other pixels - just print the output
            if isinstance(output, list):
                for line in output:
                    print(f"[INFO] {line}")
            else:
                print(f"[INFO] {output}")
    else:
        print(f"[INFO] {result}")

def run_pixel_with_logging(server_connection, pixel, full_response=False, show_output=True):
    """Run pixel with logging and optional output display"""
    print(f"Running pixel: {pixel}")
    result = server_connection.run_pixel(pixel, full_response=full_response)
    
    if show_output:
        print_pixel_output(result)
    
    return result

def build_portals_if_needed():
    """Build portals using pnpm build in client folder if portals doesn't exist"""
    if not os.path.exists('portals'):
        print("[INFO] Portals folder not found, building from client...")
        
        if not os.path.exists('client'):
            print("[ERROR] Client folder not found - cannot build portals")
            return False
            
        try:
            # Run pnpm install first to ensure dependencies are installed
            print("[INFO] Running 'pnpm install' in client directory...")
            install_result = subprocess.run(
                ['pnpm', 'install'],
                cwd='client',
                timeout=300  # 5 minute timeout
            )
            
            if install_result.returncode != 0:
                print(f"[ERROR] pnpm install failed with return code {install_result.returncode}")
                return False
            
            print("[SUCCESS] Dependencies installed successfully")
            
            # Run pnpm build in client directory with live output
            print("[INFO] Running 'pnpm build' in client directory...")
            build_result = subprocess.run(
                ['pnpm', 'build'],
                cwd='client',
                timeout=300  # 5 minute timeout
            )
            
            if build_result.returncode == 0:
                print("[SUCCESS] Portals built successfully")
                return True
            else:
                print(f"[ERROR] pnpm build failed with return code {build_result.returncode}")
                return False
                
        except subprocess.TimeoutExpired:
            print("[ERROR] pnpm build timed out after 5 minutes")
            return False
        except FileNotFoundError:
            print("[ERROR] pnpm command not found - make sure pnpm is installed")
            return False
        except Exception as e:
            print(f"[ERROR] Failed to build portals: {e}")
            return False
    else:
        print("[INFO] Portals folder already exists")
        return True

def create_zip():
    """Create zip file with py, portals, java, client folders (Step 1)."""
    print_step_header("Creating Project Zip File", step_number=1, total_steps=TOTAL_STEPS)
    
    # Build portals if not present
    if not build_portals_if_needed():
        print("[ERROR] Failed to build portals - continuing without it")
    
    folders_to_zip = ['py', 'portals', 'java', 'client']
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    zip_filename = f"project_{timestamp}.zip"
    
    print(f"[INFO] Creating zip file: {zip_filename}")
    
    with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for folder in folders_to_zip:
            if os.path.exists(folder):
                print(f"[INFO] Adding folder: {folder}")
                for root, dirs, files in os.walk(folder):
                    # Skip node_modules directories
                    if 'node_modules' in dirs:
                        dirs.remove('node_modules')
                        print(f"[INFO] Skipping node_modules in {root}")
                    
                    for file in files:
                        file_path = os.path.join(root, file)
                        zipf.write(file_path)
            else:
                print(f"[WARN] Folder '{folder}' not found")
    
    # Get and print zip file size
    zip_size_bytes = os.path.getsize(zip_filename)
    zip_size_mb = zip_size_bytes / (1024 * 1024)
    print(f"[INFO] Zip file size: {zip_size_bytes:,} bytes ({zip_size_mb:.2f} MB)")
    
    print(f"[SUCCESS] Zip file created: {zip_filename}")
    return zip_filename

def setup_ai_server():
    """Setup AI Server connection (Step 2)."""
    print_step_header("Connecting to AI Server", step_number=2, total_steps=TOTAL_STEPS)
    
    try:
        from ai_server import ServerClient
        
        server_url = os.getenv('AI_SERVER_URL')
        access_key = os.getenv('ACCESS_KEY') 
        secret_key = os.getenv('SECRET_KEY')
        
        if not all([server_url, access_key, secret_key]):
            print("[ERROR] Missing environment variables:")
            print("        AI_SERVER_URL, ACCESS_KEY, SECRET_KEY")
            return None
        
        print("[INFO] Connecting to AI Server...")
        server_connection = ServerClient(
            base=server_url,
            access_key=access_key,
            secret_key=secret_key
        )
        
        print("[SUCCESS] Connected to AI Server")
        return server_connection
        
    except ImportError:
        print("[ERROR] ai-server-sdk not installed")
        return None
    except Exception as e:
        print(f"[ERROR] Failed to connect to AI Server: {e}")
        return None

def get_current_insight(server_connection):
    """
    Get current insight ID from server connection
    No pixel needed - uses existing connection insight
    Why: Need insight ID for all subsequent operations
    """
    print_step_header("Getting Current Insight", step_number=3, total_steps=TOTAL_STEPS)
    
    try:
        insight_id = server_connection.cur_insight
        print(f"[SUCCESS] Using insight: {insight_id}")
        return insight_id
    except Exception as e:
        print(f"[ERROR] Failed to get insight ID: {e}")
        return None

def create_temporary_project(server_connection):
    """
    Pixel: CreateProject(project=["Test-project-sep17"], portal=[true], projectType=["CODE"])
    Why: Create temporary project to test compilation without affecting existing projects
    """
    print_step_header("Creating Temporary Project", step_number=4, total_steps=TOTAL_STEPS)
    
    try:
        project_name = f"Test-project-{datetime.now().strftime('%b%d').lower()}"
        create_project_pixel = f'CreateProject(project=["{project_name}"], portal=[true], projectType=["CODE"]);'
        
        result = run_pixel_with_logging(server_connection, create_project_pixel, full_response=True)
        
        # Extract project ID from result
        if result and 'pixelReturn' in result:
            pixel_result = result['pixelReturn'][0]
            if 'output' in pixel_result and 'project_id' in pixel_result['output']:
                project_id = pixel_result['output']['project_id']
                print(f"[SUCCESS] Temporary project created: {project_id}")
                return project_id
        
        print("[ERROR] Could not extract project ID from CreateProject result")
        return None
        
    except Exception as e:
        print(f"[ERROR] Failed to create project: {e}")
        return None

def delete_existing_assets(server_connection, project_id):
    """
    Pixel: DeleteAsset(filePath=["version/assets/"], space=["project_id"])
    Why: Clear any existing assets before uploading new code
    """
    print_step_header("Deleting Existing Assets", step_number=5, total_steps=TOTAL_STEPS)
    
    try:
        delete_pixel = f'DeleteAsset(filePath=["version/assets/"], space=["{project_id}"]);'
        run_pixel_with_logging(server_connection, delete_pixel)
        print("[SUCCESS] Assets deletion completed")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to delete assets: {e}")
        return False

def upload_zip_file(server_connection, zip_filename, project_id):
    """
    HTTP Upload: /uploadFile/baseUpload
    Why: Upload project files to SEMOSS for compilation testing
    """
    print_step_header("Uploading Project Files", step_number=6, total_steps=TOTAL_STEPS)
    
    try:
        server_url = os.getenv('AI_SERVER_URL')
        access_key = os.getenv('ACCESS_KEY')
        secret_key = os.getenv('SECRET_KEY')
        insight_id = server_connection.cur_insight

        print(insight_id)
        
        if not all([server_url, access_key, secret_key, insight_id]):
            print("[ERROR] Missing required connection details for upload")
            return False
        
        upload_url = f"{server_url}/uploadFile/baseUpload?insightId={insight_id}&projectId={project_id}&path=version/assets/"
        print(f"[INFO] Uploading to: {upload_url}")
        
        # Use access_key:secret_key for basic auth
        encoded = base64.b64encode(f"{access_key}:{secret_key}".encode()).decode()
        
        with open(zip_filename, 'rb') as f:
            files = {'file': f}
            headers = {'Authorization': f'Basic {encoded}'}
            
            response = requests.post(upload_url, files=files, headers=headers, timeout=60)

            print(response.json())
        
        response.raise_for_status()
        upload_result = response.json()

        
        if upload_result and upload_result[0] and upload_result[0].get('fileLocation'):
            print("[SUCCESS] Upload completed")
            return True
        else:
            print("[ERROR] Upload failed: Invalid response")
            return False
            
    except Exception as e:
        print(f"[ERROR] Upload failed: {e}")
        return False

def unzip_main_project(server_connection, zip_filename, project_id):
    """
    Pixel: UnzipFile(filePath=["version/assets/project_timestamp.zip"], space=["project_id"])
    Why: Extract uploaded project files including java.zip
    """
    print_step_header("Unzipping Main Project File", step_number=7, total_steps=TOTAL_STEPS)
    
    try:
        file_location = f"version/assets/{os.path.basename(zip_filename)}"
        unzip_pixel = f'UnzipFile(filePath=["{file_location}"], space=["{project_id}"]);'
        run_pixel_with_logging(server_connection, unzip_pixel)
        print("[SUCCESS] Main project file unzipped")
        return True
    except Exception as e:
        print(f"[ERROR] Failed to unzip main project: {e}")
        return False

def compile_reactors(server_connection):
    """
    Pixel: CompileAppReactors()
    Why: Compile Java reactors and validate no compilation errors exist
    """
    print_step_header("Compiling App Reactors", step_number=8, total_steps=TOTAL_STEPS)
    
    try:
        compile_pixel = "CompileAppReactors();"
        result = run_pixel_with_logging(server_connection, compile_pixel, full_response=True, show_output=False)
        
        # Show detailed compilation output
        print_pixel_output(result, show_detailed=True)
        
        # Analyze results for errors
        if result and 'pixelReturn' in result:
            pixel_result = result['pixelReturn'][0]
            if 'output' in pixel_result:
                output = pixel_result['output']
                
                # Check for actual errors (not warnings)
                if isinstance(output, list):
                    error_found = False
                    warning_count = 0
                    mandatory_warning_count = 0
                    
                    for line in output:
                        if isinstance(line, str):
                            # Count warnings
                            if '[MANDATORY_WARNING]' in line:
                                mandatory_warning_count += 1
                            elif '[WARNING]' in line:
                                warning_count += 1
                            # Look for actual errors (not warnings)
                            elif 'ERROR' in line.upper() and 'WARNING' not in line.upper():
                                print(f"[ERROR] Compilation error found: {line}")
                                error_found = True
                    
                    print(f"[INFO] Summary: {mandatory_warning_count} mandatory warnings, {warning_count} warnings")
                    
                    if not error_found:
                        print("[SUCCESS] No compilation errors found")
                        return True
                    else:
                        print("[ERROR] Compilation errors detected")
                        return False
                else:
                    print("[SUCCESS] Compilation completed")
                    return True
        else:
            print("[WARN] No compilation output returned")
            return False
            
    except Exception as e:
        print(f"[ERROR] Compilation failed: {e}")
        return False

def cleanup_project(server_connection, project_id):
    """
    Pixel: DeleteProject(project=["project_id"])
    Why: Remove temporary project to avoid cluttering SEMOSS instance
    """
    print_step_header("Cleaning Up Temporary Project", step_number=-1)
    
    if not project_id:
        print("[INFO] No project to clean up")
        return True
        
    try:
        delete_project_pixel = f'DeleteProject(project=["{project_id}"]);'
        run_pixel_with_logging(server_connection, delete_project_pixel)
        print("[SUCCESS] Temporary project deleted")
        return True
    except Exception as cleanup_error:
        print(f"[WARN] Could not delete project: {cleanup_error}")
        return False

def cleanup_local_files(zip_filename):
    """Remove local zip file"""
    try:
        os.remove(zip_filename)
        print(f"[SUCCESS] Cleaned up local file: {zip_filename}")
    except:
        print(f"[WARN] Could not clean up: {zip_filename}")

def run_validation_workflow():
    """Execute the main validation workflow steps"""
    zip_filename = None
    project_id = None
    server_connection = None
    
    try:
        # Step 1: Create project zip
        zip_filename = create_zip()
        if not zip_filename:
            raise Exception("Failed to create zip file")
        
        # Step 2: Setup AI Server connection
        server_connection = setup_ai_server()
        if not server_connection:
            raise Exception("Failed to connect to AI Server")
        
        # Step 3: Get current insight
        insight_id = get_current_insight(server_connection)
        if not insight_id:
            raise Exception("Failed to get insight ID")
        
        # Step 4: Create temporary project
        project_id = create_temporary_project(server_connection)
        if not project_id:
            raise Exception("Failed to create temporary project")
        
        # Step 5: Delete existing assets
        if not delete_existing_assets(server_connection, project_id):
            raise Exception("Failed to delete existing assets")
        
        # Step 6: Upload zip file
        if not upload_zip_file(server_connection, zip_filename, project_id):
            raise Exception("Failed to upload zip file")
        
        # Step 7: Unzip main project
        if not unzip_main_project(server_connection, zip_filename, project_id):
            raise Exception("Failed to unzip main project")
        
        # Step 8: Compile reactors
        compilation_success = compile_reactors(server_connection)
        if not compilation_success:
            raise Exception("Compilation failed")

        return True

    except Exception as e:
        print(f"[ERROR] {e}")
        return False

    finally:
        # Always cleanup
        if server_connection and project_id:
            cleanup_project(server_connection, project_id)
        if zip_filename:
            cleanup_local_files(zip_filename)

def main():
    """Main compilation validation workflow"""
    print("[INFO] Starting compilation validation workflow")
    print("=" * 50)
    
    success = run_validation_workflow()
    
    print("=" * 50)
    if success:
        print("[SUCCESS] Compilation validation completed successfully")
        print("[INFO] All Java reactors compiled without errors")
    else:
        print("[ERROR] Compilation validation failed")
    
    return success

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)