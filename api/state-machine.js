const {api} = require('node-hue-api');

const [ipAddress] = require('./ip-address.json');
const credentials = require('./credentials.json');

const day = require('./states/day.json');
const shadows = require('./states/shadows.json');
const dusk = require('./states/dusk.json');
const sunset = require('./states/sunset.json');
const nightfall = require('./states/nightfall.json');
const midnight = require('./states/midnight.json');
const danger = require('./states/danger.json');
const edison = require('./states/edison.json');

const states = [
	{name: 'day', lights: day},
	{name: 'shadows', lights: shadows},
	{name: 'dusk', lights: dusk},
	{name: 'sunset', lights: sunset},
	{name: 'nightfall', lights: nightfall},
	{name: 'midnight', lights: midnight},
];

const DANGER_TIME = 3000;

let currentState = 0;
let state = states[currentState];

const initialize = async () => {
	currentState = 0;
	state = states[currentState];
	await setLights(state.lights);
	return state;
};

const setLights = async lights => {
	const authenticatedApi = await api
		.createLocal(ipAddress)
		.connect(credentials.USERNAME);

	await Promise.all(Object.keys(lights).map(id =>
		authenticatedApi.lights.setLightState(id, lights[id])));
};

const nextState = async () => {
	if (currentState === states.length - 1) {
		return;
	}

	currentState += 1;
	state = states[currentState];
	await setLights(state.lights);
	return state;
};

const prevState = async () => {
	if (currentState === 0) {
		return;
	}

	currentState -= 1;
	state = states[currentState];
	await setLights(state.lights);
	return state;
};

const flashDangerState = async () => {
	await setLights(danger);
	setTimeout(() => {
		setLights(state.lights);
	}, DANGER_TIME);
};

const end = async () => {
	currentState = 0;
	state = states[currentState];
	await setLights(edison);
	return {name: 'end', lights: edison};
};

module.exports = {
	states,
	initialize,
	nextState,
	prevState,
	flashDangerState,
	end,
};
