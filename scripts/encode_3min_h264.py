import os
import subprocess
import glob
import imageio_ffmpeg

def encode():
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    print(f"Using FFmpeg at: {ffmpeg_exe}")

    frames_dir = os.path.abspath('frames_3min')
    frames = sorted(glob.glob(os.path.join(frames_dir, 'frame_*.png')))
    print(f"Total frames found: {len(frames)}")
    if not frames:
        print("No frames found!")
        return

    # In record_3min_showcase.js, we save as JPEG format with extension .png or frame_%06d.png
    input_pattern = os.path.join(frames_dir, 'frame_%06d.png')
    audio_path = os.path.abspath('public/audio/music/jai_ganesh_deva.mp3')
    output_mp4 = os.path.abspath('bappa_utsav_gameplay_demo.mp4')
    public_mp4 = os.path.abspath('public/bappa_utsav_gameplay_demo.mp4')

    fps = 10

    # Build command for standard H.264 (AVC1) + AAC + yuv420p + faststart
    # This combination is 100% compatible with Google Drive in-browser video player!
    cmd = [
        ffmpeg_exe,
        '-y',
        '-framerate', str(fps),
        '-i', input_pattern,
        '-i', audio_path,
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-profile:v', 'high',
        '-level', '4.0',
        '-movflags', '+faststart',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest',
        output_mp4
    ]

    print("Running command:", " ".join(cmd))
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("FFmpeg error:", res.stderr)
        # Fallback without audio if audio had issue
        cmd_no_audio = [
            ffmpeg_exe,
            '-y',
            '-framerate', str(fps),
            '-i', input_pattern,
            '-c:v', 'libx264',
            '-pix_fmt', 'yuv420p',
            '-movflags', '+faststart',
            output_mp4
        ]
        subprocess.run(cmd_no_audio, check=True)

    print(f"Successfully generated 3-minute H.264 MP4: {output_mp4} ({os.path.getsize(output_mp4)} bytes)")

    with open(output_mp4, 'rb') as src, open(public_mp4, 'wb') as dst:
        dst.write(src.read())
    print(f"Copied to: {public_mp4}")

if __name__ == '__main__':
    encode()
