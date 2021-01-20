const axios = require('axios');
const bulkURL = 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/informationBulk'
const searchByIngredientURL = 'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/findByIngredients'

//make sure this function is working and use it to fetch info from RAPID API before I connect to client.
function fetchAPI(url, method = 'GET', params = null) {
    const options = {
        url,
        method,
        params,
        headers: {
            'x-rapidapi-key': process.env.RAPID_API_KEY,
            'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com'
        }
    };
    return axios.request(options)
        .then(res => res.data)
    
}


// function formatQueryParams(params) {
//   const queryItems = Object.keys(params)
//     .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
//   return queryItems.join('&');
// }

function combine(searchResults, bulkInfo) {
    return searchResults.map((r, i) => ({
        id: r.id,
        title: r.title,
        missedIngredientCount: r.missedIngredientCount,
        analyzedInstructions: bulkInfo[i].analyzedInstructions,
        sourceName: bulkInfo[i].sourceName,
        sourceUrl: bulkInfo[i].sourceUrl,
        readyInMinutes: bulkInfo[i].readyInMinutes,
        image: bulkInfo[i].image,
        extendedIngredients: bulkInfo[i].extendedIngredients
    }));
}

function slimRecipeJSON(results) {
    return results.map(r => ({
        id: r.id,
        title: r.title,
        analyzedInstructions: r.analyzedInstructions,
        sourceName: r.sourceName,
        sourceUrl: r.sourceUrl, 
        sourceUrl: r.sourceUrl,
        readyInMinutes: r.readyInMinutes,
        image: r.image,
        extendedIngredients: r.extendedIngredients
    }))
}

const RecipeService = {
    getRecipes(ingredients) {
        const params = {
            ingredients: ingredients.join(','),
            ranking: 2,
            ignorePantry: true,
            number: 12,
        };
        return fetchAPI(searchByIngredientURL, 'GET', params)
    },
    async getInfoBulk(ids) {
        const params = {
            ids: ids.join(',')
        };
        const bulkInfo = (await fetchAPI(bulkURL, 'GET', params));
        return slimRecipeJSON(bulkInfo)
    },
    async getFullRecipes(ingredients) {
        const searchResults = (await this.getRecipes(ingredients));
        const ids = searchResults.map((rec) => rec.id);
        const bulkInfo = (await this.getInfoBulk(ids));
        return combine(searchResults, bulkInfo);
    }
}

module.exports = RecipeService;
