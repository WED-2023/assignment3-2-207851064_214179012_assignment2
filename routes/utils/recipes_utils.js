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
        
    }
}

async function getRecipesPreview(recipe_ids) {
    let recipes_info = [];
    console.log(recipe_ids);
    for (let i = 0; i < recipe_ids.length; i++) {
        let recipe = await getRecipeDetails(recipe_ids[i]);
        // console.log(recipe);
        recipes_info.push({
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            popularity: recipe.popularity,
            vegan: recipe.vegan,
            vegetarian: recipe.vegetarian,
            glutenFree: recipe.glutenFree
        });
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
async function createRecipe(recipe) {
    const {title, readyInMinutes, image, vegan, vegetarian, glutenFree } = recipe;

    // Check if the recipe already exists in the database
    const existing = await DButils.execQuery(
    `SELECT * FROM Recipes WHERE title = '${title.replace(/'/g, "''")}'`
    );
    if (existing.length > 0) {
        console.log("Recipe already exists:", existing);
        throw new Error("Recipe already exists");
    }

    // Compute new ID
    let maxid= await DButils.execQuery(`SELECT MAX(id) as maxid FROM Recipes`);
    if (maxid[0].maxid==null){
        id=1;
    }
    else{
        id=maxid[0].maxid+1;
    }

    // Insert the new recipe into the database
    const query = `INSERT INTO Recipes (id, title, readyInMinutes, image, popularity, vegan, vegetarian, glutenFree) 
                   VALUES (${id}, '${title}', ${readyInMinutes}, '${image}', ${0}, ${vegan}, ${vegetarian}, ${glutenFree})`;
    await DButils.execQuery(query);
}

async function getRecipeLikes(recipeId) {
    const result = await DButils.execQuery(
        `SELECT COUNT(Distinct user_id) AS likes
         FROM FavoriteRecipes WHERE recipe_id = ${recipeId}`
    );
    return result[0].likes;
}

async function getSpooncularRecipeLikes(recipeId) {
    const result = await DButils.execQuery(
        `SELECT COUNT(Distinct user_id) AS likes
         FROM SpooncularLikes WHERE recipe_id = ${recipeId}`
    );
    return result[0].likes;
}


module.exports = {
  getRecipeDetails,
  getRecipesByQuery,
  getRandomRecipes,
    createRecipe,
    getRecipeLikes,
};




// exports.getRecipeDetails = getRecipeDetails;



