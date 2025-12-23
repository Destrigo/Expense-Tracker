# Mobile App Testing Checklist

## PWA Installation
- [ ] Install prompt appears on supported browsers
- [ ] App installs to home screen correctly
- [ ] App icon displays properly
- [ ] Splash screen shows on launch
- [ ] App opens in standalone mode (no browser UI)

## Offline Functionality
- [ ] App loads when offline
- [ ] Can add expenses offline
- [ ] Can view expenses offline
- [ ] Data persists across sessions
- [ ] Service worker caching works

## Mobile Experience
- [ ] Touch targets are appropriately sized (min 44x44px)
- [ ] Gestures work smoothly (scroll, swipe, tap)
- [ ] No horizontal scrolling
- [ ] Content fits within safe area (notches, etc.)
- [ ] Keyboard doesn't obscure input fields
- [ ] Bottom navigation is accessible

## Performance
- [ ] App loads in under 3 seconds
- [ ] Smooth 60fps animations
- [ ] No janky scrolling
- [ ] Small bundle size (check with `npm run build`)

## Data Management
- [ ] localStorage is used correctly
- [ ] No data loss on app close
- [ ] Export to CSV works
- [ ] Clear data works properly

## Cross-Device Testing
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Various screen sizes
- [ ] Portrait and landscape orientations