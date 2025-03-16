const VOLUME_UP_KEY = 'ArrowUp';
const VOLUME_DOWN_KEY = 'ArrowDown';
const MUTE_TOGGLE_KEY = 'm';
const VOLUME_STEP = 0.05;
// Get the Twitch player instance
let twitchPlayer = null
let volume = 0;
function run() {
    twitchPlayer = getTwitchPlayer();
    setUpVolumeText()
}
document.addEventListener("DOMContentLoaded", run);
// Add event listener for keypresses
document.addEventListener('keydown', function(event) {
    // Only proceed if we're not typing in an input field
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable) {
        return;
    }

    if (!twitchPlayer) {
        twitchPlayer = getTwitchPlayer();
    }
    
    // Handle volume control based on keypresses
    switch (event.key) {
        case VOLUME_UP_KEY:
            // Increase volume
            const newVolumeUp = Math.min(1, twitchPlayer.getVolume() + VOLUME_STEP);
            changeVolumeText(newVolumeUp)
            twitchPlayer.setVolume(newVolumeUp);
            event.preventDefault();
            break;

        case VOLUME_DOWN_KEY:
            // Decrease volume
            const newVolumeDown = Math.max(0, twitchPlayer.getVolume() - VOLUME_STEP);
            changeVolumeText(newVolumeDown)
            twitchPlayer.setVolume(newVolumeDown);
            event.preventDefault();
            break;

        case MUTE_TOGGLE_KEY:
            // Toggle mute state
            twitchPlayer.setMuted(!twitchPlayer.getMuted());
            event.preventDefault();
            break;
    }
});
function changeVolumeText(volume) {
    const volumeText = document.body.querySelector(".volumeText")
    volumeText.innerText = parseInt(volume * 100)
    volumeText.classList.add("active")
    setTimeout(() => {
    volumeText.classList.remove("active")
    }, 1000);
}
function setUpVolumeText(){
    let html = document.createElement("span");
    html.classList.add('volumeText');
    html.innerText = "100"
    document.body.append(html)
}
// Helper function to get the Twitch player instance
function getTwitchPlayer() {
    // For embedded players
    if (window.Twitch && window.Twitch.Player) {
        const playerElements = document.querySelectorAll('[data-a-target="player-overlay-click-handler"]');
        if (playerElements.length > 0) {
            // Find the player in the Twitch objects
            const videoController = findReactComponent(playerElements[0], 'VideoPlayerController');
            if (videoController && videoController.props && videoController.props.mediaPlayerInstance) {
                return videoController.props.mediaPlayerInstance;
            }
        }
    }

    // Alternative method - access player through DOM
    const video = document.querySelector('video');
    if (video) {
        return {
            getVolume: () => video.volume,
            setVolume: (vol) => { video.volume = vol; },
            getMuted: () => video.muted,
            setMuted: (mute) => { video.muted = mute; }
        };
    }

    return null;
}

// Helper function to find React component
function findReactComponent(element, targetName) {
    const keys = Object.keys(element);
    for (const key of keys) {
        if (key.startsWith('__reactInternalInstance$')) {
            let fiber = element[key];
            let node = fiber;

            while (fiber) {
                if (fiber.type && typeof fiber.type === 'function' &&
                    fiber.type.displayName === targetName) {
                    return fiber.stateNode;
                }

                if (fiber.child) {
                    fiber = fiber.child;
                } else if (fiber.sibling) {
                    fiber = fiber.sibling;
                } else {
                    while (fiber.return) {
                        fiber = fiber.return;
                        if (fiber.sibling) {
                            fiber = fiber.sibling;
                            break;
                        }
                    }
                }

                if (fiber === node) {
                    break;
                }
            }
        }
    }

    return null;
}