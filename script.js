const settingsBtn = document.getElementById('settingsBtn');
const overlay = document.getElementById('overlay');
const createBtn = document.getElementById('createBtn');
const timerDisplay = document.getElementById('timerDisplay');

let countdownInterval = null;
let curTargetDate = null;
let curBackgroundURL = null;
let livePreviewInterval = null;
let curAnimations = [];
let curFontURL = null;
let curFontName = null;
let curFontFamily = null;

settingsBtn.addEventListener('click', async () => {
    overlay.style.display = 'flex';
    await storageManager.loadSavedSettings();
    setTimeout(() => previewManager.initializeLivePreview(), 100);
});

document.getElementById('backgroundUpload').addEventListener('change', async (e) => {
    const backgroundFile = e.target.files[0];
    if (backgroundFile) {
        if (curBackgroundURL) {
            URL.revokeObjectURL(curBackgroundURL);
        }
        curBackgroundURL = URL.createObjectURL(backgroundFile);
        previewManager.updateBackgroundPreview(backgroundFile.type, curBackgroundURL);
    }
});

document.getElementById('fontUpload').addEventListener('change', async (e) => {
    const fontFile = e.target.files[0];
    if (fontFile) {
        await fontManager.handleFontUpload(fontFile);
    }
});

createBtn.addEventListener('click', async () => {
    previewManager.clearPreview();
    if (livePreviewInterval) {
        clearInterval(livePreviewInterval);
        livePreviewInterval = null;
    }

    const targetDate = document.getElementById('targetDate').value;
    const backgroundFile = document.getElementById('backgroundUpload').files[0];
    const title = document.getElementById('title').value;
    const titleSize = document.querySelector('.size[data-type="title"]').value;
    const titleColor = document.querySelector('.color[data-type="title"]').value;
    const daySize = document.querySelector('.size[data-type="days"]').value;
    const dayColor = document.querySelector('.color[data-type="days"]').value;
    const hourSize = document.querySelector('.size[data-type="hours"]').value;
    const hourColor = document.querySelector('.color[data-type="hours"]').value;
    const minSize = document.querySelector('.size[data-type="mins"]').value;
    const minColor = document.querySelector('.color[data-type="mins"]').value;
    const secSize = document.querySelector('.size[data-type="secs"]').value;
    const secColor = document.querySelector('.color[data-type="secs"]').value;
    const animationSpeed = document.getElementById('animationSpeed').value;
    const selectedAnimation = document.querySelector('input[name="animation"]:checked')?.dataset.animation || '';
    
    if (!targetDate) {
        alert('Please select a date and time');
        return;
    }

    curTargetDate = new Date(targetDate);
    curAnimations = selectedAnimation ? [selectedAnimation] : [];

    if (countdownInterval) clearInterval(countdownInterval);
    if (curBackgroundURL) {
        URL.revokeObjectURL(curBackgroundURL);
        curBackgroundURL = null;
    }

    if (backgroundFile) {
        try {
            await storageManager.saveBackground(backgroundFile);
            curBackgroundURL = URL.createObjectURL(backgroundFile);
            countdownManager.setBackgroundMedia(backgroundFile.type, curBackgroundURL);
        } catch (err) {
            console.error('Failed saving background to IndexedDB', err);
            // fallback: still show background from file URL
            curBackgroundURL = URL.createObjectURL(backgroundFile);
            countdownManager.setBackgroundMedia(backgroundFile.type, curBackgroundURL);
        }
    } else {
        const saved = storageManager.loadSettings();
        if (saved && saved.hasBackground) {
            try {
                const stored = await storageManager.getBackground();
                if (stored && stored.blob) {
                    curBackgroundURL = URL.createObjectURL(stored.blob);
                    countdownManager.setBackgroundMedia(stored.type || stored.blob.type, curBackgroundURL);
                } else {
                    countdownManager.clearBackground();
                }
            } catch (err) {
                console.error('Failed to load background from IndexedDB', err);
                countdownManager.clearBackground();
            }
        } else {
            countdownManager.clearBackground();
        }
    }

    const settings = {
        targetDate: targetDate,
        title: title,
        titleSize: titleSize,
        titleColor: titleColor,
        daySize: daySize,
        dayColor: dayColor,
        hourSize: hourSize,
        hourColor: hourColor,
        minSize: minSize,
        minColor: minColor,
        secSize: secSize,
        secColor: secColor,
        hasBackground: !!backgroundFile || !!(storageManager.loadSettings() && storageManager.loadSettings().hasBackground),
        animation: selectedAnimation,
        animationSpeed: animationSpeed
    };

    await storageManager.saveSettings(settings);

    const animationClasses = selectedAnimation || '';
    const animationStyle = selectedAnimation ? `animation-duration: ${2 - animationSpeed}s;` : '';

    // actual timer display
    timerDisplay.innerHTML = `
        <div class="timer draggable ${animationClasses}" style="position: relative; ${animationStyle}; ${curFontFamily ? `font-family: ${curFontFamily}` : ''}">
            ${title ? `<p class="timer-title" style="font-size: ${titleSize}px; color: ${titleColor}; ${curFontFamily ? `font-family: ${curFontFamily}` : ''}">${title}</p>` : ""}
            <div class="time-row">
                <span class="days" style="font-size: ${daySize}px; color: ${dayColor}; ${curFontFamily ? `font-family: ${curFontFamily}` : ''}">0</span>d
                <span class="hours" style="font-size: ${hourSize}px; color: ${hourColor}; ${curFontFamily ? `font-family: ${curFontFamily}` : ''}">0</span>h
                <span class="mins" style="font-size: ${minSize}px; color: ${minColor}; ${curFontFamily ? `font-family: ${curFontFamily}` : ''}">0</span>m
                <span class="secs" style="font-size: ${secSize}px; color: ${secColor}; ${curFontFamily ? `font-family: ${curFontFamily}` : ''}">0</span>s
            </div>
        </div>
    `;

    const timerElement = timerDisplay.querySelector('.timer');
    countdownManager.makeDraggable(timerElement);

    countdownManager.startCountdown();
    
    overlay.style.display = 'none';
});

overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
        overlay.style.display = 'none';
        previewManager.clearPreview();
    }
});


const countdownManager = {
    startCountdown() {
        countdownManager.updateCountdown();
        countdownInterval = setInterval(countdownManager.updateCountdown, 1000);
    },

    updateCountdown() {
        if (!curTargetDate) return;

        const distance = curTargetDate.getTime() - (new Date().getTime());
        if (distance < 0) {
            clearInterval(countdownInterval);
            const t = timerDisplay.querySelector('.timer');
            if (t) t.innerHTML = "Time's up!";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(distance % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
        const mins = Math.floor(distance % (1000 * 60 * 60) / (1000 * 60));
        const secs = Math.floor(distance % (1000 * 60) / 1000);

        const timerElement = timerDisplay.querySelector('.timer');
        if (!timerElement) return;
        const daysEl = timerElement.querySelector('.days');
        const hoursEl = timerElement.querySelector('.hours');
        const minsEl = timerElement.querySelector('.mins');
        const secsEl = timerElement.querySelector('.secs');
        if (daysEl) daysEl.textContent = days;
        if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
        if (minsEl) minsEl.textContent = mins.toString().padStart(2, '0');
        if (secsEl) secsEl.textContent = secs.toString().padStart(2, '0');
    },

    setBackgroundMedia(fileType, objectUrl) {
        countdownManager.clearBackground();
        const backgroundContainer = document.createElement('div');
        backgroundContainer.className = 'background-container';
        let mediaElement;

        if (fileType.startsWith('video/')) {
            mediaElement = document.createElement('video');
            mediaElement.autoplay = true;
            mediaElement.loop = true;
            mediaElement.muted = true;
            mediaElement.playsInline = true;
        } else if (fileType.startsWith('image/')) {
            mediaElement = document.createElement('img');
        }
        
        if (mediaElement) {
            mediaElement.src = objectUrl;
            mediaElement.alt = 'Countdown background';
            mediaElement.className = 'background-media';
            backgroundContainer.appendChild(mediaElement);
            document.querySelector('.main-area').appendChild(backgroundContainer);
        }
    },

    clearBackground() {
        const curBackground = document.querySelector('.background-container');
        if (curBackground) curBackground.remove();
    },

    makeDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        let originalTransform = '';
        let removedAnimationClass = '';

        element.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();

            // remove animations during drag & remember which one was removed
            originalTransform = element.style.transform || '';
            const animationClasses = ['fadeIn', 'bounce', 'pulse'];
            for (const cls of animationClasses) {
                if (element.classList.contains(cls)) {
                    element.classList.remove(cls);
                    removedAnimationClass = cls;
                }
            }
            element.style.transform = 'none';
            element.style.animationDuration = '';

            const rect = element.getBoundingClientRect();
            const parentRect = element.offsetParent ? element.offsetParent.getBoundingClientRect() : { left: 0, top: 0 };

            const currentLeft = parseFloat(element.style.left) || (rect.left - parentRect.left);
            const currentTop = parseFloat(element.style.top) || (rect.top - parentRect.top);

            element.style.left = currentLeft + 'px';
            element.style.top = currentTop + 'px';

            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();

            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            const elemRect = element.getBoundingClientRect();
            const parentRect = element.offsetParent ? element.offsetParent.getBoundingClientRect() : { left: 0, top: 0 };

            let newLeftViewport = elemRect.left - pos1;
            let newTopViewport = elemRect.top - pos2;

            // boundaries so timer can't be dragged out of view
            const maxLeft = window.innerWidth - elemRect.width;
            const maxTop = window.innerHeight - elemRect.height;
            const topBar = document.querySelector('.top-bar');
            const minTopViewport = topBar ? topBar.getBoundingClientRect().bottom : 0;

            newLeftViewport = Math.max(0, Math.min(newLeftViewport, maxLeft));
            newTopViewport = Math.max(minTopViewport, Math.min(newTopViewport, maxTop));

            // convert viewport coordinates to relative coordinates within main area
            const newLeftRelative = newLeftViewport - parentRect.left;
            const newTopRelative = newTopViewport - parentRect.top;
            element.style.left = newLeftRelative + 'px';
            element.style.top = newTopRelative + 'px';
        }

        function closeDragElement() {
            // restore animation & transform after dragging
            if (removedAnimationClass) {
                element.classList.add(removedAnimationClass);
            } else {
                // if no animation was removed, check for selected animation
                const selectedAnimation = document.querySelector('input[name="animation"]:checked')?.dataset.animation || '';
                if (selectedAnimation) {
                    element.classList.add(selectedAnimation);
                }
            }

            if (originalTransform && !originalTransform.includes('scale')) {
                element.style.transform = originalTransform;
            } else {
                element.style.transform = '';
            }

            const animationSpeed = document.getElementById('animationSpeed').value;
            const activeAnimation = element.classList.contains('fadeIn') || element.classList.contains('bounce') || element.classList.contains('pulse');
            if (activeAnimation) {
                element.style.animationDuration = `${2 - animationSpeed}s`;
            } else {
                element.style.animationDuration = '';
            }

            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
};

const previewManager = {
    curPreviewBackgroundURL: null,

    updateBackgroundPreview(fileType, objectUrl) {
        const previewContainer = document.getElementById('livePreview');
        if (!previewContainer) return;

        const existingBg = previewContainer.querySelector('.background-container');
        if (existingBg) {
            existingBg.remove();
        }

        if (this.curPreviewBackgroundURL) {
            URL.revokeObjectURL(this.curPreviewBackgroundURL);
        }

        const bgContainer = document.createElement('div');
        bgContainer.className = 'background-container';
        bgContainer.style.position = 'absolute';
        bgContainer.style.top = '0';
        bgContainer.style.left = '0';
        bgContainer.style.width = '100%';
        bgContainer.style.height = '100%';
        bgContainer.style.zIndex = '-1';

        let mediaEl;
        if (fileType.startsWith('video/')) {
            mediaEl = document.createElement('video');
            mediaEl.autoplay = true;
            mediaEl.loop = true;
            mediaEl.muted = true;
            mediaEl.playsInline = true;
        } else if (fileType.startsWith('image/')) {
            mediaEl = document.createElement('img');
        }

        if (mediaEl) {
            this.curPreviewBackgroundURL = objectUrl;
            mediaEl.src = objectUrl;
            mediaEl.className = 'background-media';
            mediaEl.style.objectFit = 'cover';
            mediaEl.style.width = '100%';
            mediaEl.style.height = '100%';
            bgContainer.appendChild(mediaEl);
            previewContainer.appendChild(bgContainer);
        }
    },

    async initializeLivePreview() {
        previewManager.clearPreview();
        
        const previewContainer = document.getElementById('livePreview');
        if (!previewContainer) return;
        
        previewContainer.innerHTML = `
            <div class="preview-timer">
                <p class="preview-title">Preview Title</p>
                <div class="preview-time-row">
                    <span class="preview-days">05</span>d
                    <span class="preview-hours">12</span>h
                    <span class="preview-mins">30</span>m
                    <span class="preview-secs">45</span>s
                </div>
            </div>
        `;
        
        try {
            const stored = await storageManager.getBackground();
            if (stored && stored.blob) {
                // clean up any previous background URL
                if (this.currentPreviewBackgroundURL) {
                    URL.revokeObjectURL(this.currentPreviewBackgroundURL);
                    this.currentPreviewBackgroundURL = null;
                }

                const bgContainer = document.createElement('div');
                bgContainer.className = 'background-container';
                bgContainer.style.position = 'absolute';
                bgContainer.style.top = '0';
                bgContainer.style.left = '0';
                bgContainer.style.width = '100%';
                bgContainer.style.height = '100%';
                bgContainer.style.zIndex = '-1';

                let mediaEl;
                const type = stored.type || stored.blob.type || '';
                if (type.startsWith('video/')) {
                    mediaEl = document.createElement('video');
                    mediaEl.autoplay = true;
                    mediaEl.loop = true;
                    mediaEl.muted = true;
                    mediaEl.playsInline = true;
                } else if (type.startsWith('image/')) {
                    mediaEl = document.createElement('img');
                }

                if (mediaEl) {
                    this.curPreviewBackgroundURL = URL.createObjectURL(stored.blob);
                    mediaEl.src = this.curPreviewBackgroundURL;
                    mediaEl.className = 'background-media';
                    mediaEl.style.objectFit = 'cover';
                    mediaEl.style.width = '100%';
                    mediaEl.style.height = '100%';
                    bgContainer.appendChild(mediaEl);
                    previewContainer.appendChild(bgContainer);
                }
            }
        } catch (err) {
            console.error('Failed to load preview background from IndexedDB', err);
        }

        previewManager.updateLivePreview();
        livePreviewInterval = setInterval(previewManager.updateLivePreview, 100);
    },
    
    updateLivePreview() {
        const preview = document.getElementById('livePreview');
        if (!preview) return;
        
        const title = document.getElementById('title').value || 'Preview Title';
        const titleSize = document.querySelector('.size[data-type="title"]').value;
        const titleColor = document.querySelector('.color[data-type="title"]').value;
        const daySize = document.querySelector('.size[data-type="days"]').value;
        const dayColor = document.querySelector('.color[data-type="days"]').value;
        const hourSize = document.querySelector('.size[data-type="hours"]').value;
        const hourColor = document.querySelector('.color[data-type="hours"]').value;
        const minSize = document.querySelector('.size[data-type="mins"]').value;
        const minColor = document.querySelector('.color[data-type="mins"]').value;
        const secSize = document.querySelector('.size[data-type="secs"]').value;
        const secColor = document.querySelector('.color[data-type="secs"]').value;
        
        const animationSpeed = document.getElementById('animationSpeed').value;
        const selectedAnimation = document.querySelector('input[name="animation"]:checked')?.dataset.animation || '';
        
        const previewTimer = preview.querySelector('.preview-timer');
        if (previewTimer) {
            previewTimer.classList.remove('fadeIn', 'bounce', 'pulse');
            
            if (selectedAnimation) {
                previewTimer.classList.add(selectedAnimation);
            }
            
            if (selectedAnimation) {
                previewTimer.style.animationDuration = `${2 - animationSpeed}s`;
            } else {
                previewTimer.style.animationDuration = '';
            }

             if (curFontFamily) {
                previewTimer.style.fontFamily = curFontFamily;
            } else {
                previewTimer.style.fontFamily = '';
            }
        }

        const titleEl = preview.querySelector('.preview-title');
        const daysEl = preview.querySelector('.preview-days');
        const hoursEl = preview.querySelector('.preview-hours');
        const minsEl = preview.querySelector('.preview-mins');
        const secsEl = preview.querySelector('.preview-secs');
        
        if (titleEl) {
            titleEl.textContent = title;
            const relativeTitleSize = Math.min(titleSize / 50, 3);
            titleEl.style.fontSize = relativeTitleSize + 'em';
            titleEl.style.color = titleColor;

            if (curFontFamily) hoursEl.style.fontFamily = curFontFamily;
            else hoursEl.style.fontFamily = '';
        }
        
        if (daysEl) {
            const relativeDaySize = Math.min(daySize / 50, 3);
            daysEl.style.fontSize = relativeDaySize + 'em';
            daysEl.style.color = dayColor;

            if (curFontFamily) hoursEl.style.fontFamily = curFontFamily;
            else hoursEl.style.fontFamily = '';
        }
        
        if (hoursEl) {
            const relativeHourSize = Math.min(hourSize / 50, 3);
            hoursEl.style.fontSize = relativeHourSize + 'em';
            hoursEl.style.color = hourColor;

            if (curFontFamily) hoursEl.style.fontFamily = curFontFamily;
            else hoursEl.style.fontFamily = '';
        }
        
        if (minsEl) {
            const relativeMinSize = Math.min(minSize / 50, 3);
            minsEl.style.fontSize = relativeMinSize + 'em';
            minsEl.style.color = minColor;

            if (curFontFamily) hoursEl.style.fontFamily = curFontFamily;
            else hoursEl.style.fontFamily = '';
        }
        
        if (secsEl) {
            const relativeSecSize = Math.min(secSize / 50, 3);
            secsEl.style.fontSize = relativeSecSize + 'em';
            secsEl.style.color = secColor;

            if (curFontFamily) hoursEl.style.fontFamily = curFontFamily;
            else hoursEl.style.fontFamily = '';
        }
    },

    clearPreview() {
        if (this.currentPreviewBackgroundURL) {
            URL.revokeObjectURL(this.currentPreviewBackgroundURL);
            this.currentPreviewBackgroundURL = null;
        }
        const existingPreview = document.getElementById('livePreview');
        if (existingPreview) {
            existingPreview.innerHTML = ''; 
        }
        if (livePreviewInterval) {
            clearInterval(livePreviewInterval);
            livePreviewInterval = null;
        }
    }    
};

const storageManager = {
    _dbName: 'countdownDB',
    _storeName: 'backgrounds',

    _openDB() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(this._dbName, 1);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this._storeName)) {
                    db.createObjectStore(this._storeName, { keyPath: 'id' });
                }
            };
            req.onsuccess = (e) => resolve(e.target.result);
            req.onerror = (e) => reject(e.target.error);
        });
    },

    async saveBackground(file) {
        if (!file) return;
        const db = await this._openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this._storeName, 'readwrite');
            const store = tx.objectStore(this._storeName);
            const entry = { id: 'bg', blob: file, type: file.type || '', timestamp: Date.now() };
            const req = store.put(entry);
            req.onsuccess = () => resolve();
            req.onerror = (e) => reject(e.target.error);
        });
    },

    async getBackground() {
        const db = await this._openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this._storeName, 'readonly');
            const store = tx.objectStore(this._storeName);
            const req = store.get('bg');
            req.onsuccess = (e) => resolve(e.target.result || null);
            req.onerror = (e) => reject(e.target.error);
        });
    },

    async deleteBackground() {
        const db = await this._openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this._storeName, 'readwrite');
            const store = tx.objectStore(this._storeName);
            const req = store.delete('bg');
            req.onsuccess = () => resolve();
            req.onerror = (e) => reject(e.target.error);
        });
    },

    // save settings to localStorage (keeps small metadata). async return to allow callers to await background work.
    async saveSettings(settings) {
        try {
            localStorage.setItem('countdownSettings', JSON.stringify(settings));
            console.log('Settings saved:', settings);
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    },

    loadSettings() {
        try {
            const saved = localStorage.getItem('countdownSettings');
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Failed to load settings:', error);
            return null;
        }
    },

    clearSettings() {
        try {
            localStorage.removeItem('countdownSettings');
        } catch (error) {
            console.error('Failed to clear settings:', error);
        }
    },

    // load saved settings into the form; also does not automatically attach background to main area (preview handles that)
    async loadSavedSettings() {
        const saved = this.loadSettings();
        if (saved) {
            document.getElementById('title').value = saved.title || '';
            document.getElementById('targetDate').value = saved.targetDate || '';

            document.querySelector('.size[data-type="title"]').value = saved.titleSize || '32';
            document.querySelector('.color[data-type="title"]').value = saved.titleColor || '#ffffff';
            document.querySelector('.size[data-type="days"]').value = saved.daySize || '40';
            document.querySelector('.color[data-type="days"]').value = saved.dayColor || '#ff6b6b';
            document.querySelector('.size[data-type="hours"]').value = saved.hourSize || '40';
            document.querySelector('.color[data-type="hours"]').value = saved.hourColor || '#4ecdc4';
            document.querySelector('.size[data-type="mins"]').value = saved.minSize || '40';
            document.querySelector('.color[data-type="mins"]').value = saved.minColor || '#45b7d1';
            document.querySelector('.size[data-type="secs"]').value = saved.secSize || '40';
            document.querySelector('.color[data-type="secs"]').value = saved.secColor || '#96ceb4';

            document.querySelectorAll('input[name="animation"]').forEach(radio => {
                radio.checked = radio.value === 'none';
            });
            
            if (saved.animation) {
                const radio = document.querySelector(`input[data-animation="${saved.animation}"]`);
                if (radio) {
                    radio.checked = true;
                }
            }

            if (saved.animationSpeed) {
                document.getElementById('animationSpeed').value = saved.animationSpeed;
            }

            console.log('Loaded saved settings:', saved);
            return saved;
        }
        return null;
    },

    // clear both localStorage and the stored background blob
    async resetSettings() {
        if (confirm('Clear all saved settings?')) {
            this.clearSettings();
            try {
                await this.deleteBackground();
            } catch (err) {
                console.warn('Failed to delete background from IndexedDB', err);
            }
            await fontManager.removeFont();
            location.reload();
        }
    },

    async saveFont(fontFile) {
        if (!fontFile) return;
        const db = await this._openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this._storeName, 'readwrite');
            const store = tx.objectStore(this._storeName);
            const entry = { 
                id: 'font', 
                blob: fontFile, 
                type: fontFile.type || '', 
                name: fontFile.name,
                timestamp: Date.now() 
            };
            const req = store.put(entry);
            req.onsuccess = () => resolve();
            req.onerror = (e) => reject(e.target.error);
        });
    },

    async getFont() {
        const db = await this._openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this._storeName, 'readonly');
            const store = tx.objectStore(this._storeName);
            const req = store.get('font');
            req.onsuccess = (e) => resolve(e.target.result || null);
            req.onerror = (e) => reject(e.target.error);
        });
    },

    async deleteFont() {
        const db = await this._openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(this._storeName, 'readwrite');
            const store = tx.objectStore(this._storeName);
            const req = store.delete('font');
            req.onsuccess = () => resolve();
            req.onerror = (e) => reject(e.target.error);
        });
    },
};

const fontManager = {
    async handleFontUpload(fontFile) {
        if (!fontFile.name.toLowerCase().endsWith('.ttf') && 
            !fontFile.name.toLowerCase().endsWith('.otf')) {
            alert('Please upload a .ttf or .otf font file');
            return;
        }

        if (curFontURL) {
            URL.revokeObjectURL(curFontURL);
            curFontURL = null;
        }

        curFontURL = URL.createObjectURL(fontFile);
        curFontName = fontFile.name.replace(/\.[^/.]+$/, ""); // remove extension
        curFontFamily = `custom-font-${Date.now()}`;

        await this.loadFont(fontFile, curFontFamily);

        this.updateFontPreview();
        
        previewManager.updateLivePreview();
        
        await storageManager.saveFont(fontFile);
    },

    async loadFont(fontFile, fontFamily) {
        return new Promise((resolve, reject) => {
            const font = new FontFace(fontFamily, `url(${URL.createObjectURL(fontFile)})`);
            
            font.load().then(() => {
                document.fonts.add(font);
                resolve();
            }).catch(err => {
                console.error('Failed to load font:', err);
                reject(err);
            });
        });
    },

    updateFontPreview() {
        const fontPreview = document.getElementById('fontPreview');
        if (fontPreview && curFontName) {
            fontPreview.innerHTML = `
                <div>
                    <div class="font-name">${curFontName}</div>
                    <p class="font-sample" style="font-family: ${curFontFamily}">Sample Text</p>
                    <button class="remove-font" onclick="fontManager.removeFont()">Remove Font</button>
                </div>
            `;
            fontPreview.classList.add('active');
        }
    },

    async removeFont() {
        if (curFontURL) {
            URL.revokeObjectURL(curFontURL);
            curFontURL = null;
        }
        curFontName = null;
        curFontFamily = null;

        const fontPreview = document.getElementById('fontPreview');
        if (fontPreview) {
            fontPreview.innerHTML = '<p>No font selected</p>';
            fontPreview.classList.remove('active');
        }

        document.getElementById('fontUpload').value = '';

        previewManager.updateLivePreview();
        
        await storageManager.deleteFont();
    },

    async loadSavedFont() {
        try {
            const stored = await storageManager.getFont();
            if (stored && stored.blob) {
                const fontFile = new File([stored.blob], stored.name || 'custom-font', {
                    type: stored.type
                });
                
                await this.handleFontUpload(fontFile);
            }
        } catch (err) {
            console.error('Failed to load font from storage:', err);
        }
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    const saved = await storageManager.loadSavedSettings();
    await fontManager.loadSavedFont();
    if (saved && saved.targetDate) {
        setTimeout(() => {
            createBtn.click();
        }, 500);
    }
});