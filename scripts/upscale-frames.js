const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. Helper to find Real-ESRGAN executable
function getRealEsrganPath() {
  try {
    const result = spawnSync('realesrgan-ncnn-vulkan', ['-h'], { encoding: 'utf8' });
    if (result.status === 0 || result.status === 255) {
      return 'realesrgan-ncnn-vulkan';
    }
  } catch (e) {
    // Ignore and search common locations
  }

  const commonPaths = [
    '/opt/homebrew/bin/realesrgan-ncnn-vulkan',
    '/usr/local/bin/realesrgan-ncnn-vulkan',
    path.join(process.cwd(), 'bin', 'realesrgan-ncnn-vulkan'),
    path.join(process.cwd(), 'tools', 'realesrgan-ncnn-vulkan'),
    path.join(process.cwd(), 'bin', 'realesrgan-ncnn-vulkan', 'realesrgan-ncnn-vulkan')
  ];

  for (const p of commonPaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  throw new Error(
    'Real-ESRGAN executable was not found in standard system PATH or custom local paths.\n' +
    'To install Real-ESRGAN:\n' +
    '1. Download the macOS portable zip from: https://github.com/xinntao/Real-ESRGAN/releases\n' +
    '2. Extract it and place the "realesrgan-ncnn-vulkan" binary and the "models" folder inside a "./bin" directory in this project.\n' +
    'For details, see instructions in scripts/README_RealESRGAN.md.'
  );
}

// 2. Helper to find cwebp executable
function getCwebpPath() {
  const commonPaths = [
    '/opt/homebrew/bin/cwebp',
    '/usr/local/bin/cwebp'
  ];

  for (const p of commonPaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  try {
    const result = spawnSync('cwebp', ['-version'], { encoding: 'utf8' });
    if (result.status === 0) {
      return 'cwebp';
    }
  } catch (e) {
    // Ignore error
  }

  throw new Error('cwebp utility was not found. Please install webp package using Homebrew: brew install webp');
}

// 3. Helper to render CLI progress bar
function drawProgressBar(current, total, prefix = 'Progress') {
  const percentage = Math.min(100, (current / total) * 100);
  const barWidth = 30;
  const completedWidth = Math.min(barWidth, Math.round((percentage / 100) * barWidth));
  const remainingWidth = Math.max(0, barWidth - completedWidth);
  const bar = '='.repeat(completedWidth) + ' '.repeat(remainingWidth);
  process.stdout.write(`\r${prefix}: [${bar}] ${percentage.toFixed(1)}% (${current}/${total})`);
}

async function run() {
  console.log('--- AI Frame Upscaling & WebP Optimization Pipeline ---');

  // Verify dependencies
  let realesrganPath, cwebpPath;
  try {
    realesrganPath = getRealEsrganPath();
    console.log(`✔ Real-ESRGAN found at: "${realesrganPath}"`);
    cwebpPath = getCwebpPath();
    console.log(`✔ cwebp optimizer found at: "${cwebpPath}"`);
  } catch (err) {
    console.error(`✖ Dependency Error:\n${err.message}`);
    process.exit(1);
  }

  // Setup paths
  const framesDir = path.join(process.cwd(), 'public', 'frames');
  const tempPngDir = path.join(process.cwd(), 'public', 'frames-temp-png');
  const upscaledDir = path.join(process.cwd(), 'public', 'frames-upscaled');

  // Verify inputs exist
  if (!fs.existsSync(framesDir)) {
    console.error(`✖ Error: Input directory "${framesDir}" does not exist.`);
    process.exit(1);
  }

  const inputFiles = fs.readdirSync(framesDir).filter(f => f.endsWith('.webp'));
  if (inputFiles.length === 0) {
    console.error(`✖ Error: No WebP frames found in "${framesDir}". Run "npm run extract-frames" first.`);
    process.exit(1);
  }

  console.log(`📹 Source frames: ${inputFiles.length} files detected in "${framesDir}"`);

  // Prepare directories
  if (fs.existsSync(tempPngDir)) {
    fs.rmSync(tempPngDir, { recursive: true, force: true });
  }
  fs.mkdirSync(tempPngDir, { recursive: true });

  if (fs.existsSync(upscaledDir)) {
    console.log(`🧹 Cleaning old upscaled frames in: "${upscaledDir}"`);
    const oldFiles = fs.readdirSync(upscaledDir).filter(f => f.endsWith('.webp'));
    for (const f of oldFiles) {
      fs.unlinkSync(path.join(upscaledDir, f));
    }
  } else {
    fs.mkdirSync(upscaledDir, { recursive: true });
  }

  // Step A: Invoke Real-ESRGAN to upscale WebP frames into lossless PNGs
  console.log(`\n[Step 1/2] Upscaling frames 2x (WebP ➜ PNG)...`);
  console.log(`  Model: realesrgan-x4plus (high quality, optimized for photorealistic details)`);
  console.log(`  Running on Vulkan GPU interface...`);

  const realesrganArgs = [
    '-i', framesDir,
    '-o', tempPngDir,
    '-s', '2',
    '-n', 'realesrgan-x4plus',
    '-f', 'png'
  ];

  // If local binary is used, pass reference to its models folder
  if (realesrganPath.includes('/bin/') || realesrganPath.includes('/tools/')) {
    const parentDir = path.dirname(realesrganPath);
    const modelsPath = path.join(parentDir, 'models');
    if (fs.existsSync(modelsPath)) {
      realesrganArgs.push('-m', modelsPath);
    } else {
      // If models are directly inside bin, point Real-ESRGAN to search inside bin
      realesrganArgs.push('-m', parentDir);
    }
  }

  const upscalerProcess = spawn(realesrganPath, realesrganArgs);

  upscalerProcess.stdout.on('data', (data) => {
    process.stdout.write(data.toString());
  });

  upscalerProcess.stderr.on('data', (data) => {
    // Real-ESRGAN prints progress directly to stderr
    process.stdout.write(data.toString());
  });

  const upscalerExitCode = await new Promise((resolve) => {
    upscalerProcess.on('close', resolve);
  });

  if (upscalerExitCode !== 0) {
    console.error(`\n✖ Real-ESRGAN failed with code ${upscalerExitCode}`);
    process.exit(1);
  }

  const pngFiles = fs.readdirSync(tempPngDir).filter(f => f.endsWith('.png')).sort();
  console.log(`\n✔ Upscaled ${pngFiles.length} frames to lossless PNG.`);

  if (pngFiles.length === 0) {
    console.error(`✖ Error: No PNG frames were generated in temporary folder.`);
    process.exit(1);
  }

  // Step B: Compress PNGs back to optimized WebP using cwebp
  console.log(`\n[Step 2/2] Compressing & Optimizing upscaled frames (PNG ➜ WebP)...`);
  console.log(`  Settings: -q 82 (high-quality visual retention), -m 6 (best compression), -sharp_yuv`);

  let compressedCount = 0;
  drawProgressBar(0, pngFiles.length, 'Optimizing');

  for (const pngFile of pngFiles) {
    const inputPngPath = path.join(tempPngDir, pngFile);
    const outputWebpName = pngFile.replace('.png', '.webp');
    const outputWebpPath = path.join(upscaledDir, outputWebpName);

    const cwebpArgs = [
      '-q', '82',
      '-m', '6',
      '-mt',
      '-sharp_yuv',
      inputPngPath,
      '-o', outputWebpPath
    ];

    const result = spawnSync(cwebpPath, cwebpArgs);
    if (result.status !== 0) {
      console.error(`\n✖ Optimization failed for frame: ${pngFile}`);
      console.error(result.stderr ? result.stderr.toString() : '');
      process.exit(1);
    }

    compressedCount++;
    drawProgressBar(compressedCount, pngFiles.length, 'Optimizing');
  }

  // Cleanup temporary PNGs
  console.log(`\n\n🧹 Cleaning temporary PNG folders...`);
  fs.rmSync(tempPngDir, { recursive: true, force: true });

  console.log(`\n🎉 Upscaling & Optimization Pipeline completed successfully!`);
  console.log(`📁 Saved ${compressedCount} optimized, upscaled frames in: "${upscaledDir}"`);
}

run().catch((err) => {
  console.error('✖ Upscaling workflow failed:', err);
  process.exit(1);
});
