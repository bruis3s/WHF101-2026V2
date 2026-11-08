import os
import re
import json
import base64
import struct

EXPLICIT_MAP = {
    'yesterday-backyard': 'Yesterday backyard desktop-export.html',
    'besarati-kynd-office': 'besarati-kyndoffice-desktop-export.html',
    'daniel-s-room': "daniels room desktop-export.html",
    'sporting-supply-co': 'Sporting supply co desktop-export.html',
    'dave-s-residence': "dave's residence desktop-export.html",
    'seek-office': 'seek office desktop-export.html',
    'sonaa-cafe': 'sonaa cafe desktop-export.html',
    'toko-misteri': 'toko misteri desktop-export.html',
    'zodiac': 'zodiac desktop-export.html',
    'apple-condovilla': 'Apple Condovilla-dekstop-export.html',
    'better-goods': 'Better goods desktop-export.html',
    'sideroom': 'Sideroom desktop-export.html',
    'dickies': 'dickies desktop-export.html',
    'salomon': 'Salomon desktop-export.html',
    'dickies-central-gi': 'Dickies central GI desktop-export.html',
    'real-heavy': 'real-heavy-dekstop-export.html',
    'demie-bakmie-depok': 'demie-bakmie-depok-desktop-export.html',
    'demie-bakmie-blok-m': 'demie-bakmie-blok-m-desktop-export.html',
    'masshiro': 'masshiro desktop-export.html',
    'j-germeister-booth': 'jager meister booth desktop-export.html',
    'j-germeister-x-ardneks': 'Jagermeisterxardneks desktop-export.html',
    'brightspot-foodpark': 'brightspot foodpark desktop-export.html',
    'brightspot-agora': 'brightspot agora desktop-export.html',
    'uss-24-dickies': 'uss24dickies desktop-export.html',
    'uss-24-saucony': 'uss24saucony desktop-export.html',
    'dickies-fw25': 'dickiesfw25 desktop-export.html',
    'dickies-photobox': 'Dickies Photobox desktop-export.html',
    'saucony-x-jd-id': 'sauconyxjdid desktop-export.html',
    'norda-seek-grand-indonesia': 'norda-seek-grandindonesia-desktop-export.html',
    'norda-seek-plaza-senayan': 'norda-seek-plazasenayan-desktop-export.html',
    'saucony-ss26': 'saucony-ss26-desktop-export.html',
    'brightspot-agora-2025': 'brightspot-agora-2025-desktop-export.html',
    'besarati-slowbar': 'besarati slowbar desktop-export.html',
}

def get_image_size(data):
    if data.startswith(b'\xff\xd8'):
        idx = 2
        while idx < len(data):
            marker, length = struct.unpack('>2sH', data[idx:idx+4])
            if marker in (b'\xff\xc0', b'\xff\xc2'):
                h, w = struct.unpack('>HH', data[idx+5:idx+9])
                return w, h
            idx += 2 + length
    elif data.startswith(b'\x89PNG\r\n\x1a\n'):
        w, h = struct.unpack('>II', data[16:24])
        return w, h
    return None, None

def process_single(slug, filename, project_meta):
    filepath = os.path.join('static-site-design/prototypes/case-study/desktop', filename)
    if not os.path.exists(filepath) or os.path.getsize(filepath) == 0:
        print(f'Skipping {slug}: file not found or empty ({filename})')
        return None

    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        html = f.read()

    web_dir = f'web/public/images/projects/{slug}'
    static_dir = f'static-site-design/assets/images/projects/{slug}'
    os.makedirs(web_dir, exist_ok=True)
    os.makedirs(static_dir, exist_ok=True)

    # Determine canvas width
    canvas_w = 3107.0
    body_idx = html.find('<body')
    if body_idx != -1:
        body_snippet = html[body_idx:body_idx+2000]
        w_match = re.search(r'data-pencil-name=\"[^\"]*\"[^>]*style=\"[^\"]*width:\s*([\d\.]+)px', body_snippet)
        if w_match:
            canvas_w = float(w_match.group(1))

    # Locate z-index: 1 container
    z1_match = re.search(r'<div[^>]*z-index:\s*1[^>]*>', html)
    if not z1_match:
        print(f'Warning: No z-index: 1 container found for {slug}')
        return None

    start_pos = z1_match.end()
    depth = 1
    children = []
    child_start = start_pos

    for m in re.finditer(r'<(/?)div', html[start_pos:]):
        is_closing = m.group(1) == '/'
        tag_pos = start_pos + m.start()
        if is_closing:
            depth -= 1
            if depth == 1:
                children.append(html[child_start:tag_pos+6])
                child_start = tag_pos + 6
            elif depth == 0:
                break
        else:
            if depth == 1:
                child_start = tag_pos
            depth += 1

    img_counter = 0
    layout_rows = []

    for child in children:
        col_matches = list(re.finditer(r'<div[^>]*data-pencil-name=\"img\"[^>]*style=\"([^\"]+)\"', child))
        if not col_matches:
            continue

        columns = []
        is_hero_row = (len(layout_rows) == 0 and len(col_matches) == 1)
        row_id = 'row-hero' if is_hero_row else f'row-{len(layout_rows):02d}'

        row_jc = 'flex-start'
        if 'justify-content: space-between' in child:
            row_jc = 'space-between'
        elif 'justify-content: flex-end' in child or 'align-items: flex-end' in child:
            row_jc = 'flex-end'
        elif 'justify-content: center' in child:
            row_jc = 'center'

        row_gap = '30px' if len(col_matches) > 1 else '0px'
        gap_m = re.search(r'gap:\s*([\d\.]+)px', child)
        if gap_m:
            gap_val = float(gap_m.group(1))
            if gap_val > 15:
                row_gap = '30px'

        for ci, col_m in enumerate(col_matches):
            img_counter += 1
            img_name = f'{img_counter:02d}.jpg'
            style = col_m.group(1)

            # Extract image bytes
            url_m = re.search(r'url\([\"\']?(data:image/[^;]+;base64,[^\"\')]+)', style)
            if url_m:
                b64 = url_m.group(1).split(',', 1)[1]
                raw = base64.b64decode(b64)
                with open(os.path.join(web_dir, img_name), 'wb') as fp:
                    fp.write(raw)
                with open(os.path.join(static_dir, img_name), 'wb') as fp:
                    fp.write(raw)
            else:
                # If image is an external URL, record it or use placeholder
                pass

            w_m = re.search(r'width:\s*([\d\.]+)px', style)
            h_m = re.search(r'height:\s*([\d\.]+)px', style)
            w_px = float(w_m.group(1)) if w_m else 1000.0
            h_px = float(h_m.group(1)) if h_m else 1000.0

            ratio = w_px / h_px if h_px > 0 else 1.5
            aspect = '3 / 2' if ratio > 1.2 else ('2 / 3' if ratio < 0.8 else '1 / 1')

            if is_hero_row:
                pct = 100
            else:
                raw_pct = (w_px / canvas_w) * 100
                std_pcts = [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 100]
                pct = min(std_pcts, key=lambda x: abs(x - raw_pct))

            img_pos = col_m.start()
            col_context = child[max(0, img_pos-300):img_pos]
            valign = 'flex-start'
            if 'justify-content: flex-end' in col_context or 'align-items: flex-end' in col_context:
                valign = 'flex-end'

            col_obj = {
                'image': f'/images/projects/{slug}/{img_name}',
                'widthPercent': pct,
                'fit': 'cover'
            }
            if not is_hero_row:
                col_obj['aspectRatio'] = aspect
                col_obj['verticalAlign'] = valign
            else:
                col_obj['priority'] = True

            columns.append(col_obj)

        row_obj = {
            'id': row_id,
            'sectionHeight': '100vh',
            'sizingMode': 'cover',
            'gap': '0px' if is_hero_row else row_gap,
            'justifyContent': 'center' if is_hero_row else row_jc,
            'columns': columns
        }
        if is_hero_row:
            row_obj['verticalAlign'] = 'center'

        layout_rows.append(row_obj)

    specs = [
        {'label': 'Project', 'value': project_meta.get('title', slug)},
        {'label': 'Type', 'value': project_meta.get('category', 'Architecture')},
        {'label': 'Location', 'value': project_meta.get('location', 'Jakarta')},
        {'label': 'Status', 'value': project_meta.get('year', project_meta.get('status', 'Completed'))}
    ]

    cs_entry = {
        'slug': slug,
        'code': project_meta.get('code', 'HAF_101'),
        'title': project_meta.get('title', slug),
        'subtitle': project_meta.get('subtitle', f"{project_meta.get('title', slug)} by HAF WERKS"),
        'projectType': project_meta.get('category', 'Architecture'),
        'category': project_meta.get('category', 'Architecture'),
        'year': project_meta.get('year', '2026'),
        'location': project_meta.get('location', 'Jakarta'),
        'status': project_meta.get('status', 'Completed'),
        'coverImageUrl': f'/images/projects/{slug}/01.jpg',
        'specs': specs,
        'layoutRows': layout_rows
    }
    return cs_entry

def main():
    with open('web/src/content/projects.json') as f:
        projects = json.load(f)
    projects_by_slug = {p['slug']: p for p in projects}

    with open('web/src/content/case-studies.json') as f:
        case_studies = json.load(f)
    existing_cs_map = {cs['slug']: cs for cs in case_studies}

    # Slugs to keep unmodified (they were hand-crafted/verified earlier)
    protected_slugs = {'circular-modular-bench', 'brightspot-agora-2026', 'sosco-dinner-gathering-ss27', 'guess'}

    updated_cs_list = []
    # Retain circular-modular-bench, brightspot-agora-2026, sosco-dinner-gathering-ss27 as-is
    for cs in case_studies:
        if cs['slug'] in protected_slugs:
            updated_cs_list.append(cs)

    processed_count = 0
    for slug, filename in EXPLICIT_MAP.items():
        if slug in protected_slugs:
            continue
        p_meta = projects_by_slug.get(slug, {
            'slug': slug,
            'title': slug.replace('-', ' ').title(),
            'code': 'HAF_101',
            'category': 'Architecture',
            'location': 'Jakarta',
            'year': '2026',
            'status': 'Completed'
        })
        entry = process_single(slug, filename, p_meta)
        if entry:
            updated_cs_list.append(entry)
            processed_count += 1
            num_rows = len(entry['layoutRows'])
            num_imgs = sum(len(r['columns']) for r in entry['layoutRows'])
            print(f'[{processed_count:02d}/33] Successfully processed {slug}: {num_rows} rows, {num_imgs} images')

    # Save to web/src/content/case-studies.json
    with open('web/src/content/case-studies.json', 'w') as f:
        json.dump(updated_cs_list, f, indent=2)

    print(f'\nFinished processing! Total case studies in case-studies.json: {len(updated_cs_list)}')

if __name__ == '__main__':
    main()
