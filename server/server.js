// Library Imports.
import * as DB from './db/db';

const express = require('express');
const { default: main } = require('./src/main');
const app = express();
var http = require('http').createServer(app);
const dotenv = require('dotenv');
const reload = require('reload');
const bodyParser = require('body-parser');
var cors = require('cors');

const port = process.env.PORT || 3000;

// Init Database
dotenv.config();
DB.init();
app.use(bodyParser.json());
app.use(cors());

// Endpoint to get all Scores or Scores with uuid
app.get('/api/scores/:uuid', async (req, res) => {
	res.send(await DB.GET(req.params.uuid, 'HighScores'));
});

// Endpoint to get all Crashed Ship Locations
app.get('/api/CrashedShips/', async (req, res) => {
	res.send(await DB.GET('null', 'Ships'));
});

// Endpoint to get all Dead Players Locations
app.get('/api/DeadPLayers/', async (req, res) => {
	res.send(await DB.GET('null', 'KilledPlayers'));
});

app.post('/api/registerUser/', (req, res) => {
	const body = req.body;
	const uuid = new Date().valueOf();
	DB.POST(uuid, 'HighScores', {
		uuid: uuid,
		userName: body.name,
		resources: {
			fuel: 100,
			W: 1000,
			scrap: 0,
		},
		value: 11000,
		health: 100,
	})
		.then(() => {
			res.send({ uuid });
		})
		.catch((e) => {
			res.sendStatus(500);
			console.error(e.description);
		});
});

// Serves client folder as a static resource at root url.
app.use('/', express.static('client'));
// Serves /client/index.html as entry point to the client.
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

app.get('/favicon.ico', (req, res) => res.status(204));

// app.get('/*', (req, res) => {
// 	res.sendFile(path.resolve('client/src/Views/404/404.html'));
// });

// Listens for http connections on port 3000.
if (process.env.NODE_ENV === 'development') {
	reload(app)
		.then(function (reloadReturned) {
			// reloadReturned is documented in the returns API in the README

			// Reload started, start web server
			http.listen(port, () => {
				console.log('\n============================================\n');
				console.log(`|   Listening on *:http://localhost:${port}   |\n`);
				console.log('============================================\n');
			});
		})
		.catch(function (err) {
			console.error('Reload could not start.', err);
		});
} else {
	http.listen(port);
}

var allowCrossDomain = function (req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header(
		'Access-Control-Allow-Headers',
		'Content-Type, Authorization, Content-Length, X-Requested-With'
	);

	// intercept OPTIONS method
	if ('OPTIONS' == req.method) {
		res.send(200);
	} else {
		next();
	}
};

// Socket.io entrypoint.
main(http);
