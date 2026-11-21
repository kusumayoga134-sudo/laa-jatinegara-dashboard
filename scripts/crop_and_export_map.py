import os
import fitz
import shutil

def main():
    pdf_path = r'C:\Users\YOGA\.gemini\antigravity\brain\9cab1655-30f7-48f5-9398-0e382a3629b1\.user_uploaded\media_1795223465836_9a25bcc1.pdf'
    if not os.path.exists(pdf_path):
        print(f"PDF not found at {pdf_path}")
        return

    doc = fitz.open(pdf_path)
    page = doc[0]

    # Crop rectangle exactly matching the outer black blueprint frame
    # Vector points in landscape (rotation 270 applied)
    pad = 2.0
    crop_rect = fitz.Rect(50.32 - pad, 277.56 - pad, 3321.52 + pad, 2108.28 + pad)
    print(f"Crop rect in points: {crop_rect} (Width: {crop_rect.width:.2f}, Height: {crop_rect.height:.2f})")

    # Render at 200 DPI (9098 x 5097 px)
    pix = page.get_pixmap(dpi=200, clip=crop_rect)
    print(f"Rendered Pixmap: {pix.width} x {pix.height}")

    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    public_dir = os.path.join(root_dir, 'frontend', 'public')

    targets = [
        'peta-laa-cropped-hd.png',
        'peta-laa-cropped.png',
        'autocad-peta-hd.png',
        'autocad-peta-web.png',
        'autocad-peta-laa.png',
        'schematic-map-full.png',
        'schematic-map-web.png'
    ]

    primary_file = os.path.join(public_dir, 'peta-laa-cropped-hd.png')
    pix.save(primary_file)
    print(f"Saved primary image: {primary_file}")

    for t in targets:
        dst = os.path.join(public_dir, t)
        shutil.copy2(primary_file, dst)
        print(f"Synchronized public: {dst}")

    for rt in ['autocad-peta-300dpi.png', 'schematic-map-web.png', 'schematic-map.png']:
        dst = os.path.join(root_dir, rt)
        shutil.copy2(primary_file, dst)
        print(f"Synchronized root: {dst}")

if __name__ == '__main__':
    main()
