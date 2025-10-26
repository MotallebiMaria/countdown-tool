const settingsBtn = document.getElementById('settingsBtn');
const overlay = document.getElementById('overlay');
const createBtn = document.getElementById('createBtn');
const timerDisplay = document.getElementById('timerDisplay');

settingsBtn.addEventListener('click', () => {
    overlay.style.display = 'flex';
});

createBtn.addEventListener('click', () => {
    const targetDate = document.getElementById('targetDate').value;
    const fontSize = document.getElementById('fontSize').value;
    const fontColor = document.getElementById('fontColor').value;
    
    if (!targetDate) {
        alert('Please select a date and time');
        return;
    }
    
    // placeholder with basic styling
    timerDisplay.innerHTML = `
        <div class="timer" style="font-size: ${fontSize}px; color: ${fontColor};">
            Timer created for ${new Date(targetDate).toLocaleString()}
        </div>
    `;
    
    overlay.style.display = 'none';
});

overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
        overlay.style.display = 'none';
    }
});