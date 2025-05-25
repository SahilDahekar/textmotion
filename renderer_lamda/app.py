import os
import subprocess
import uuid
import boto3
from io import BytesIO
import json
import re
from boto3.s3.transfer import S3UploadFailedError
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    body = json.loads(event.get('body', '{}'))
    python_code = body.get('python_code')
    filename = body.get('filename')
    project_name = body.get('project_name')
    id = body.get('id', str(uuid.uuid4()))
    s3_bucket_name = os.environ.get('S3_BUCKET_NAME')
    bucket_region = 'ap-south-1'
    s3_config = boto3.session.Config(signature_version='s3v4')

    if not python_code:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Missing "python_code" in event body'})
        }

    if not s3_bucket_name:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'S3_BUCKET_NAME environment variable is not configured.'})
        }

    tmp_dir = "/tmp"
    job_tmp_dir = os.path.join(tmp_dir, id)
    os.makedirs(job_tmp_dir, exist_ok=True)

    code_file_path = os.path.join(job_tmp_dir, "scene.py")
    manim_output_filename = f"{filename}.mp4"
    s3_object_key = f"{id}/{project_name}/{manim_output_filename}"

    # Extract the class name from the Manim code
    class_match = re.search(r'class\s+(\w+)', python_code)
    if not class_match:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'No class found in provided Python code'})
        }

    class_name = class_match.group(1)

    session = boto3.session.Session()
    s3_client = session.client('s3', region_name=bucket_region, config=s3_config)

    try:
        with open(code_file_path, "w") as f:
            f.write(python_code)
    except IOError as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f'Failed to write Manim code file: {e}'})
        }

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
                    'stdout': result.stdout,
                    'returncode': result.returncode
                })
            }

        # Locate the generated .mp4 file
        found_mp4_path = None
        search_base_dir = os.path.join(job_tmp_dir, "videos")

        if os.path.exists(search_base_dir):
            for root, dirs, files in os.walk(search_base_dir):
                for file in files:
                    if file == manim_output_filename:
                        found_mp4_path = os.path.join(root, file)
                        break
                if found_mp4_path:
                    break

        if not found_mp4_path or not os.path.exists(found_mp4_path):
            debug_info = {}
            try:
                if os.path.exists(search_base_dir):
                    debug_info['search_dir_contents'] = [
                        os.path.join(r, f)
                        for r, d, fs in os.walk(search_base_dir)
                        for f in fs
                    ]
                else:
                    debug_info['search_base_dir_exists'] = False
                debug_info['job_tmp_contents'] = os.listdir(job_tmp_dir)
            except Exception as debug_err:
                debug_info['debug_error'] = str(debug_err)

            return {
                'statusCode': 500,
                'body': json.dumps({
                    'error': f'Output file "{manim_output_filename}" not found after Manim run.',
                    'stderr': result.stderr,
                    'stdout': result.stdout,
                    'debug': debug_info
                })
            }

        file_size = os.path.getsize(found_mp4_path)
        if file_size == 0:
            return {
                'statusCode': 500,
                'body': json.dumps({
                    'error': f'Output file {found_mp4_path} is empty (Manim render likely failed)',
                    'stderr': result.stderr,
                    'stdout': result.stdout
                })
            }

        # Upload to S3 via presigned URL (fallback to direct upload)
        try:
            try:
                presigned_url = s3_client.generate_presigned_url(
                    'put_object',
                    Params={
                        'Bucket': s3_bucket_name,
                        'Key': s3_object_key,
                        'ContentType': 'video/mp4'
                    },
                    ExpiresIn=300
                )

                import requests
                with open(found_mp4_path, 'rb') as file_data:
                    response = requests.put(
                        presigned_url,
                        data=file_data,
                        headers={'Content-Type': 'video/mp4'}
                    )
                    if response.status_code != 200:
                        raise Exception(f"Presigned URL upload failed with status {response.status_code}: {response.text}")

            except Exception as presigned_err:
                # Fallback: use direct upload
                with open(found_mp4_path, 'rb') as file_data:
                    s3_client.put_object(
                        Body=file_data,
                        Bucket=s3_bucket_name,
                        Key=s3_object_key,
                        ContentType='video/mp4'
                    )

            # ✅ Generate a presigned URL for downloading the video
            try:
                presigned_download_url = s3_client.generate_presigned_url(
                    'get_object',
                    Params={'Bucket': s3_bucket_name, 'Key': s3_object_key},
                    ExpiresIn=3600  # 1 hour
                )
            except Exception as presigned_download_err:
                presigned_download_url = None

            # Clean up
            try:
                os.remove(found_mp4_path)
            except OSError:
                pass
            try:
                import shutil
                shutil.rmtree(job_tmp_dir)
            except OSError:
                pass

        except ClientError as e:
            error_message = str(e)
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')

            diagnostics = {
                'error_code': error_code,
                'error_message': error_message,
                's3_bucket': s3_bucket_name,
                's3_key': s3_object_key,
                'file_size': file_size,
                'error_response': e.response
            }

            try:
                sts_client = boto3.client('sts')
                account_info = sts_client.get_caller_identity()
                diagnostics['account_id'] = account_info.get('Account')
                diagnostics['caller_arn'] = account_info.get('Arn')
            except Exception as sts_err:
                diagnostics['sts_error'] = str(sts_err)

            return {
                'statusCode': 500,
                'body': json.dumps({
                    'error': f'S3 upload failed: {error_message}',
                    'diagnostics': diagnostics,
                    'manim_stderr': result.stderr,
                    'manim_stdout': result.stdout
                })
            }

        return {
            'statusCode': 200,
            'body': json.dumps({
                'id': f"{id}_{filename}",
                'message': 'Successfully generated video and uploaded to S3',
                's3_bucket': s3_bucket_name,
                's3_key': s3_object_key,
                'class_name': class_name,
                'video_url': presigned_download_url  # ✅ Included in response
            })
        }

    except Exception as e:
        import traceback
        traceback_str = traceback.format_exc()
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': f'An unexpected error occurred: {str(e)}',
                'traceback': traceback_str
            })
        }
