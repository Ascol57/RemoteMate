const host = window.location.hostname;

const config = {
    apiUrl: `https://${host}/`,
    buttons: []
};

async function sendButtonPress(name) {
    const response = await fetch(`${config.apiUrl}plugins/remote/buttons/press?button=${encodeURIComponent(name)}`, {
        method: 'POST'
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    if (response.status === 204) {
        console.log(`Button ${name} pressed successfully`);
        return;
    }
}

async function getButtons() {
    const response = await fetch(`${config.apiUrl}plugins/remote/buttons`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    console.log('Fetched data:', data); // Add this line to inspect the structure
    // If the API returns { buttons: [...] }, return data.buttons
    return Array.isArray(data) ? data : data.buttons;
}

window.addEventListener('DOMContentLoaded', async () => {
    const buttonContainer = document.querySelector('.button-container');
    const reloadBtn = document.querySelector('.reload-btn');
    reloadBtn.addEventListener('click', async () => {
        buttonContainer.innerHTML = '';
        await loadButtons();
    });
    async function loadButtons() {
        config.buttons = await getButtons();
        config.buttons.forEach(button => {
            const buttonElement = document.createElement('button');
            buttonElement.textContent = button;
            buttonElement.addEventListener('click', () => sendButtonPress(button));
            buttonContainer.appendChild(buttonElement);
        });
    }
    await loadButtons();

    // Plein écran
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', () => {
            const elem = document.documentElement;
            if (!document.fullscreenElement) {
                if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                } else if (elem.mozRequestFullScreen) { /* Firefox */
                    elem.mozRequestFullScreen();
                } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
                    elem.webkitRequestFullscreen();
                } else if (elem.msRequestFullscreen) { /* IE/Edge */
                    elem.msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
        });
    }
});