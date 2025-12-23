# Android Testing Checklist

## Installation Testing

### Chrome (Android 5.0+)
- [ ] Visit app URL in Chrome
- [ ] "Add to Home Screen" banner appears
- [ ] Install prompt works correctly
- [ ] App icon appears on home screen
- [ ] App opens in fullscreen (no browser UI)

### Samsung Internet
- [ ] Test installation process
- [ ] Verify standalone mode

### Firefox (Limited PWA support)
- [ ] Can still use as website
- [ ] All features work in browser

## Device Testing

### Test on Multiple Android Versions:
- [ ] Android 5.0 (Lollipop)
- [ ] Android 8.0 (Oreo)
- [ ] Android 10
- [ ] Android 12+

### Test on Different Manufacturers:
- [ ] Samsung (One UI)
- [ ] Google Pixel (Stock Android)
- [ ] OnePlus (OxygenOS)
- [ ] Xiaomi (MIUI)

## Feature Testing

### Core Functionality
- [ ] Add expense works
- [ ] View expenses works
- [ ] Edit/delete expenses work
- [ ] Budget tracking works
- [ ] Analytics/charts render correctly

### Android-Specific Features
- [ ] App shortcuts work (long-press icon)
- [ ] Share target works (if implemented)
- [ ] Back button behavior correct
- [ ] Recent apps switcher shows app correctly
- [ ] Notification works (if implemented)

### Performance
- [ ] Fast app launch (< 3 seconds)
- [ ] Smooth scrolling (60fps)
- [ ] No memory leaks
- [ ] Battery usage acceptable

### Offline Mode
- [ ] Works completely offline
- [ ] Service worker caching works
- [ ] Data persists when closing app
- [ ] Syncs when back online (if applicable)

### UI/UX
- [ ] Touch targets minimum 48x48dp
- [ ] No horizontal scrolling
- [ ] Keyboard doesn't hide inputs
- [ ] Status bar color matches theme
- [ ] Navigation bar color matches theme
- [ ] Proper spacing for gestures (Android 10+)

## Icon Testing

### Adaptive Icons
- [ ] Icon looks good in circular mask
- [ ] Icon looks good in square mask
- [ ] Icon looks good in rounded square mask
- [ ] Icon looks good in squircle mask
- [ ] Safe zone content visible in all masks

### Different Launchers
- [ ] Nova Launcher
- [ ] Samsung One UI Launcher
- [ ] Google Pixel Launcher
- [ ] Action Launcher

## Screen Sizes
- [ ] Small phone (5.0")
- [ ] Medium phone (6.0")
- [ ] Large phone (6.7")
- [ ] Tablet (7"+)
- [ ] Foldable devices

## Permissions
- [ ] No unnecessary permissions requested
- [ ] Storage permission works correctly
- [ ] Camera permission (if using for receipts)

## Edge Cases
- [ ] Works with Dark Mode system setting
- [ ] Works with Large Font system setting
- [ ] Works with Display Size adjustments
- [ ] Handles low memory situations
- [ ] Handles app being killed by system