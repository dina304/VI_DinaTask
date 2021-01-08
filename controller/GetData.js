const moviesList = require("../data/RequiredInfo").movies
const actors = require("../data/RequiredInfo").actors
const tmdbConnection = require("../connection/TMDBConnect")
const redisClient = require("../connection/Redis")
const rolesKey = "rolesList";

function populateActorsMap(actorsMap,actor, key2MovieMap, movie) {
    if (actorsMap.has(actor.name)) {
        actorsMap.get(actor.name).push(key2MovieMap.get(movie.id));
    } else {
        actorsMap.set(actor.name, [key2MovieMap.get(movie.id)])
    }
}

function popualteRoles2ActorsMap(rolesMap,actor, key2MovieMap, movie) {
    if (!rolesMap.has(actor.character)) {
        let actorsSet = new Set();
        rolesMap.set(actor.character, actorsSet)
    }
    rolesMap.get(actor.character).add(actor.name);
}

function populateActor2RoleMap(actorsRoleMap, actor) {
    const actKey = "_" + actor.name;
    if (!actorsRoleMap.has(actKey)) {
        let actorsSet = new Set();
        actorsRoleMap.set(actKey, actorsSet)
    }
    actorsRoleMap.get(actKey).add(actor.character);
}

async function saveActoreMapToRedis(actorsMap) {
    for (const [key, value] in actorsMap.entries()) {
        await redisClient.setKey(key, JSON.stringify(value));
    }
}

async function saveRolesMapToRedis(rolesMap) {
    for (const [key, value] in rolesMap.entries()) {
        let rolesActorList = [];
        if (value.length > 1) {
            rolesActorList.push(new Map(key, JSON.stringify(Array.from(value))))
        }
        await redisClient.setKey(rolesKey, rolesActorList);
    }
}

async function saveActor2RoleMapToRedis(actorsRoleMap) {
    for (const [key, value] in actorsRoleMap.entries()) {
        await redisClient.setKey(key, JSON.stringify(Array.from(value)));
    }
}

module.exports = {
    async getMarvelMoviesByActors(req, res) {
        //bring all actors list
        let results = new Map();
        if (Object.keys(req.query).length == 0) {
            for (const actor of actors) {
                const data = await redisClient.getKey(actor);
                results.set(actor, JSON.parse(data));
            }
        }
        //bring only required actor
        else {
            const actor = req.query.actor;
            const data = await redisClient.getKey(actor);
            results.set(actor, JSON.parse(data));
            console.log(results);
        }
        res.status(200).send(Object.fromEntries(results))
    },
    async getActorsPlayedMoreThenOneRole(req, res) {
        let results = new Map();
        const data = await redisClient.getKey(rolesKey);
        results.set(rolesKey, JSON.parse(data));
        console.log(results);
        if (!results.get(rolesKey)) {
            results = [];
        }
        res.status(200).send(Object.fromEntries(results))
    },
    async getActorsWhoPlayMoreThenOneMarvel(req, res) {
        let results = new Map();
        for (const actor of actors) {
            const data = await redisClient.getKey("_" + actor);
            const asJson = JSON.parse(data);
            if (asJson && asJson.length > 1) {
                results.set(actor, asJson);
            }
        }
        console.log(results);
        res.status(200).send(Object.fromEntries(results))
    },

    onLoad: async function () {
        let actorsMap = new Map();
        let key2MovieMap = new Map();
        let rolesMap = new Map();
        let actorsRoleMap = new Map();
        const promises = [];
        try {
            //call API on each movie and map its actors
            Object.entries(moviesList).forEach(([name, id]) => {
                    key2MovieMap.set(id, name);
                    promises.push(tmdbConnection.getMovie(id));
                }
            );
            const results = await Promise.all(promises)
            //add actors to map and its movie name and role
            results.forEach((movie) => {
                movie.cast.forEach(actor => {
                    if (actors.includes(actor.name)) {
                        populateActorsMap(actorsMap,actor, key2MovieMap, movie);
                        popualteRoles2ActorsMap(rolesMap ,actor, key2MovieMap, movie, rolesMap);
                        populateActor2RoleMap(actorsRoleMap, actor);
                    }
                })
            })
            //load all data to redis
            const redisPromises = [saveActoreMapToRedis(actorsMap),saveRolesMapToRedis(rolesMap),saveActor2RoleMapToRedis(actorsRoleMap)];
            await Promise.all(redisPromises)
            return 1;
        } catch (e) {
            console.error(e);
            return 0;
        }
    }
}
