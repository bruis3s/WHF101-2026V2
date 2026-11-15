import os
import shutil
import subprocess
import json
import re
from concurrent.futures import ThreadPoolExecutor

REPO_ROOT = '/home/stevejobs/001 - Kerjaan/002 - GABELN STUDIO/001 - CLIENT/006 - HAF WERKS/WHF101-2026-V2'
WEB_DIR = os.path.join(REPO_ROOT, 'web')
PROJECTS_DIR = os.path.join(WEB_DIR, 'public/images/projects')
THUMBNAILS_DIR = os.path.join(WEB_DIR, 'public/images/thumbnails/list')
CASE_STUDIES_JSON = os.path.join(WEB_DIR, 'src/content/case-studies.json')
ARCHIVE_JSON = os.path.join(WEB_DIR, 'src/content/archive.json')

def step1_backup_json():
    print('--- Step 1: Backing up JSON files ---')
    shutil.copyfile(CASE_STUDIES_JSON, CASE_STUDIES_JSON + '.bak')
    shutil.copyfile(ARCHIVE_JSON, ARCHIVE_JSON + '.bak')
    print('Backed up case-studies.json and archive.json')

def convert_image(jpg_path):
    webp_path = os.path.splitext(jpg_path)[0] + '.webp'
    try:
        # Convert with ImageMagick quality 85
        cmd = ['magick', jpg_path, '-quality', '85', webp_path]
        subprocess.run(cmd, check=True)
        if os.path.exists(webp_path) and os.path.getsize(webp_path) > 0:
            os.remove(jpg_path)
            return True, jpg_path, webp_path
        else:
            return False, jpg_path, 'Empty output'
    except Exception as e:
        return False, jpg_path, str(e)

def step2_convert_projects():
    print('\n--- Step 2: Converting JPEG images in web/public/images/projects to WebP (Q85) ---')
    jpg_files = []
    for root, dirs, files in os.walk(PROJECTS_DIR):
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in ('.jpg', '.jpeg'):
                jpg_files.append(os.path.join(root, f))

    print(f'Found {len(jpg_files)} JPEG images to convert.')

    success = 0
    failed = []
    with ThreadPoolExecutor(max_workers=8) as ex:
        results = ex.map(convert_image, jpg_files)
        for ok, src, dst in results:
            if ok:
                success += 1
            else:
                failed.append((src, dst))

    print(f'Converted {success} images successfully.')
    if failed:
        print(f'Failed to convert {len(failed)} images: {failed}')

def step3_cleanup_unused_png_thumbnails():
    print('\n--- Step 3: Cleaning up unreferenced PNG thumbnails in thumbnails/list ---')
    cleaned = 0
    freed_bytes = 0
    if os.path.exists(THUMBNAILS_DIR):
        for f in os.listdir(THUMBNAILS_DIR):
            if f.endswith('.png'):
                # Check if matching .webp exists
                webp_equiv = os.path.splitext(f)[0] + '.webp'
                webp_path = os.path.join(THUMBNAILS_DIR, webp_equiv)
                png_path = os.path.join(THUMBNAILS_DIR, f)
                if os.path.exists(webp_path):
                    freed_bytes += os.path.getsize(png_path)
                    os.remove(png_path)
                    cleaned += 1
    print(f'Removed {cleaned} unused PNG thumbnails, freed {freed_bytes / (1024*1024):.2f} MB')

def step4_update_json():
    print('\n--- Step 4: Updating image references in JSON files ---')
    # Update case-studies.json
    with open(CASE_STUDIES_JSON, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace .jpg and .jpeg in /images/projects/... paths
    new_content = re.sub(r'(/images/projects/[^\"\'\s]+)\.(jpg|jpeg)', r'\1.webp', content)
    
    with open(CASE_STUDIES_JSON, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f'Updated case-studies.json (changed {len(re.findall(r"\.webp", new_content)) - len(re.findall(r"\.webp", content))} references)')

    # Update archive.json
    with open(ARCHIVE_JSON, 'r', encoding='utf-8') as f:
        arch_content = f.read()
    new_arch = re.sub(r'(/images/projects/[^\"\'\s]+)\.(jpg|jpeg)', r'\1.webp', arch_content)
    with open(ARCHIVE_JSON, 'w', encoding='utf-8') as f:
        f.write(new_arch)
    print('Updated archive.json')

def step5_verify():
    print('\n--- Step 5: Verification of all references on disk ---')
    with open(CASE_STUDIES_JSON, 'r') as f:
        data = json.load(f)

    missing = []
    total_refs = 0
    for cs in data:
        cover = cs.get('coverImageUrl')
        if cover and cover.startswith('/images/'):
            total_refs += 1
            if not os.path.exists(os.path.join(WEB_DIR, 'public', cover.lstrip('/'))):
                missing.append((cs['slug'], 'cover', cover))

        for row in cs.get('layoutRows', []):
            for col in row.get('columns', []):
                for key in ('image', 'video'):
                    src = col.get(key)
                    if src and src.startswith('/images/'):
                        total_refs += 1
                        disk_path = os.path.join(WEB_DIR, 'public', src.lstrip('/'))
                        if not os.path.exists(disk_path):
                            missing.append((cs['slug'], key, src))

    print(f'Checked {total_refs} media references in case-studies.json.')
    if missing:
        print(f'WARNING: {len(missing)} missing files found:')
        for m in missing[:10]:
            print(f'  {m}')
    else:
        print('SUCCESS: 100% of media references exist on disk!')

if __name__ == '__main__':
    step1_backup_json()
    step2_convert_projects()
    step3_cleanup_unused_png_thumbnails()
    step4_update_json()
    step5_verify()

