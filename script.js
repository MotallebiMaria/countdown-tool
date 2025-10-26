const settingsBtn = document.getElementById('settingsBtn');
const overlay = document.getElementById('overlay');
const createBtn = document.getElementById('createBtn');
const timerDisplay = document.getElementById('timerDisplay');

let countdownInterval = null;
let curTargetDate = null;
let curBackgroundURL = null;

settingsBtn.addEventListener('click', () => {
    overlay.style.display = 'flex';
});

createBtn.addEventListener('click', () => {
    const targetDate = document.getElementById('targetDate').value;
    const backgroundFile = document.getElementById('backgroundUpload').files[0];
    const title = document.getElementById('title').value;
    const titleSize = document.querySelector('.size[data-type="title"]').value;
    const titleColor = document.querySelector('.color[data-type="title').value;
    const daySize = document.querySelector('.size[data-type="days"]').value;
    const dayColor = document.querySelector('.color[data-type="days"]').value;
    const hourSize = document.querySelector('.size[data-type="hours"]').value;
    const hourColor = document.querySelector('.color[data-type="hours"]').value;
    const minSize = document.querySelector('.size[data-type="mins"]').value;
    const minColor = document.querySelector('.color[data-type="mins"]').value;
    const secSize = document.querySelector('.size[data-type="secs"]').value;
    const secColor = document.querySelector('.color[data-type="secs"]').value;
    
    if (!targetDate) {
        alert('Please select a date and time');
        return;
    }

    curTargetDate = new Date(targetDate);

    if (countdownInterval) clearInterval(countdownInterval);
    if (curBackgroundURL) URL.revokeObjectURL(curBackgroundURL);

    if (backgroundFile) {
        curBackgroundURL = URL.createObjectURL(backgroundFile);
        setBackgroundMedia(backgroundFile.type, curBackgroundURL);
    } else clearBackground();
    
    // actual timer display
    timerDisplay.innerHTML = `
        <div class="timer draggable" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
            ${title ? `<p class="timer-title" style="font-size: ${titleSize}px; color: ${titleColor};">${title}</p>` : ""}
            <div class="time-row">
                <span class="days" style="font-size: ${daySize}px; color: ${dayColor};">0</span>d
                <span class="hours" style="font-size: ${hourSize}px; color: ${hourColor};">0</span>h
                <span class="mins" style="font-size: ${minSize}px; color: ${minColor};">0</span>m
                <span class="secs" style="font-size: ${secSize}px; color: ${secColor};">0</span>s
            </div>
        </div>
    `;

    const timerElement = timerDisplay.querySelector('.timer');
    makeDraggable(timerElement);

    startCountdown();
    
    overlay.style.display = 'none';
});

overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
        overlay.style.display = 'none';
    }
});

function startCountdown() {
    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    if (!curTargetDate) return;

    const distance = curTargetDate.getTime() - (new Date().getTime());
    if (distance < 0) {
        clearInterval(countdownInterval);
        timerDisplay.querySelector('.timer').innerHTML = "Time's up!";
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(distance % (1000 * 60 * 60 * 24) / (1000 * 60 * 60));
    const mins = Math.floor(distance % (1000 * 60 * 60) / (1000 * 60));
    const secs = Math.floor(distance % (1000 * 60) / 1000);

    const timerElement = timerDisplay.querySelector('.timer');
    timerElement.querySelector('.days').textContent = days;
    timerElement.querySelector('.hours').textContent = hours.toString().padStart(2, '0');
    timerElement.querySelector('.mins').textContent = mins.toString().padStart(2, '0');
    timerElement.querySelector('.secs').textContent = secs.toString().padStart(2, '0');
}

function setBackgroundMedia(fileType, objectUrl) {
    clearBackground();
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
}

function clearBackground() {
    const curBackground = document.querySelector('.background-container');
    if (curBackground) curBackground.remove();
}

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();

        const rect = element.getBoundingClientRect();
        const parentRect = element.offsetParent ? element.offsetParent.getBoundingClientRect() : { left: 0, top: 0 };
        element.style.left = (rect.left - parentRect.left) + 'px';
        element.style.top = (rect.top - parentRect.top) + 'px';
        element.style.transform = 'none';

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

        const newLeftRelative = newLeftViewport - parentRect.left;
        const newTopRelative = newTopViewport - parentRect.top;
        element.style.left = newLeftRelative + 'px';
        element.style.top = newTopRelative + 'px';
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}