const {writeFile, open} = require('fs/promises');
const {discovery, api} = require('node-hue-api');

const appName = 'draculaland';
const deviceName = process.env.DEVICE_NAME || 'dev';
const ipAddressPath = './ip-address.json';
const credentialsPath = './credentials.json';
const bridgeConfigPath = './bridge-config.json';

function handleError(err) {
	if (err.getHueErrorType && err.getHueErrorType() === 101) {
		console.error(
			'The Link button on the bridge was not pressed. Please press the Link button and try again.',
		);
	} else {
		console.error(`Unexpected Error: ${err.message}`);
	}
}

async function discoverBridge() {
	const discoveryResults = await discovery.mdnsSearch();

	if (discoveryResults.length === 0) {
		console.error('Failed to resolve any Hue Bridges');
		return null;
	}

	return discoveryResults[0].ipaddress;
}

async function discoverAndAuthenticate() {
	let credentials;
	let bridgeConfig;
	let ipAddress;

	try {
		// Get stored IP Address
		const ipAddressHandler = await open(ipAddressPath);
		const ipAddressFile = await ipAddressHandler.readFile();
		[ipAddress] = JSON.parse(ipAddressFile.toString());
		ipAddressHandler.close();
	} catch {
		// Get IP Address from Bridge
		try {
			ipAddress = await discoverBridge();
			console.log('ipaddress', ipAddress);

			console.log(`
					*********************************************************************************
					IP address has been discovered for the Hue Bridge. It can be used to connect with 
					the Bridge and will be stored in './ip-address.json' which is already ignored and 
					should never be commited. YOU SHOULD TREAT THIS LIKE A PASSWORD
						Hue Bridge IP Address: ${ipAddress}
					*********************************************************************************\n
				`);

			await writeFile(
				ipAddressPath,
				JSON.stringify([ipAddress]),
			);
		} catch (err) {
			handleError(err);
		}
	}

	try {
		// Get stored Credentials
		const credentialsHandler = await open(credentialsPath);
		const credentialsFile = await credentialsHandler.readFile();
		credentials = JSON.parse(credentialsFile.toString());
		credentialsHandler.close();
	} catch {
		// Create new user
		try {
			const unauthenticatedApi = await api.createLocal(ipAddress).connect();
			const createdUser = await unauthenticatedApi.users.createUser(
				appName,
				deviceName,
			);

			console.log(`
				*********************************************************************************
				User has been created on the Hue Bridge. The following username can be used to
				authenticate with the Bridge and provide full local access to the Hue Bridge.
				These will be stored in './credentials.json' which is already ignored and should
				never be commited. YOU SHOULD TREAT THIS LIKE A PASSWORD
					Hue Bridge User: ${createdUser.username}
					Hue Bridge User Client Key: ${createdUser.clientkey}
				*********************************************************************************\n
			`);

			credentials = {USERNAME: createdUser.username, CLIENT_KEY: createdUser.clientkey};

			await writeFile(
				credentialsPath,
				JSON.stringify(credentials),
			);
		} catch (err) {
			handleError(err);
		}
	}

	try {
		// Get stored Bridge config
		const bridgeConfigHandler = await open(bridgeConfigPath);
		const bridgeConfigFile = await bridgeConfigHandler.readFile();
		bridgeConfig = JSON.parse(bridgeConfigFile.toString());
		bridgeConfigHandler.close();
	} catch {
		// Get bridge config
		try {
			const authenticatedApi = await api
				.createLocal(ipAddress)
				.connect(credentials.USERNAME);

			bridgeConfig = await authenticatedApi.configuration.getConfiguration();

			console.log(`
        *********************************************************************************
        An authenticated connection with the Hue Bridge has been created. The following
        config contains protected information about the Hue Bridge. This information will
        be stored in './bridge-config.json' which is already ignored and should never be
        committed. YOU SHOULD TREAT THIS LIKE A PASSWORD
          Hue Bridge Config: ${JSON.stringify(bridgeConfig, null, 2)}
        *********************************************************************************\n
      `);

			await writeFile(
				bridgeConfigPath,
				JSON.stringify(bridgeConfig),
			);
		} catch (err) {
			handleError(err);
		}
	}
}

module.exports = {discoverAndAuthenticate};
