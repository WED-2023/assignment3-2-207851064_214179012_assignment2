const axios = require("axios");
const { query } = require("mssql");
const api_domain = "https://api.spoonacular.com/recipes";
const DButils = require("./DButils");


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
    let aggregatedLikes=aggregateLikes+ await getSpooncularRecipeLikes(id);
    return {
        id: id,
        title: title,
        readyInMinutes: readyInMinutes,
        image: image,
        popularity: aggregatedLikes,
        vegan: vegan,
        vegetarian: vegetarian,
        glutenFree: glutenFree,
        ingredients: recipe_info.data.extendedIngredients.map(ingredient => ({
            id: ingredient.id,
            name: ingredient.name,
            amount: ingredient.amount,
            unit: ingredient.unit
        })),
        instructions: recipe_info.data.analyzedInstructions.length > 0 ? 
            recipe_info.data.analyzedInstructions[0].steps.map(step => ({
                number: step.number,
                step: step.step
            })) : [],
        servings: recipe_info.data.servings,
    }
}

async function getRecipesPreview(recipe_ids) {
    let recipes_info = [];
    for (let i = 0; i < recipe_ids.length; i++) {
        let recipe = await getRecipeDetails(recipe_ids[i]);
        recipes_info.push(recipe);
    }
    return recipes_info;
}

async function getRecipesComplexSearch(params) {
    return await axios.get(`${api_domain}/complexSearch`, {
        params: {
            query: params.query,
            cuisine: params.cuisine,
            diet: params.diet,
            intolerances: params.intolerances,
            number: params.number || 5, 
            apiKey: process.env.spooncular_apiKey
        }
    });
}
async function getRecipesByQuery(params) {
    let recipes = await getRecipesComplexSearch(params);
    let recipes_list = recipes.data.results;
    return await getRecipesPreview(recipes_list.map(recipe => recipe.id));   
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

// internal services - using the db
async function getSpooncularRecipeLikes(recipeId) {
    const result = await DButils.execQuery(
        `SELECT COUNT(Distinct user_id) AS likes
         FROM SpooncularLikes WHERE recipe_id = ${recipeId}`
    );
    return result[0].likes;
}


module.exports = {
    getRecipeDetails,
    getRecipesPreview,
    getRecipesByQuery,
    getRandomRecipes,
    
};



