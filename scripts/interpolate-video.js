const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. Helper to find RIFE executable
function getRifePath() {
  try {
    const result = spawnSync('rife-ncnn-vulkan', ['-h'], { encoding: 'utf8' });
    if (result.status === 0 || result.status === 255) {
      return 'rife-ncnn-vulkan';
    }
  } catch (e) {
    // Ignore and search common locations
  }

  const commonPaths = [
    '/opt/homebrew/bin/rife-ncnn-vulkan',
    '/usr/local/bin/rife-ncnn-vulkan',
    path.join(process.cwd(), 'bin', 'rife-ncnn-vulkan'),
    path.join(process.cwd(), 'tools', 'rife-ncnn-vulkan'),
    path.join(process.cwd(), 'bin', 'rife-ncnn-vulkan', 'rife-ncnn-vulkan')
  ];

  for (const p of commonPaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  // Return a helper error explaining how to install it
  throw new Error(
    'RIFE executable was not found in standard system PATH or custom local paths.\n' +
    'To install RIFE:\n' +
    '1. Download the macOS portable zip from: https://github.com/nihui/rife-ncnn-vulkan/releases\n' +
    '2. Extract it and place the "rife-ncnn-vulkan" binary and the "models" folder inside a "./bin" directory in this project.\n' +
    'For details, see instructions in scripts/README_RIFE.md.'
  );
}

// 2. Helper to find FFmpeg path
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
    // Ignore error
  }

  throw new Error('FFmpeg was not found. Please install it using Homebrew: brew install ffmpeg-full');
}

// 3. Helper to clean directories recursively
function cleanDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
  fs.mkdirSync(dirPath, { recursive: true });
}

async function run() {
  console.log('--- AI Video Frame Interpolation (RIFE) Pipeline ---');

  // Verify dependencies
  let ffmpegPath, rifePath;
  try {
    ffmpegPath = getFfmpegPath();
    console.log(`✔ FFmpeg found at: "${ffmpegPath}"`);
    rifePath = getRifePath();
    console.log(`✔ RIFE found at: "${rifePath}"`);
  } catch (err) {
    console.error(`✖ Dependency Error:\n${err.message}`);
    process.exit(1);
  }

  // Resolve input video
  const vidDir = path.join(process.cwd(), 'public', 'vid');
  const possibleInputs = [
    path.join(vidDir, 'video.mp4'),
    path.join(vidDir, 'cyber.mp4')
  ];

  let inputVideoPath = null;
  for (const p of possibleInputs) {
    if (fs.existsSync(p)) {
      inputVideoPath = p;
      break;
    }
  }

  if (!inputVideoPath) {
    console.error(`✖ Error: Source video file could not be found.`);
    console.error(`  Tried locations: ${possibleInputs.join(', ')}`);
    console.error(`  Please place your video file there and try again.`);
    process.exit(1);
  }

  const outputVideoPath = path.join(vidDir, 'video_30fps.mp4');
  console.log(`📹 Source Video: "${inputVideoPath}"`);
  console.log(`📹 Target Video: "${outputVideoPath}"`);

  // Setup temporary frame directories
  const tempInputDir = path.join(vidDir, 'temp_input');
  const tempOutputDir = path.join(vidDir, 'temp_output');

  console.log(`🧹 Cleaning temporary workspaces...`);
  cleanDir(tempInputDir);
  cleanDir(tempOutputDir);

  // Step A: Extract frames from video at 15 FPS using FFmpeg
  console.log(`\n[Step 1/3] Extracting frames at 15 FPS via FFmpeg...`);
  const ffmpegExtractArgs = [
    '-y',
    '-i', inputVideoPath,
    '-r', '15',
    '-f', 'image2',
    '-vcodec', 'png',
    path.join(tempInputDir, '%05d.png')
  ];

  const extractResult = spawnSync(ffmpegPath, ffmpegExtractArgs, { stdio: 'inherit' });
  if (extractResult.status !== 0) {
    console.error(`✖ Frame extraction failed.`);
    process.exit(1);
  }

  const extractedFiles = fs.readdirSync(tempInputDir).filter(f => f.endsWith('.png'));
  console.log(`✔ Extracted ${extractedFiles.length} source frames.`);

  // Step B: Run RIFE Vulkan to interpolate frames (2x multiplier)
  console.log(`\n[Step 2/3] Performing RIFE 2x Frame Interpolation...`);
  console.log(`  Targeting Apple Silicon GPU (MoltenVK) for acceleration`);

  // Determine model path if model files are located adjacent to local RIFE binary
  const rifeArgs = [
    '-i', tempInputDir,
    '-o', tempOutputDir,
    '-u', '2'
  ];

  // If local binary is used, find the specific model folder (e.g., rife-v2.3) and pass its path via -m
  if (rifePath.includes('/bin/') || rifePath.includes('/tools/')) {
    const parentDir = path.dirname(rifePath);
    const candidateModels = ['rife-v2.3', 'rife-v2.4', 'rife-v3.1', 'rife-v4', 'rife'];
    let chosenModelPath = null;

    for (const modelName of candidateModels) {
      const fullPath = path.join(parentDir, modelName);
      if (fs.existsSync(fullPath)) {
        chosenModelPath = fullPath;
        break;
      }
    }

    // Also check inside a nested 'models' folder if it exists
    if (!chosenModelPath) {
      const nestedModelsDir = path.join(parentDir, 'models');
      if (fs.existsSync(nestedModelsDir)) {
        for (const modelName of candidateModels) {
          const fullPath = path.join(nestedModelsDir, modelName);
          if (fs.existsSync(fullPath)) {
            chosenModelPath = fullPath;
            break;
          }
        }
      }
    }

    if (chosenModelPath) {
      console.log(`🤖 Auto-detected RIFE model: "${chosenModelPath}"`);
      rifeArgs.push('-m', chosenModelPath);
      if (chosenModelPath.includes('rife-v4')) {
        console.warn('\n⚠️  WARNING: You are using the "rife-v4" model with a rife-ncnn-vulkan binary that defaults to "rife-v2.3".');
        console.warn('   Older binary versions do not support RIFE v4 layers, which results in blank (black) intermediate frames.');
        console.warn('   Action Required: Please copy the "rife-v2.3" folder from your extracted RIFE zip directly into `./bin/` to get smooth, correct frames.\n');
      }
    }
  }

  const rifeProcess = spawn(rifePath, rifeArgs);

  rifeProcess.stdout.on('data', (data) => {
    process.stdout.write(data.toString());
  });

  rifeProcess.stderr.on('data', (data) => {
    // rife-ncnn-vulkan prints progress updates to stderr
    process.stdout.write(data.toString());
  });

  const rifeExitCode = await new Promise((resolve) => {
    rifeProcess.on('close', resolve);
  });

  if (rifeExitCode !== 0) {
    console.error(`\n✖ RIFE Interpolation failed with code ${rifeExitCode}`);
    process.exit(1);
  }

  const interpolatedFiles = fs.readdirSync(tempOutputDir).filter(f => f.endsWith('.png'));
  console.log(`\n✔ Interpolated frames complete. Total: ${interpolatedFiles.length} frames.`);

  // Step C: Mux frames back to 30 FPS video using FFmpeg
  console.log(`\n[Step 3/3] Packing frames back to 30 FPS MP4 video...`);
  const ffmpegMuxArgs = [
    '-y',
    '-f', 'image2',
    '-framerate', '30',
    '-i', path.join(tempOutputDir, '%08d.png'),
    '-i', inputVideoPath,
    '-map', '0:v',
    '-map', '1:a?', // copy audio stream optionally if present
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-r', '30',
    outputVideoPath
  ];

  const muxResult = spawnSync(ffmpegPath, ffmpegMuxArgs, { stdio: 'inherit' });
  if (muxResult.status !== 0) {
    console.error(`✖ Video reassembly failed.`);
    process.exit(1);
  }

  // Step D: Cleaning Up
  console.log(`\n🧹 Removing temporary frame caches...`);
  fs.rmSync(tempInputDir, { recursive: true, force: true });
  fs.rmSync(tempOutputDir, { recursive: true, force: true });

  console.log(`\n🎉 RIFE Frame Rate Interpolation completed!`);
  console.log(`📁 Saved 30 FPS video to: "${outputVideoPath}"`);
}

run().catch((err) => {
  console.error('✖ Interpolation workflow failed:', err);
  process.exit(1);
});
