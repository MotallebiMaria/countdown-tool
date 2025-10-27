# Countdown Tool

A highly customizable countdown timer that allows you to set a target date and time, upload your own background (image or video) and font, and style every aspect of the timer text. The timer is draggable and comes with animation effects.

## Features

### Tier 1 - Core Features
- **Date Selection**: Choose a target date and time for the countdown
- **Live Countdown Timer**: Real-time updating display of days, hours, minutes, and seconds
- **Background Upload**: Support for MP4 videos and JPEG/PNG images as backgrounds
- **Basic Styling Controls**: Adjust the font size and color for the entire countdown

### Tier 2 - Extended Features  
- **Individual Styling Controls**: Separate size and color controls for:
  - Title text
  - Days, hours, minutes, and seconds display
- **Draggable Text**: Click and drag the timer to any position on screen
- **Live Preview**: See your styling changes in real-time in the overlay preview

### Tier 3 - Optional Enhancements
- **Font Upload**: Upload your own .ttf or .otf font files to use in the timer
- **Save & Reload Settings**: Your settings (including background and font) are automatically saved and reloaded when you return
- **Animation Options**: Choose from fade-in (only once), bouncing, or pulsating effects for the timer

## Technical Implementation

### Architecture
The application is built with vanilla JavaScript, HTML, and CSS. I chose to avoid frameworks to demonstrate fundamental web development skills and keep the project lightweight. The code is organized into several manager modules for clarity:

- **countdownManager**: Handles the countdown logic and draggable functionality
- **previewManager**: Manages the live preview in the overlay  
- **storageManager**: Handles saving and loading settings
- **fontManager**: Manages custom font uploads and application
- **uploadManager**: Handles background uploads and previews

### Key Technical Challenges

#### Draggable Text with Boundary Constraints
One of the most challenging aspects was implementing the draggable functionality while keeping the timer within the visible screen area. The initial approach used `getBoundingClientRect()` which provided coordinates relative to the viewport, but this caused issues with the timer going off-screen or stopping prematurely.

**Final Solution**: I implemented a coordinate transformation system that:
1. Converts viewport coordinates to relative coordinates within the main container
2. Dynamically calculates boundaries based on the timer element's dimensions and the main area
3. Accounts for the top bar to prevent the timer from being dragged behind it
4. Removes animations during dragging and restores them afterward for smooth interaction

The boundary calculation ensures the timer stops exactly when its edges reach the screen boundaries, providing a polished user experience.

#### Storage Strategy for Large Files
The project specification mentioned using localStorage for saving settings. However, localStorage has size limitations (typically 5-10MB, I believe) and isn't suitable for storing large files like videos or high-resolution images.

**My Approach**: I implemented a hybrid storage system:
- **localStorage**: For small settings data (colors, sizes, animation preferences)
- **IndexedDB**: For large binary files (background images/videos, font files)

This approach allows users to save their entire countdown setup (including custom media) without hitting storage limits, while maintaining fast access to styling preferences. The application automatically loads the previous countdown when users return to the page.

#### Animation System
I initially planned to allow multiple simultaneous animations (like pulsating while bouncing), but this created visual conflicts and performance issues. After testing, I decided to implement a single-animation system that:
- Provides clear, distinct visual effects
- Maintains smooth performance
- Allows speed customization via a dedicated control
- Pauses during dragging for better user experience
  - Not pausing during dragging was causing unpredictable movements

This focused approach resulted in a more polished final product.

### Design Decisions

#### Why Vanilla JavaScript?
While I'm comfortable with React and could have used it for this project, I chose vanilla JavaScript to:
- Demonstrate understanding of DOM manipulation and browser APIs
- Keep the project lightweight with zero dependencies
- Show that I can build complex features without framework abstractions
- Ensure the application could run anywhere without build steps

For a production application at scale, I would use React for better state management and component reusability.

#### User Experience Focus
Several features were designed with user experience in mind:
- **Live Preview**: Users can see exactly how their timer will look before creating it
- **Drag & Drop Uploads**: More intuitive than traditional file inputs
- **Responsive Layout**: Works on both desktop and mobile devices
- **Auto-save**: Settings persist automatically without manual saving

#### Feature Prioritization
I initially planned to support multiple simultaneous timers with a sidebar list, but decided to focus on making a single timer experience exceptionally polished. This trade-off allowed me to implement all Tier 1-3 requirements with high quality rather than spreading effort too thin.

#### Production Optimization
If this were to become a real production application, I would consider the following improvements:

**Performance:**
- Lazy Loading: Only load heavy assets (videos, large images) when needed
- Code Splitting: Separate configuration UI from timer display for faster initial load
- Asset Optimization: Automatic compression of uploaded images/videos

**Architecture:**
- React/Vue Migration: For better state management and component reusability
- Backend API: For user accounts, template sharing, and cloud storage
- Progressive Web App: Offline functionality and mobile app-like experience

**User Experience:**
- Template System: Pre-designed countdown styles for quick setup

**Technical Debt:**
- Testing Suite: Unit tests for countdown calculations and integration tests for UI
- Error Boundaries: More graceful handling of corrupted uploads or invalid dates
- Accessibility: Full WCAG compliance for users with disabilities

## Live Demo

[Live Demo on GitHub Pages](https://motallebimaria.github.io/countdown-tool/)

## How to Use

1. Click the "Create" button in the top bar
2. Set a title (optional) and choose your target date/time
3. Upload a background image/video and/or custom font if desired
4. Use the styling controls to adjust the appearance (color & size) of each text element
5. Choose an animation effect and adjust its speed
6. Watch the live preview update as you make changes
7. Click "Create Timer" to see your countdown in action
8. Drag the timer to reposition it on the screen

Your settings will be automatically saved and restored when you return to the page.

## Browser Compatibility

This tool works in modern browsers that support:
- ES6+ JavaScript features
- CSS Grid and Flexbox
- IndexedDB API
- The Font Face API

## Future Enhancements

Given more time, I would consider:
- Multiple simultaneous timers
- Export functionality to package timers as standalone HTML files
- More advanced animation combinations
- Template system for quick styling
- Social sharing features

## License

MIT