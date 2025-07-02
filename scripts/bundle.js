#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting optimized build process...');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
}

// Create assets directory in dist
const assetsDir = path.join(distDir, 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

console.log('✅ Build directories created');
console.log('📁 Dist directory:', distDir);
console.log('📁 Assets directory:', assetsDir);

// Check for required assets
const requiredAssets = [
    'bg.jpg',
    'headline.png', 
    'cta.png',
    'shadow.png',
    'shoe1.png',
    'shoe2.png', 
    'shoe3.png',
    'shoe4.png',
    'video.mp4'
];

const assetsPath = path.join(__dirname, '..', 'assets');
console.log('\n🔍 Checking for required assets...');

let missingAssets = [];
requiredAssets.forEach(asset => {
    const assetPath = path.join(assetsPath, asset);
    if (fs.existsSync(assetPath)) {
        console.log(`✅ ${asset}`);
    } else {
        console.log(`❌ ${asset} - MISSING`);
        missingAssets.push(asset);
    }
});

if (missingAssets.length > 0) {
    console.log('\n⚠️  Missing assets detected:');
    missingAssets.forEach(asset => {
        console.log(`   - ${asset}`);
    });
    console.log('\n📝 Please add these files to the assets/ directory');
} else {
    console.log('\n✅ All required assets found!');
}

console.log('\n🎯 Build optimization complete!');
console.log('💡 Run "npm run build" to compile the project');