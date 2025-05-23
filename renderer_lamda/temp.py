import os
import subprocess
import uuid
import boto3
import json
from botocore.exceptions import ClientError
import shutil
import re

def lambda_handler(event, context):
    python_code = event.get('python_code')
    job_id = event.get('id', str(uuid.uuid4()))
    s3_bucket_name = os.environ.get('S3_BUCKET_NAME')
    
    if not python_code:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Missing "python_code" in event body'})
        }
    
    
    class_match = re.search(r'class\s+(\w+)', python_code)
    if not class_match:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'No class found in provided Python code'})
        }
    
    class_name = class_match.group(1)
    
    
    job_tmp_dir = os.path.join("/tmp", job_id)
    os.makedirs(job_tmp_dir, exist_ok=True)
    
    
    code_file_path = os.path.join(job_tmp_dir, "scene.py")
    with open(code_file_path, "w") as f:
        f.write(python_code)
    
    
    manim_output_filename = f"{job_id}.mp4"
    s3_object_key = f"manim-videos/{job_id}/{manim_output_filename}"
    
    try:
        
        manim_command = [
            "manim",
            code_file_path,
            class_name,
            "-o", manim_output_filename,
            "--media_dir", job_tmp_dir,
            "--quality", "l",
            "--disable_caching"
        ]
        
        result = subprocess.run(manim_command, capture_output=True, text=True)
        
        if result.returncode != 0:
            return {
                'statusCode': 500,
                'body': json.dumps({
                    'error': 'Manim execution failed',
                    'stderr': result.stderr,
                    'stdout': result.stdout
                })
            }
        
        
        search_base_dir = os.path.join(job_tmp_dir, "videos")
        found_mp4_path = None
        
        for root, _, files in os.walk(search_base_dir):
            for file in files:
                if file == manim_output_filename:
                    found_mp4_path = os.path.join(root, file)
                    break
            if found_mp4_path:
                break
        
        if not found_mp4_path or os.path.getsize(found_mp4_path) == 0:
            return {
                'statusCode': 500,
                'body': json.dumps({
                    'error': 'Output video file not found or empty',
                    'stderr': result.stderr,
                    'stdout': result.stdout
                })
            }
        
        
        s3_client = boto3.client('s3')
        with open(found_mp4_path, 'rb') as file_data:
            s3_client.put_object(
                Body=file_data,
                Bucket=s3_bucket_name,
                Key=s3_object_key,
                ContentType='video/mp4'
            )
        
        
        shutil.rmtree(job_tmp_dir, ignore_errors=True)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'id': job_id,
                'message': 'Successfully generated video and uploaded to S3',
                's3_bucket': s3_bucket_name,
                's3_key': s3_object_key,
                'class_name': class_name  
            })
        }
        
    except Exception as e:
        import traceback
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': f'An unexpected error occurred: {str(e)}',
                'traceback': traceback.format_exc()
            })
        }