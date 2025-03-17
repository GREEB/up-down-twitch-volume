const VOLUME_UP_KEY = 'ArrowUp';
const VOLUME_DOWN_KEY = 'ArrowDown';
const VOLUME_STEP = 0.05;
let twitchPlayer = null;
let removeTimeout = null;

function run() {
	twitchPlayer = getTwitchPlayer();
	waitForElm('.persistent-player').then(() => {
		setUpVolumeText();
	});
}

document.addEventListener('DOMContentLoaded', run);
document.addEventListener('keydown', event => {
	if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable) {
		return;
	}

	twitchPlayer = getTwitchPlayer();

	switch (event.key) {
		case VOLUME_UP_KEY: {
			const newVolumeUp = Math.min(1, twitchPlayer.getVolume() + VOLUME_STEP);
			changeVolumeText(newVolumeUp);
			twitchPlayer.setVolume(newVolumeUp);
			event.preventDefault();
			break;
		}

		case VOLUME_DOWN_KEY: {
			const newVolumeDown = Math.max(0, twitchPlayer.getVolume() - VOLUME_STEP);
			changeVolumeText(newVolumeDown);
			twitchPlayer.setVolume(newVolumeDown);
			event.preventDefault();
			break;
		}

		default: {
			break;
		}
	}
});

function changeVolumeText(volume) {
	const volumeText = document.body.querySelector('.volumeText');
	volumeText.textContent = Math.ceil(((volume * 100) / 5) * 5) + '%';
	volumeText.classList.add('active');
	if (removeTimeout) {
		clearTimeout(removeTimeout);
	}

	removeTimeout = setTimeout(() => {
		volumeText.classList.remove('active');
	}, 500);
}

function setUpVolumeText() {
	const volumeText = document.createElement('span');
	const volumeContainer = document.createElement('div');
	volumeContainer.classList.add('volumeContainer');
	volumeContainer.append(volumeText);
	volumeText.classList.add('volumeText');
	volumeText.textContent = '100';
	document.body.querySelector('.persistent-player').append(volumeContainer);
}

function getTwitchPlayer() {
	if (window.Twitch && window.Twitch.Player) {
		const playerElements = document.querySelectorAll('[data-a-target="player-overlay-click-handler"]');
		if (playerElements.length > 0) {
			const videoController = findReactComponent(playerElements[0], 'VideoPlayerController');
			if (videoController && videoController.props && videoController.props.mediaPlayerInstance) {
				return videoController.props.mediaPlayerInstance;
			}
		}
	}

	const video = document.querySelector('video');
	if (video) {
		return {
			getVolume: () => video.volume,
			setVolume(vol) {
				video.volume = vol;
			},
			getMuted: () => video.muted,
			setMuted(mute) {
				video.muted = mute;
			},
		};
	}

	return null;
}

/* eslint max-depth: ["error", 7] */
function findReactComponent(element, targetName) {
	const keys = Object.keys(element);
	for (const key of keys) {
		if (key.startsWith('__reactInternalInstance$')) {
			let fiber = element[key];
			const node = fiber;

			while (fiber) {
				if (fiber.type && typeof fiber.type === 'function'
                    && fiber.type.displayName === targetName) {
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

function waitForElm(selector) {
	return new Promise(resolve => {
		if (document.querySelector(selector)) {
			resolve(document.querySelector(selector));
		}

		const observer = new MutationObserver(() => {
			if (document.querySelector(selector)) {
				observer.disconnect();
				resolve(document.querySelector(selector));
			}
		});
		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	});
}
