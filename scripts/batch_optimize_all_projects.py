import os
import subprocess
import shutil
import json
import time
from concurrent.futures import ThreadPoolExecutor

MAP = {
    'yesterday-backyard': 'HAF101-YESTERDAY BACKYARD (DONE)',
    'besarati-kynd-office': 'HAF103-BESARATI (Done)/Besarati & Kynd (Done)',
    'besarati-slowbar': 'HAF103-BESARATI (Done)/Besarati Slow bar (Done)',
    'daniel-s-room': 'HAF202-DANIEL_S ROOM (DONE)',
    'sporting-supply-co': 'HAF203-SPORTING SUPPLY CO (DONE)',
    'dave-s-residence': 'HAF205-DAVE_S RESIDENCE (Done)',
    'seek-office': 'HAF207-SEEK OFFICE (DONE)',
    'sonaa-cafe': 'HAF208-SONAA CAFE (DONE)',
    'toko-misteri': 'HAF209-TOKO MISTERI (DONE)',
    'zodiac': 'HAF210-ZODIAC (DONE)',
    'apple-condovilla': 'HAF211-APPLE CONDOVILLA',
    'better-goods': 'HAF214-BETTERGOODS (DONE)',
    'sideroom': 'HAF215-SIDEROOM (DONE)',
    'dickies': 'HAF218-DICKIES PURI INDAH MALL (DONE)',
    'salomon': 'HAF219-SALOMON PIM (DONE)',
    'dickies-central-gi': 'HAF221-DICKIES CENTRAL GI (DONE)',
    'the-goods-diner': 'HAF223-THE GOODS DINER (DONE)',
    '180spm-aeon-bsd': 'HAF224-180SPM AEON BSD (DONE)',
    'real-heavy': 'HAF225-REAL HEAVY (DONE)',
    'demie-bakmie-depok': 'HAF226-DEMIE BAKMIE DEPOK(DONE)',
    'demie-bakmie-blok-m': 'HAF227-DEMIE BAKMIE BLOK M (DONE)',
    'haf235-nasgero-scbd': 'HAF235 -  NASGERO SCBD',
    'haf242-kultura': 'HAF242-KULTURA',
    'masshiro': 'HAF308-MASSHIRO (DONE)',
    'j-germeister-booth': 'HAF309-JÄGERMEISTER BOOTH (DONE)',
    'j-germeister-x-ardneks': 'HAF325-JÄGERMEISTER X ARDNEKS (DONE)',
    'brightspot-foodpark': 'HAF327-BRIGHTSPOT FOODPARK (DONE)',
    'brightspot-agora': 'HAF332-BRIGHTSPOT AGORA (DONE)',
    'uss-24-dickies': 'HAF336-USS 2024 (DONE)/DICKIES (DONE)',
    'uss-24-saucony': 'HAF336-USS 2024 (DONE)/SAUCONY',
    'dickies-fw25': 'HAF339-DICKIES FW25 (DONE)',
    'saucony-aw25': 'HAF342-SAUCONY AW25 (DONE)',
    'dickies-photobox': 'HAF346-DICKIES PHOTOBOX (DONE)',
    'saucony-x-jd-id': 'HAF347 - SAUCONY x JD.ID (DONE)',
    'norda-seek-grand-indonesia': 'HAF349 - NORDA (DONE)/SEEK - GRAND INDONESIA',
    'norda-seek-plaza-senayan': 'HAF349 - NORDA (DONE)/SEEK - PLAZA SENAYAN',
    'saucony-ss26': 'HAF353 - SAUCONY SS26 (DONE)',
    'brightspot-agora-2025': 'HAF354 - BRIGHTSPOT AGORA 2025 (DONE)',
    'brightspot-agora-2026': 'HAF360 - BRIGHTSPOT AGORA 2026 (DONE)',
    'sosco-dinner-gathering-ss27': 'HAF364 - SOSCO DINNER GATHERING SS27 (DONE)'
}

BASE_ORIG = 'HAF WERKS (Projects images)'
BASE_WEB = 'web/public/images/projects'
BACKUP_DIR = '/home/stevejobs/web_projects_backup_before_batch'

def get_thumb(path):
    try:
        cmd = [
            'magick', path,
            '-background', 'white',
            '-flatten',
            '-auto-orient',
            '-resize', '32x32!',
            '-colorspace', 'sRGB',
            '-depth', '8',
            'rgb:-'
        ]
        res = subprocess.run(cmd, capture_output=True, timeout=10)
        if len(res.stdout) == 3072:
            return res.stdout
    except Exception:
        pass
    return None

def optimize_image(src_path, dest_path):
    is_png = dest_path.lower().endswith('.png')
    cmd = ['magick', src_path, '-auto-orient', '-resize', '2560x2560>']
    if is_png:
        cmd.extend(['-quality', '90', dest_path])
    else:
        cmd.extend(['-quality', '85', '-strip', '-interlace', 'Plane', dest_path])
    subprocess.run(cmd, check=True)

def process_project(slug, rel_orig):
    orig_dir = os.path.join(BASE_ORIG, rel_orig)
    web_dir = os.path.join(BASE_WEB, slug)
    
    if not os.path.isdir(orig_dir) or not os.path.isdir(web_dir):
        return {
            'slug': slug,
            'error': f'Directories missing (orig={os.path.isdir(orig_dir)}, web={os.path.isdir(web_dir)})'
        }
    
    # Collect candidate originals
    cand_files = []
    cand_videos = []
    for root, dirs, files in os.walk(orig_dir):
        if '.comments' in root:
            continue
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            fp = os.path.join(root, f)
            if ext in ('.jpg', '.jpeg', '.png', '.webp'):
                cand_files.append(fp)
            elif ext in ('.mp4', '.mov'):
                cand_videos.append(fp)

    # Collect web images
    web_images = []
    for f in sorted(os.listdir(web_dir)):
        ext = os.path.splitext(f)[1].lower()
        if ext in ('.jpg', '.jpeg', '.png'):
            web_images.append(f)
            
    if not web_images or not cand_files:
        return {
            'slug': slug,
            'web_count': len(web_images),
            'cand_count': len(cand_files),
            'matched': [],
            'unmatched': web_images,
            'videos': [os.path.basename(v) for v in cand_videos]
        }

    # Parallel thumbnail generation
    all_paths = [os.path.join(web_dir, f) for f in web_images] + cand_files
    thumbs = {}
    with ThreadPoolExecutor(max_workers=8) as ex:
        results = ex.map(lambda p: (p, get_thumb(p)), all_paths)
        for p, th in results:
            if th is not None:
                thumbs[p] = th

    # Match each web image to best candidate
    matched_results = []
    unmatched_files = []
    used_candidates = set()
    
    # Two-pass matching: first find best matches, resolving any contention
    matches = {}
    for w_name in web_images:
        w_path = os.path.join(web_dir, w_name)
        w_thumb = thumbs.get(w_path)
        if not w_thumb:
            unmatched_files.append(w_name)
            continue
            
        best_cand = None
        best_diff = float('inf')
        for c_path in cand_files:
            c_thumb = thumbs.get(c_path)
            if not c_thumb:
                continue
            diff = sum((b1 - b2)**2 for b1, b2 in zip(w_thumb, c_thumb))
            if diff < best_diff:
                best_diff = diff
                best_cand = c_path
                
        # Threshold: diff < 45000 is considered a genuine match
        if best_cand and best_diff < 45000:
            matches[w_name] = (best_cand, best_diff)
        else:
            unmatched_files.append(w_name)

    # Perform optimization and replacement for matched files
    for w_name, (cand_path, diff) in sorted(matches.items()):
        dest_path = os.path.join(web_dir, w_name)
        orig_sz_mb = os.path.getsize(cand_path) / (1024 * 1024)
        
        try:
            optimize_image(cand_path, dest_path)
            new_sz_kb = os.path.getsize(dest_path) / 1024
            dim_res = subprocess.run(['identify', '-format', '%wx%h', dest_path], capture_output=True, text=True)
            dim = dim_res.stdout.strip()
            
            matched_results.append({
                'slot': w_name,
                'orig_file': os.path.relpath(cand_path, orig_dir),
                'orig_size_mb': round(orig_sz_mb, 2),
                'new_size_kb': round(new_sz_kb, 1),
                'resolution': dim,
                'diff': diff
            })
            used_candidates.add(cand_path)
        except Exception as e:
            print(f'Error optimizing {cand_path} -> {dest_path}: {e}')
            unmatched_files.append(w_name)

    return {
        'slug': slug,
        'web_count': len(web_images),
        'cand_count': len(cand_files),
        'matched_count': len(matched_results),
        'matched': matched_results,
        'unmatched': unmatched_files,
        'videos': [os.path.relpath(v, orig_dir) for v in cand_videos]
    }

def main():
    start_time = time.time()
    print('Starting Master Batch Image Optimization for All Projects...')
    
    # 1. Backup existing web images
    if not os.path.exists(BACKUP_DIR):
        print(f'Creating full backup at {BACKUP_DIR}...')
        shutil.copytree(BASE_WEB, BACKUP_DIR)
        print('Backup complete.')
    else:
        print(f'Backup directory {BACKUP_DIR} already exists. Proceeding.')

    all_reports = []
    total_matched = 0
    total_unmatched = 0
    
    # Process each project sequentially (each project does parallel thumbnail processing)
    for idx, (slug, rel_orig) in enumerate(MAP.items(), 1):
        print(f'[{idx:02d}/{len(MAP)}] Processing {slug}...')
        p_start = time.time()
        report = process_project(slug, rel_orig)
        p_time = time.time() - p_start
        all_reports.append(report)
        
        m_cnt = report.get('matched_count', 0)
        u_cnt = len(report.get('unmatched', []))
        total_matched += m_cnt
        total_unmatched += u_cnt
        print(f' -> {slug}: {m_cnt} matched & optimized, {u_cnt} unmatched in {p_time:.1f}s')

    total_time = time.time() - start_time
    print(f'\nFinished all projects in {total_time:.1f}s!')
    print(f'Total matched & replaced: {total_matched}')
    print(f'Total unmatched: {total_unmatched}')

    # Save report
    with open('batch_optimization_report.json', 'w') as f:
        json.dump({
            'total_projects': len(MAP),
            'total_matched': total_matched,
            'total_unmatched': total_unmatched,
            'duration_seconds': round(total_time, 1),
            'projects': all_reports
        }, f, indent=2)
    print('Saved detailed report to batch_optimization_report.json')

if __name__ == '__main__':
    main()

