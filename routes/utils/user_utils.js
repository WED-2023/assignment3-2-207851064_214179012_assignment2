const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into FavoriteRecipes values ('${user_id}',${recipe_id})`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${user_id}'`);
    return recipes_id;
}

async function getHistory(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from lastSearches where user_id='${user_id}' ORDER BY viewed_at DESC limit 3`);
    return recipes_id;
}

async function addToHistory(user_id, recipe_id){
    await DButils.execQuery(`insert into lastSearches values ('${user_id}',${recipe_id},CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE viewed_at = CURRENT_TIMESTAMP`);
}

async function likeRecipe(recipe_id, user_id) {
    await DButils.execQuery(`INSERT INTO SpooncularLikes (recipe_id, user_id) VALUES (${recipe_id}, '${user_id}') ON DUPLICATE KEY UPDATE recipe_id = recipe_id`);
}

async function getFamilyRecipes() {
    const familyRecipes = await DButils.execQuery(`SELECT * FROM recipes`);
    if (!familyRecipes || familyRecipes.length === 0) {
        throw new Error("No family recipes found");
    }
    return familyRecipes.map(recipe => {
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



module.exports = {
    markAsFavorite,
    getFavoriteRecipes,
    getHistory,
    addToHistory,
    likeRecipe,
    getFamilyRecipes
};
