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
    const fontSize = document.getElementById('fontSize').value;
    const fontColor = document.getElementById('fontColor').value;
    const backgroundFile = document.getElementById('backgroundUpload').files[0];
    
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
        <div class="timer" style="font-size: ${fontSize}px; color: ${fontColor};">
            <span class="days">0</span>d
            <span class="hours">0</span>h
            <span class="mins">0</span>m
            <span class="secs">0</span>s
        </div>
    `;

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