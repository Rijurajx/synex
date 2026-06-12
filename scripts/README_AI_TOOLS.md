# AI Asset Optimization Pipeline Setup Guide

This guide details how to install the required machine learning dependencies (**RIFE** for frame rate interpolation and **Real-ESRGAN** for frame upscaling) on macOS and run the custom pipelines.

---

## 🛠️ Step 1: Install System Core Tools

Ensure you have **FFmpeg** and **WebP** utilities installed on your system. Run the following command in terminal to install them via Homebrew:

```bash
brew install ffmpeg-full webp
```

---

## 🤖 Step 2: Install RIFE & Real-ESRGAN

Both tools are distributed as standalone, high-performance Vulkan binaries that run natively on macOS (with Apple Silicon M1/M2/M3 GPU acceleration via MoltenVK).

### 1. Create Binaries Folder
In the root directory of this Next.js project, create a folder named `bin` (or `tools`):
```bash
mkdir -p bin
```

### 2. Download and Place RIFE
1. Go to the RIFE Releases page: [nihui/rife-ncnn-vulkan/releases](https://github.com/nihui/rife-ncnn-vulkan/releases).
2. Download the latest macOS zip release, e.g., `rife-ncnn-vulkan-YYYYMMDD-macos.zip`.
3. Extract the contents.
4. Move the `rife-ncnn-vulkan` executable and the entire `models` folder into your `./bin` folder:
   - `bin/rife-ncnn-vulkan`
   - `bin/models/` (contains files like `rife-v4/rife.bin` etc.)

### 3. Download and Place Real-ESRGAN
1. Go to the Real-ESRGAN Releases page: [xinntao/Real-ESRGAN/releases](https://github.com/xinntao/Real-ESRGAN/releases).
2. Download the latest macOS zip release, e.g., `realesrgan-ncnn-vulkan-YYYYMMDD-macos.zip`.
3. Extract the contents.
4. Move the `realesrgan-ncnn-vulkan` executable and its models into the same `./bin` folder:
   - `bin/realesrgan-ncnn-vulkan`
   - Merge the model files into `bin/models/` (copying files like `realesrgan-x4plus.bin` and `realesrgan-x4plus.param` into `bin/models/`).

*Note: If macOS prevents the binaries from running due to an unsigned developer notice, open Terminal and run:*
```bash
chmod +x bin/rife-ncnn-vulkan bin/realesrgan-ncnn-vulkan
xattr -r -d com.apple.quarantine bin/rife-ncnn-vulkan bin/realesrgan-ncnn-vulkan
```

---

## 🏃‍♂️ Step 3: Run the Pipeline

With RIFE and Real-ESRGAN placed inside the `./bin` folder, execute the unified workflow:

### A. Interpolate Video (15 FPS ➜ 30 FPS)
Increase the video frame rate of `cyber.mp4` by running:
```bash
npm run interpolate-video
```
- **Input**: Reads `public/vid/cyber.mp4` (or `public/vid/video.mp4`).
- **Output**: Generates a smooth, 30 FPS video at `public/vid/video_30fps.mp4` while retaining the original resolution and duration.

### B. Extract WebP Frames
Extract the newly interpolated 30 FPS video frames:
```bash
npm run extract-frames
```
- **Output**: Extracts 178 frames to `public/frames` at 30 FPS, named `frame_00001.webp` to `frame_00178.webp`.

### C. Upscale & Optimize Frames (2x Resolution)
Double the resolution of the frames and optimize them for web rendering:
```bash
npm run upscale-frames
```
- **Input**: Reads the 178 frames from `public/frames`.
- **Output**: Writes 2x upscaled and highly compressed WebP frames to `public/frames-upscaled`.
- **Compression Settings**: Utilizes `cwebp -q 82 -m 6 -mt -sharp_yuv` to preserve cinematic details while keeping file sizes extremely small.

---

## ⚡ Expected Processing Times

- **Video Interpolation (RIFE)**: Takes approximately **15 to 45 seconds** on Apple Silicon Macs, using Vulkan GPU acceleration.
- **Frame Extraction**: Takes **2 to 5 seconds** via FFmpeg.
- **Frame Upscaling (Real-ESRGAN)**: Takes approximately **2 to 4 seconds per frame** on M1/M2/M3 GPUs. For a 178-frame sequence, this takes about **6 to 12 minutes**.
- **WebP Optimization (cwebp)**: Takes **0.5 to 1 second per frame** using multi-threaded CPU compression. For 178 frames, this takes about **1.5 to 3 minutes**.
