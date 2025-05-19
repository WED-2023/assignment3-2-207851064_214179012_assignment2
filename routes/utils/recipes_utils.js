const axios = require("axios");
const { query } = require("mssql");
const api_domain = "https://api.spoonacular.com/recipes";



/**
 * Get recipes list from spooncular response and extract the relevant recipe data for preview
 * @param {*} recipes_info 
 */

// external services - using the spooncular API

async function getRecipeInformation(recipe_id) {
    return await axios.get(`${api_domain}/${recipe_id}/information`, {
        params: {
            includeNutrition: false,
            apiKey: process.env.spooncular_apiKey
        }
    });
}

async function getRecipeDetails(recipe_id) {
    let recipe_info = await getRecipeInformation(recipe_id);
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe_info.data;

    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregateLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        
    }
}

async function getRecipesComplexSearch(params) {
    return await axios.get(`${api_domain}/complexSearch`, {
        params: {
            query: params.query,
            cuisine: params.cuisine,
            diet: params.diet,
            intolerances: params.intolerances,
            apiKey: process.env.spooncular_apiKey
        }
    });
}
async function getRecipesByQuery(params) {
    let recipes = await getRecipesComplexSearch(params);
    let recipes_list = recipes.data.results;
    return recipes_list.map(recipe => {
        return {
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            popularity: recipe.aggregateLikes,
            vegan: recipe.vegan,
            vegetarian: recipe.vegetarian,
            glutenFree: recipe.glutenFree
        }
    });    
}

async function getRandom(number) {
    return await axios.get(`${api_domain}/random`, {
        params: {
            number: number,
            apiKey: process.env.spooncular_apiKey
        }
    })
};

async function getRandomRecipes(number) {
    let random_recipes = await getRandom(number);
    let recipes_list = random_recipes.data.recipes;
    return recipes_list.map(recipe => {
        return {
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            popularity: recipe.aggregateLikes,
            vegan: recipe.vegan,
            vegetarian: recipe.vegetarian,
            glutenFree: recipe.glutenFree
        }
    });
}

// // internal services - using the db
// async function postNewRecipe(params) {}
module.exports = {
  getRecipeDetails,
  getRecipesByQuery,
  getRandomRecipes
};




// exports.getRecipeDetails = getRecipeDetails;



