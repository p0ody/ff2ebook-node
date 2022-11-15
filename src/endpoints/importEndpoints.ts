import Fastify, { FastifyInstance } from "fastify";
import exist from "./exist"
import fetch from "./fetch"
import progress from "./progress"
import createEpub from "./createEpub"

export default function(server: FastifyInstance) {
	server.register(exist);
	server.register(fetch);
	server.register(progress);
	server.register(createEpub);
}
