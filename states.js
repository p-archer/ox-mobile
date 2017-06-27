let stateWords = 'TODO | DONE';

function setStates(words) {
	stateWords = words;
}

function getStates() {
	return stateWords;
}

function getStateClass(state) {
	let notDone = stateWords.split('|')[0].trim().split(' ');
	let done = stateWords.split('|')[1].trim().split(' ');

	let index = notDone.indexOf(state);
	if (index !== -1) {
		if (index === 0) {
			return 'not-started';
		} else {
			return 'pending';
		}
	}

	index = done.indexOf(state);
	if (index !== -1) {
		if (index === 0) {
			return 'done';
		} else {
			return 'abandoned';
		}
	}

	return 'unknown';
}

module.exports = {
	setStates: setStates,
	getStates: getStates,
	getStateClass: getStateClass
};
