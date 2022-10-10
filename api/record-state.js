const {writeFileSync} = require('fs');
const {api} = require('node-hue-api');

const [ipAddress] = require('./ip-address.json');
const credentials = require('./credentials.json');
const args = process.argv.slice(2);

(async () => {
	if (!args[0]) {
		console.error('Pass a state name: node record-state state-name');
		return;
	}

	const authenticatedApi = await api
		.createLocal(ipAddress)
		.connect(credentials.USERNAME);

	const lights = await authenticatedApi.lights.getAll();

	const loftLights = lights
		.filter(light => light.name.includes('Loft'))
		.reduce((map, {id, state}) => ({
			...map,
			[id]: state,
		}), {});

	writeFileSync(`./states/${args[0]}.json`, JSON.stringify(loftLights));
})();
