const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const cors = require('cors');

const {discoverAndAuthenticate} = require('./discover');
const {initialize, end, nextState, prevState, flashDangerState, states} = require('./state-machine');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());

app.get('/states', (_req, res, _next) => {
	res
		.setHeader('Content-Type', 'application/json')
		.status(200)
		.send(states);
});

app.post('/initialize', async (_req, res, next) => {
	try {
		const state = await initialize();
		res
			.setHeader('Content-Type', 'application/json')
			.status(200)
			.send(state);
	} catch (err) {
		next(createError(500, err));
	}
});

app.post('/next', async (_req, res, next) => {
	try {
		const state = await nextState();
		res
			.setHeader('Content-Type', 'application/json')
			.status(200)
			.send(state);
	} catch (err) {
		next(createError(500, err));
	}
});

app.post('/prev', async (_req, res, next) => {
	try {
		const state = await prevState();
		res
			.setHeader('Content-Type', 'application/json')
			.status(200)
			.send(state);
	} catch (err) {
		next(createError(500, err));
	}
});

app.post('/danger', async (_req, res, next) => {
	try {
		await flashDangerState();
		res.sendStatus(200);
	} catch (err) {
		next(createError(500, err));
	}
});

app.post('/end', async (_req, res, next) => {
	try {
		await end();
		res.sendStatus(200);
	} catch (err) {
		next(createError(500, err));
	}
});

// Catch 404 and forward to error handler
app.use((_req, _res, next) => {
	next(createError(404));
});

(async () => {
	await discoverAndAuthenticate();
})();

module.exports = app;
