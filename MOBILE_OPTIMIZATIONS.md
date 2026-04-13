# Mobile Planet Animation Optimizations

## Overview

The planet animation system now runs on mobile devices with the same visual experience as desktop, using adaptive quality settings based on device capabilities. The system automatically detects device performance and adjusts rendering quality for optimal 60fps performance.

## Adaptive Quality System

The system detects three device tiers:

1. **Desktop/High-end**: Full quality rendering
2. **Mobile/Mid-range**: Optimized rendering with reduced complexity
3. **Low-end**: Minimal quality for maximum performance

### Device Detection

- Automatically detects mobile vs desktop
- Checks available RAM (if supported)
- Analyzes CPU cores (hardware concurrency)
- Tests WebGL capabilities
- Considers Android version for older devices

## Key Optimizations

### 1. Geometry Complexity (Adaptive)

- **Desktop/High-end**: 64x64 sphere segments for planets, 32x32 for glow
- **Mobile/Mid-range**: 32x32 sphere segments for planets, 16x16 for glow
- **Low-end**: 24x24 sphere segments for planets, 12x12 for glow
- Reduces vertex count by up to 85% on low-end devices

### 2. Texture Quality (Adaptive)

- **Desktop**: Anisotropy level 4 for crisp textures
- **Mobile**: Anisotropy level 2 to reduce memory bandwidth
- **Low-end**: Anisotropy level 1 for minimal memory usage

### 3. Planet Sizes (Adaptive)

- **Desktop**: Full size (100%)
- **Mobile**: 70% of desktop size
- **Low-end**: 50% of desktop size
- Reduces fill rate and overdraw significantly

### 4. Lighting

- **Desktop**: Full lighting setup with 4 light sources
- **Mobile/Low-end**: Simplified to 2 light sources
- Reduces shader complexity and GPU load

### 5. Shader Optimization

- **Desktop**: Full atmospheric glow with sun-facing calculations
- **Mobile/Low-end**: Simplified rim lighting shader
- Reduces fragment shader instructions by ~40%

### 6. Rendering Quality (Adaptive)

- **Desktop**: DPR up to 1.5x, high-performance mode
- **Mobile**: DPR 1.0x, battery-friendly mode
- **Low-end**: DPR 1.0x forced, all optimizations enabled

### 7. Glow Effects

- **Desktop**: Glow mesh scaled to 1.35x planet size
- **Mobile**: Glow mesh scaled to 1.25x planet size

## Performance Monitoring

Built-in performance monitor tracks FPS, frame time, and memory usage.

Enable monitoring:

- Automatically enabled in development mode
- Add `?debug=performance` to URL in production

## Performance Targets

- **Low-end Mobile**: 60fps on iPhone SE 2020, budget Android
- **Mid-range Mobile**: 60fps on iPhone 12, Samsung Galaxy S21
- **Desktop**: 60fps on integrated graphics

## Debug Tools

### Performance Monitor

```typescript
import { performanceMonitor } from "./utils/performanceMonitor";
performanceMonitor.enable();
const stats = performanceMonitor.update();
```

### Device Capabilities

```typescript
import { getDeviceCapabilities } from "./utils/deviceCapabilities";
const caps = getDeviceCapabilities();
```
