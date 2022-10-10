const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const cors = require('cors');

const {discoverAndAuthenticate} = require('./discover');
const {initialize, start, stop, end, nextState} = require('./state-machine');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());

app.post('/initialize', async (_req, res, next) => {
	try {
		await discoverAndAuthenticate();
		await initialize();
		res.sendStatus(200);
	} catch (err) {
		next(createError(500, err));
	}
});

app.post('/start', (_req, res, next) => {
	try {
		start();
		res.sendStatus(200);
	} catch (err) {
		next(createError(500, err));
	}
});

app.post('/next', (_req, res, next) => {
	try {
		nextState();
		res.sendStatus(200);
	} catch (err) {
		next(createError(500, err));
	}
});

app.post('/stop', (_req, res, next) => {
	try {
		stop();
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

module.exports = app;
