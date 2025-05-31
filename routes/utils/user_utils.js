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
async function likeRecipe(recipe_id, user_id, db_type) {
    const result = await DButils.execQuery(
    `SELECT * FROM ${db_type} WHERE recipe_id = ${recipe_id} AND user_id = ${user_id}`,
    [recipe_id, user_id]);

    if (result.length > 0) {
        // Record exists --> delete
        await DButils.execQuery(
            `DELETE FROM ${db_type} WHERE recipe_id = ${recipe_id} AND user_id = ${user_id}`,
            [recipe_id, user_id]
        );
    } else {
        // Record does not exist --> insert
        await DButils.execQuery(
            `INSERT INTO ${db_type} (recipe_id, user_id) VALUES (${recipe_id}, ${user_id})`,
            [recipe_id, user_id]
        );
    }
}


async function getFamilyRecipes(user_id) {
    const familyRecipes = await DButils.execQuery(`SELECT * FROM recipes where user_id = '${user_id}'
    ORDER BY recipe_id DESC`);
    if (!familyRecipes || familyRecipes.length === 0) {
        throw new Error("No family recipes found");
    }
    return familyRecipes.map(recipe => {
        return {
        id: recipe.recipe_id,
        title: recipe.title,
        image: recipe.image,
        popularity: recipe.popularity,
        vegan: recipe.vegan,
        vegetarian: recipe.vegetarian,
        glutenFree: recipe.glutenFree
    }
    });
}

async function postFamilyRecipes(user_id,recipe) {
    let max_id = await DButils.execQuery(`SELECT MAX(recipe_id) as max_id FROM Recipes WHERE user_id = '${user_id}'`);
    max_id = max_id[0].max_id || 0; // If no recipes exist, start from 0
    await DButils.execQuery(`INSERT INTO Recipes (user_id, recipe_id, title, readyInMinutes, image, popularity, vegan, vegetarian, glutenFree) 
        VALUES ('${user_id}', ${max_id + 1}, '${recipe.title}', ${recipe.readyInMinutes}, '${recipe.image}', ${0}, ${recipe.vegan}, ${recipe.vegetarian}, ${recipe.glutenFree})`);
}



module.exports = {
    markAsFavorite,
    getFavoriteRecipes,
    getHistory,
    addToHistory,
    likeRecipe,
    getFamilyRecipes,
    postFamilyRecipes
};
