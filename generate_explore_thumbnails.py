import os
import json
import subprocess
from concurrent.futures import ProcessPoolExecutor

PUBLIC_DIR = 'web/public'
THUMB_DIR = 'web/public/images/thumbnails/explore'

def process_image(src_rel_path):
    # e.g. /images/projects/sonaa-cafe/01.webp or /images/projects/yesterday-backyard.webp
    clean_src = src_rel_path.lstrip('/')
    full_src = os.path.join(PUBLIC_DIR, clean_src)
    
    if not os.path.exists(full_src):
        # Maybe jpg or png
        base, _ = os.path.splitext(full_src)
        for ext in ['.jpg', '.jpeg', '.png', '.webp']:
            if os.path.exists(base + ext):
                full_src = base + ext
                break
        else:
            return src_rel_path, None

    # Destination path:
    # replace /images/projects with /images/thumbnails/explore
    if clean_src.startswith('images/projects/'):
        sub_path = clean_src[len('images/projects/'):]
    elif clean_src.startswith('images/'):
        sub_path = clean_src[len('images/'):]
    else:
        sub_path = clean_src
        
    # Force .webp extension
    sub_base, _ = os.path.splitext(sub_path)
    thumb_rel_path = f'/images/thumbnails/explore/{sub_base}.webp'
    full_dest = os.path.join(PUBLIC_DIR, thumb_rel_path.lstrip('/'))
    
    os.makedirs(os.path.dirname(full_dest), exist_ok=True)
    
    # Run magick if dest doesn't exist or is older
    if not os.path.exists(full_dest):
        try:
            # -thumbnail 420x -quality 65 -strip
            cmd = ['magick', full_src, '-thumbnail', '420x', '-quality', '65', '-strip', full_dest]
            subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        except Exception as e:
            return src_rel_path, None
            
    return src_rel_path, thumb_rel_path

def main():
    layout_file = 'web/src/content/explore-layout.json'
    with open(layout_file, 'r', encoding='utf-8') as f:
        layout_data = json.load(f)

    items = layout_data.get('items', [])
    unique_images = list({
        it['coverImageUrl'] for it in items 
        if it.get('coverImageUrl') and not it['coverImageUrl'].endswith(('.mp4', '.webm', '.gif'))
    })
    
    print(f'Generating micro-thumbnails for {len(unique_images)} unique images...')
    
    mapping = {}
    with ProcessPoolExecutor(max_workers=os.cpu_count() or 4) as executor:
        for orig, thumb in executor.map(process_image, unique_images):
            if thumb:
                mapping[orig] = thumb
                
    print(f'Successfully processed {len(mapping)} thumbnails.')
    
    # Update layout items
    updated_count = 0
    for it in items:
        orig = it.get('coverImageUrl')
        if orig in mapping:
            it['coverImageUrl'] = mapping[orig]
            updated_count += 1
            
    with open(layout_file, 'w', encoding='utf-8') as f:
        json.dump(layout_data, f, indent=2)
        
    print(f'Updated {updated_count} items in explore-layout.json with micro-thumbnail paths.')

if __name__ == '__main__':
    main()

