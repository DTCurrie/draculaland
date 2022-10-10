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
	{name: 'danger', lights: danger},
	{name: 'shadows', lights: shadows},
	{name: 'danger', lights: danger},
	{name: 'dusk', lights: dusk},
	{name: 'danger', lights: danger},
	{name: 'sunset', lights: sunset},
	{name: 'danger', lights: danger},
	{name: 'nightfall', lights: nightfall},
	{name: 'danger', lights: danger},
	{name: 'midnight', lights: midnight},
];

const STATE_TIME = 0.1 * 60000;
const DANGER_TIME = 3000;

let currentState = 0;
let state = states[currentState];
let time = 0;
let timer;

const setLights = async () => {
	const authenticatedApi = await api
		.createLocal(ipAddress)
		.connect(credentials.USERNAME);

	await Promise.all(Object.keys(state.lights).map(id =>
		authenticatedApi.lights.setLightState(id, state.lights[id])));
};

const nextState = async () => {
	if (currentState === states.length - 1) {
		end();
		return;
	}

	time = 0;
	currentState += 1;
	state = states[currentState];
	await setLights(state);
};

const tick = async () => {
	const isDanger = state.name === 'danger';

	if (isDanger && time >= DANGER_TIME) {
		await nextState();
		return;
	}

	if (time >= STATE_TIME) {
		await nextState();
	}
};

const initialize = async () => {
	await setLights(state);
	start();
};

const start = () => {
	timer = setInterval(() => {
		time += 1000;
		tick();
	}, 1000);
};

const stop = () => {
	clearInterval(timer);
};

const end = async () => {
	console.log('end');
	stop();
	console.log('end stopped');
	time = 0;
	currentState = 0;
	state = states[currentState];
	console.log('end reset', {time, currentState});
	await setLights(edison);
	console.log('end lights', {edison});
};

module.exports = {
	initialize,
	start,
	nextState,
	stop,
	end,
};
