const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. Helper to find FFmpeg path (handling standard macOS Homebrew installation paths)
function getFfmpegPath() {
  const commonPaths = [
    '/opt/homebrew/opt/ffmpeg-full/bin/ffmpeg',
    '/usr/local/opt/ffmpeg-full/bin/ffmpeg',
    '/opt/homebrew/bin/ffmpeg',
    '/usr/local/bin/ffmpeg'
  ];

  for (const p of commonPaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  try {
    const result = spawnSync('ffmpeg', ['-version'], { encoding: 'utf8' });
    if (result.status === 0) {
      return 'ffmpeg';
    }
  } catch (e) {
    // Ignore error and fall back
  }

  throw new Error(
    'FFmpeg executable was not found in standard Homebrew paths or your system PATH.\n' +
    'Please verify that FFmpeg (with webp support, e.g. ffmpeg-full) is installed: brew install ffmpeg-full'
  );
}

// 2. Helper to get video duration to calculate the total estimated frames
function getVideoDuration(ffmpegPath, videoPath) {
  const result = spawnSync(ffmpegPath, ['-i', videoPath], { encoding: 'utf8' });
  const stderr = result.stderr || '';
  const match = stderr.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
  if (match) {
    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const seconds = parseFloat(match[3]);
    return hours * 3600 + minutes * 60 + seconds;
  }
  return null;
}

// 3. Helper to render the CLI progress bar
function drawProgressBar(current, total) {
  const percentage = Math.min(100, (current / total) * 100);
  const barWidth = 30;
  const completedWidth = Math.min(barWidth, Math.round((percentage / 100) * barWidth));
  const remainingWidth = Math.max(0, barWidth - completedWidth);
  const bar = '='.repeat(completedWidth) + ' '.repeat(remainingWidth);
  process.stdout.write(`\rProgress: [${bar}] ${percentage.toFixed(1)}% (${current}/${total} frames)`);
}

async function run() {
  console.log('--- Video Frame Extraction Pipeline ---');

  // Verify FFmpeg
  let ffmpegPath;
  try {
    ffmpegPath = getFfmpegPath();
    console.log(`✔ FFmpeg check passed: Using executable at "${ffmpegPath}"`);
  } catch (err) {
    console.error(`✖ Error: ${err.message}`);
    process.exit(1);
  }

  // Setup paths
  const vidDir = path.join(process.cwd(), 'public', 'vid');
  const cyber3Path = path.join(vidDir, 'cyber3.mp4');
  const cyber2Path = path.join(vidDir, 'cyber2.mp4');
  const interpolatedPath = path.join(vidDir, 'video_30fps.mp4');
  const originalPath = path.join(vidDir, 'cyber.mp4');
  const fallbackPath = path.join(process.cwd(), 'public', 'cyber.mp4');
  const outputDir = path.join(process.cwd(), 'public', 'frames');

  let targetVideoPath = '';
  let targetFPS = 15;

  // Prioritize user's high-quality 30 FPS video if present
  if (fs.existsSync(cyber3Path)) {
    targetVideoPath = cyber3Path;
    targetFPS = 30;
    console.log(`✔ Found user's high-quality 30 FPS video: "${targetVideoPath}" (using 30 FPS extraction)`);
  } else if (fs.existsSync(cyber2Path)) {
    targetVideoPath = cyber2Path;
    targetFPS = 25;
    console.log(`✔ Found user's 25 FPS video: "${targetVideoPath}" (using 25 FPS extraction)`);
  } else if (fs.existsSync(interpolatedPath)) {
    targetVideoPath = interpolatedPath;
    targetFPS = 30;
    console.log(`✔ Found RIFE-interpolated video: "${targetVideoPath}" (using 30 FPS extraction)`);
  } else if (fs.existsSync(originalPath)) {
    targetVideoPath = originalPath;
    targetFPS = 15;
    console.log(`✔ Found original video: "${targetVideoPath}" (using 15 FPS extraction)`);
  } else if (fs.existsSync(fallbackPath)) {
    console.log(`ℹ Original video not found at "public/vid/cyber.mp4" but found at "public/cyber.mp4".`);
    console.log(`  Moving video file to target location: "public/vid/cyber.mp4"...`);
    if (!fs.existsSync(vidDir)) {
      fs.mkdirSync(vidDir, { recursive: true });
    }
    fs.renameSync(fallbackPath, originalPath);
    targetVideoPath = originalPath;
    targetFPS = 15;
    console.log(`✔ Successfully moved source video.`);
  } else {
    console.error(`✖ Error: Source video file could not be found.`);
    console.error(`  Expected location: "public/vid/cyber3.mp4", "public/vid/cyber2.mp4", "public/vid/video_30fps.mp4", "public/vid/cyber.mp4" or "public/cyber.mp4".`);
    console.error(`  Please place the video and try again.`);
    process.exit(1);
  }

  // Prepare Output Directory
  if (fs.existsSync(outputDir)) {
    console.log(`🧹 Cleaning existing WebP frames in: "${outputDir}"`);
    const files = fs.readdirSync(outputDir);
    let count = 0;
    for (const file of files) {
      if (file.endsWith('.webp')) {
        fs.unlinkSync(path.join(outputDir, file));
        count++;
      }
    }
    if (count > 0) {
      console.log(`  Removed ${count} existing frame file(s).`);
    }
  } else {
    console.log(`⚙ Creating output directory: "${outputDir}"`);
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Calculate duration and frames
  const duration = getVideoDuration(ffmpegPath, targetVideoPath);
  let totalFrames = 0;

  if (duration !== null) {
    totalFrames = Math.round(duration * targetFPS);
    console.log(`📹 Video details: Duration: ${duration.toFixed(2)}s | Target FPS: ${targetFPS} | Estimated Frames: ${totalFrames}`);
  } else {
    console.log(`📹 Video details: Duration could not be read. Extracting frames at ${targetFPS} FPS...`);
  }

  console.log(`\n🚀 Invoking FFmpeg to extract frames...`);
  console.log(`  Settings: 1280px width (aspect preserved), ${targetFPS} FPS, high-quality WebP`);

  // Run FFmpeg to extract frames
  // Parameters:
  // -y: overwrite output files without asking
  // -i: input file
  // -vf: video filter: fps=30/15, scale to 1280px width, preserving aspect ratio (height divisible by 2 using -2 for compatibility)
  // -c:v libwebp: select standard webp encoder
  // -q:v 85: high quality lossy compression (scale 1-100)
  // output: frame_00001.webp, frame_00002.webp, etc.
  const ffmpegArgs = [
    '-y',
    '-i', targetVideoPath,
    '-vf', `fps=${targetFPS},scale=1280:-2`,
    '-c:v', 'libwebp',
    '-q:v', '85',
    path.join(outputDir, 'frame_%05d.webp')
  ];

  const ffmpegProcess = spawn(ffmpegPath, ffmpegArgs);

  let buffer = '';

  ffmpegProcess.stderr.on('data', (data) => {
    buffer += data.toString();
    const lines = buffer.split(/[\r\n]+/);
    buffer = lines.pop(); // keep last fragment

    for (const line of lines) {
      const match = line.match(/frame=\s*(\d+)/);
      if (match) {
        const currentFrame = parseInt(match[1], 10);
        if (totalFrames > 0) {
          drawProgressBar(currentFrame, totalFrames);
        } else {
          process.stdout.write(`\rProgress: Extracted ${currentFrame} frames...`);
        }
      }
    }
  });

  ffmpegProcess.on('close', (code) => {
    if (code === 0) {
      // Final progress render to 100% if we know the total frames
      const finalFiles = fs.readdirSync(outputDir).filter(f => f.startsWith('frame_') && f.endsWith('.webp'));
      const finalCount = finalFiles.length;

      if (totalFrames > 0) {
        drawProgressBar(finalCount, finalCount);
      } else {
        process.stdout.write(`\rProgress: Extracted ${finalCount} frames.`);
      }

      console.log(`\n\n🎉 Pipeline completed successfully!`);
      console.log(`📁 Extracted ${finalCount} frames to "${outputDir}"`);
      console.log(`ℹ Frames range from frame_00001.webp to frame_${String(finalCount).padStart(5, '0')}.webp`);
    } else {
      console.error(`\n✖ FFmpeg process failed and exited with code ${code}`);
      process.exit(code);
    }
  });
}

run().catch((err) => {
  console.error('✖ Pipeline failed with error:', err);
  process.exit(1);
});
