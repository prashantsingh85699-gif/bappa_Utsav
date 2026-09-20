import os
import subprocess
import glob
import imageio_ffmpeg

def encode():
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    print(f"FFmpeg executable: {ffmpeg_exe}")

    frames_dir = os.path.abspath('frames_3min')
    frames = sorted(glob.glob(os.path.join(frames_dir, 'frame_*.jpg')))
    total_frames = len(frames)
    print(f"Total frames captured: {total_frames}")

    if total_frames == 0:
        print("No frames found!")
        return

    target_duration = 180.0  # Exactly 3 minutes (180.0 seconds)
    input_fps = total_frames / target_duration
    print(f"Input FPS calculated: {input_fps:.4f} for {target_duration}s")

    input_pattern = os.path.join(frames_dir, 'frame_%06d.jpg')
    audio_path = os.path.abspath('public/audio/music/jai_ganesh_deva.mp3')
    output_mp4 = os.path.abspath('bappa_utsav_gameplay_demo.mp4')
    public_mp4 = os.path.abspath('public/bappa_utsav_gameplay_demo.mp4')

    cmd = [
        ffmpeg_exe,
        '-y',
        '-framerate', f"{input_fps:.4f}",
        '-i', input_pattern,
        '-i', audio_path,
        '-vf', 'fps=30,format=yuv420p',
        '-c:v', 'libx264',
        '-preset', 'fast',
        '-crf', '22',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-af', 'afade=t=out:st=175:d=5',
        '-t', '180',
        '-movflags', '+faststart',
        output_mp4
    ]

    print("Executing FFmpeg command...")
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("FFmpeg stderr:", res.stderr)
        raise RuntimeError("FFmpeg encoding failed!")

    file_size_mb = os.path.getsize(output_mp4) / (1024 * 1024)
    print(f"SUCCESS: Generated 3-minute video at: {output_mp4} ({file_size_mb:.2f} MB)")

    with open(output_mp4, 'rb') as s, open(public_mp4, 'wb') as d:
        d.write(s.read())
    print(f"Copied to: {public_mp4}")

if __name__ == '__main__':
    encode()
