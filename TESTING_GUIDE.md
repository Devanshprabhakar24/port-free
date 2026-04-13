# Mobile Optimization Testing Guide

## Quick Start

1. **Run development server**:

   ```bash
   npm run dev
   ```

2. **Open in browser**: http://localhost:5173

3. **Check console**: Performance stats will auto-log every 2 seconds

## Testing Scenarios

### Desktop Testing

1. Open in Chrome/Firefox/Safari
2. Check console for device capabilities:
   ```
   Device Capabilities: {
     isMobile: false,
     isLowEnd: false,
     recommendedDPR: 1.5,
     recommendedGeometryDetail: 'high'
   }
   ```
3. Verify smooth 60fps scrolling
4. Check that all planets animate smoothly
5. Verify cinematic background has full effects

### Mobile Testing (Real Device)

1. Build the project:

   ```bash
   npm run build
   npm run preview
   ```

2. Access from mobile device on same network

3. Check for:
   - Smooth animations (no jank)
   - Planets scale appropriately
   - Background animates smoothly
   - No excessive battery drain

### Mobile Testing (Browser DevTools)

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select device preset (iPhone 12, Galaxy S21, etc.)
4. Refresh page
5. Check console for mobile detection:
   ```
   Device Capabilities: {
     isMobile: true,
     isLowEnd: false,
     recommendedDPR: 1,
     recommendedGeometryDetail: 'medium'
   }
   ```

### Low-End Device Simulation

1. Open DevTools
2. Go to Performance tab
3. Click gear icon → CPU throttling → 4x slowdown
4. Network tab → Slow 3G
5. Refresh and test

Expected behavior:

- Smaller planets (50% size)
- Lower geometry detail (24x24)
- Simplified background (no secondary elements)
- Still maintains 60fps

## Performance Monitoring

### Enable Debug Mode

Add `?debug=performance` to URL:

```
http://localhost:5173/?debug=performance
```

Console will show every 2 seconds:

```
FPS: 60 | Frame Time: 16.67ms | Memory: 45MB
```

### Manual Performance Check

```javascript
// In browser console
import { performanceMonitor } from "./utils/performanceMonitor";
performanceMonitor.enable();
performanceMonitor.logStats();
```

### Check Device Capabilities

```javascript
// In browser console
import { getDeviceCapabilities } from "./utils/deviceCapabilities";
console.log(getDeviceCapabilities());
```

## Expected Performance Targets

| Device Type  | FPS | Frame Time | Geometry | Planet Size |
| ------------ | --- | ---------- | -------- | ----------- |
| Desktop      | 60  | ~16ms      | 64x64    | 100%        |
| Mobile (mid) | 60  | ~16ms      | 32x32    | 70%         |
| Mobile (low) | 60  | ~16ms      | 24x24    | 50%         |

## Common Issues

### Issue: Low FPS on mobile

**Solution**: Check if device is detected as low-end. May need to adjust detection thresholds in `deviceCapabilities.ts`

### Issue: Planets not animating

**Solution**: Check console for WebGL errors. Verify WebGL is supported on device.

### Issue: Background static on mobile

**Solution**: Verify Framer Motion is loaded. Check for JavaScript errors in console.

### Issue: Build fails

**Solution**: Run `npm run build` and check for TypeScript errors. All should be resolved.

## Testing Checklist

- [ ] Desktop: Full quality rendering at 60fps
- [ ] Desktop: All 4 lights visible
- [ ] Desktop: Smooth pointer parallax
- [ ] Mobile: Animations work smoothly
- [ ] Mobile: Planets scale appropriately
- [ ] Mobile: Background animates
- [ ] Mobile: No excessive battery drain
- [ ] Low-end: Simplified rendering
- [ ] Low-end: Still maintains 60fps
- [ ] Build: No TypeScript errors
- [ ] Build: No runtime errors
- [ ] Performance: Stats logging works
- [ ] Performance: Device detection accurate

## Reporting Issues

When reporting performance issues, include:

1. Device model and OS version
2. Browser and version
3. Console output (device capabilities + performance stats)
4. Screenshot/video of issue
5. Network conditions (WiFi/4G/5G)
