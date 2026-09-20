import os
import glob
import cv2
from PIL import Image

def build_video():
    frames_dir = os.path.abspath('frames_temp')
    frame_files = sorted(glob.glob(os.path.join(frames_dir, 'frame_*.png')))
    print(f"Found {len(frame_files)} frames in {frames_dir}")
    if not frame_files:
        print("No frames found!")
        return

    # Check first frame dimensions
    first_frame = cv2.imread(frame_files[0])
    height, width, layers = first_frame.shape
    print(f"Frame size: {width}x{height}")

    fps = 10  # 10 fps corresponds to our 100ms snap interval

    # 1. Generate MP4
    mp4_path = os.path.abspath('bappa_utsav_gameplay_demo.mp4')
    # Try mp4v or H264
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(mp4_path, fourcc, fps, (width, height))

    for f in frame_files:
        img = cv2.imread(f)
        out.write(img)

    out.release()
    print(f"Successfully generated MP4: {mp4_path} ({os.path.getsize(mp4_path)} bytes)")

    # Copy MP4 to public/
    public_mp4 = os.path.abspath('public/bappa_utsav_gameplay_demo.mp4')
    with open(mp4_path, 'rb') as src, open(public_mp4, 'wb') as dst:
        dst.write(src.read())
    print(f"Copied to {public_mp4}")

    # 2. Generate animated WebP for browser/preview fallback
    webp_path = os.path.abspath('bappa_utsav_gameplay_demo.webp')
    public_webp = os.path.abspath('public/bappa_utsav_gameplay_demo.webp')

    # Load with PIL (downscale slightly if needed to keep file size fast and responsive)
    pil_frames = []
    # Every 1st frame (or all frames)
    for i, f in enumerate(frame_files):
        # Sample every frame
        im = Image.open(f)
        # Convert to RGB (or keep RGBA)
        pil_frames.append(im.copy())

    if pil_frames:
        pil_frames[0].save(
            webp_path,
            format='WEBP',
            append_images=pil_frames[1:],
            save_all=True,
            duration=100,
            loop=0,
            quality=85
        )
        print(f"Successfully generated WebP: {webp_path} ({os.path.getsize(webp_path)} bytes)")
        with open(webp_path, 'rb') as src, open(public_webp, 'wb') as dst:
            dst.write(src.read())
        print(f"Copied to {public_webp}")

if __name__ == '__main__':
    build_video()
