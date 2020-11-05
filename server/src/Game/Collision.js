import { DEFAULTS, REQUEST } from '../../../shared/Consts';
import { makeOctaves, Simple1DNoise } from '../../../shared/utils/SimplexNoise';

export default class Collision {
	constructor(seed, window) {
		this.seed = seed;
		this.window = window;
		this.players = {};

		this.noise = new Simple1DNoise(seed);
	}

	setPlayers(players) {
		this.players = players;
	}

	didColide(player) {
		const noise =
			makeOctaves(this.noise.getVal, player.position.x, {
				octaves: DEFAULTS.GENERATION.OCTAVES,
				frequency: DEFAULTS.GENERATION.SCALE,
				lacunarity: DEFAULTS.GENERATION.LACUNARITY,
				persistence: DEFAULTS.GENERATION.PERSISTANCE,
				amplitude: 100,
			}) +
			(this.window.h * 0.7 - this.window.h * 0.55) +
			this.window.h * 0.55;

		if (player.position.y + 25 / 2 >= noise && player.velocity.y > 0.3) {
			if (player.health <= 0) {
				player.socket.emit(
					REQUEST.REQUEST_DELETE_PLAYER.req
				)
			}
			else {
				player.health -= player.velocity.y * DEFAULTS.COLLISION.dmg
			}
		}

		return player.position.y + 25 / 2 >= noise;
	}
}
