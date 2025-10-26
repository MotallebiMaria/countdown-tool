# countdown-tool
A customizable countdown timer with video/image backgrounds and styling controls

## Features Implemented
### Tier 1 - Core Features
- **Date Selection** - Choose target date & time
- **Live Countdown Timer** - Real-time updating time
- **Background Upload** - Support for MP4 videos and JEPG/PNG images
- **Basic Styling Controls** - Font size & color controls

### Tier 2 - Extended Features
- **Individual Styling Controls** - Separate size and color for:
  - Title text
  - Days display
  - Hours display  
  - Minutes display
  - Seconds display
- **Draggable Text** - Click and drag timer to any position on screen
- **Live Preview** - Real-time styling preview in overlay

## Technical Implementation

### Key Technical Challenges

#### 1. Draggable Element with Boundary Constraints
```javascript
// Challenge: Preventing timer from being dragged off-screen
// Solution: Calculate dynamic boundaries based on element and viewport dimensions
const boundaries = getBoundaries(element);
newLeft = Math.max(boundaries.minLeft, Math.min(boundaries.maxLeft, newLeft));
```

## Design Decisions
I chose vanilla JavaScript to demonstrate my understanding of DOM manipulation and browser APIs without framework abstractions. While I'm comfortable with React, I wanted to show I can build complex features from fundamentals.

## Live Demo
https://motallebimaria.github.io/countdown-tool/