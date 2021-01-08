const config = require('config');
const fetch = require("node-fetch");
module.exports= {
    async getMovie(movieId) {
        const key = config.get('api.key')
        const url = config.get('api.url').replace("{}",movieId);

        const finalUrl = url+"?api_key="+key+"&page=1"
        const response=await fetch(finalUrl, {
            method: 'GET'
        });
        const result = await response.json();
        return result;
    }
}
