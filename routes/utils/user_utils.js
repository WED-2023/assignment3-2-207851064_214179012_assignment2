const DButils = require("./DButils");

async function markAsFavorite(user_id, recipe_id) {
  // check if this recipe is already in the user's favorites
  const result = await DButils.execQuery(
    `SELECT * FROM FavoriteRecipes WHERE recipe_id = ${recipe_id} AND user_id = '${user_id}'`
  );

  if (result.length > 0) {
    // already favorited → remove it
    await DButils.execQuery(
      `DELETE FROM FavoriteRecipes WHERE recipe_id = ${recipe_id} AND user_id = '${user_id}'`
    );
  } else {
    // not yet favorited → add it
    await DButils.execQuery(
      `INSERT INTO FavoriteRecipes (user_id, recipe_id) VALUES ('${user_id}', ${recipe_id})`
    );
  }
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${user_id}'`);
    return recipes_id;
}

async function getHistory(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from lastSearches where user_id='${user_id}' ORDER BY viewed_at`);
    return recipes_id;
}

async function addToHistory(user_id, recipe_id){
    await DButils.execQuery(`insert into lastSearches values ('${user_id}',${recipe_id},CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE viewed_at = CURRENT_TIMESTAMP`);
}
async function likeRecipe(recipe_id, user_id) {
    const result = await DButils.execQuery(
    `SELECT * FROM SpooncularLikes WHERE recipe_id = ${recipe_id} AND user_id = ${user_id}`,
    [recipe_id, user_id]);

    if (result.length > 0) {
        // Record exists --> delete
        await DButils.execQuery(
            `DELETE FROM SpooncularLikes WHERE recipe_id = ${recipe_id} AND user_id = ${user_id}`,
            [recipe_id, user_id]
        );
    } else {
        // Record does not exist --> insert
        await DButils.execQuery(
            `INSERT INTO SpooncularLikes (recipe_id, user_id) VALUES (${recipe_id}, ${user_id})`,
            [recipe_id, user_id]
        );
    }
}

async function getLikedRecipes(user_id) {
    const likedRecipes = await DButils.execQuery(`SELECT recipe_id FROM SpooncularLikes WHERE user_id = '${user_id}'`);
    return likedRecipes.map(recipe => recipe.recipe_id);
}


async function getFamilyRecipes(user_id) {
    const familyRecipes = await DButils.execQuery(`SELECT * FROM recipes where user_id = '${user_id}'
    ORDER BY recipe_id DESC`);
    return familyRecipes.map(recipe => {
        return {
            recipe_id: recipe.recipe_id,
            title: recipe.title,
            owner: recipe.owner,
            occasion: recipe.occasion,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions
        };
    });
}

async function postFamilyRecipes(user_id,recipe) {
    let max_id = await DButils.execQuery(`SELECT MAX(recipe_id) as max_id FROM Recipes WHERE user_id = '${user_id}'`);
    max_id = max_id[0].max_id || 0; // If no recipes exist, start from 0
    await DButils.execQuery(`INSERT INTO Recipes (user_id, recipe_id, title, owner, occasion, ingredients, instructions)
    VALUES ('${user_id}', ${max_id + 1}, '${recipe.title}', '${recipe.owner}', '${recipe.occasion}', '${recipe.ingredients}', '${recipe.instructions}')`);
}

async function postMyRecipe(user_id, recipe) {
    let max_id = await DButils.execQuery(`SELECT MAX(recipe_id) as max_id FROM MyRecipes WHERE user_id = '${user_id}'`);
    max_id = max_id[0].max_id || 0; // If no recipes exist, start from 0

    // Serialize ingredients and instructions as JSON
    const ingredients = recipe.ingredients ? JSON.stringify(recipe.ingredients) : '[]';
    const instructions = recipe.instructions ? JSON.stringify(recipe.instructions) : '[]';
    const servings = recipe.Servings !== undefined ? recipe.Servings : 1; // Default to 1 if undefined

    await DButils.execQuery(
        `INSERT INTO MyRecipes (user_id, recipe_id, title, image, readyInMinutes, vegan, vegetarian, glutenFree, ingredients, instructions, servings)
        VALUES ('${user_id}', ${max_id + 1}, '${recipe.title}', '${recipe.image}', ${recipe.readyInMinutes}, ${recipe.vegan}, ${recipe.vegetarian}, ${recipe.glutenFree}, 
        '${ingredients}', '${instructions}', ${servings})`
    );
}

async function getMyRecipes(user_id) {
    const myRecipes = await DButils.execQuery(`SELECT * FROM MyRecipes WHERE user_id = '${user_id}' ORDER BY recipe_id DESC`);
    return myRecipes.map(recipe => {
        return {
            id: recipe.recipe_id,
            title: recipe.title,
            image: recipe.image,
            readyInMinutes: recipe.readyInMinutes,
            vegan: recipe.vegan,
            vegetarian: recipe.vegetarian,
            glutenFree: recipe.glutenFree,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            servings: recipe.servings
        };
    });
}



module.exports = {
    markAsFavorite,
    getFavoriteRecipes,
    getHistory,
    addToHistory,
    likeRecipe,
    getLikedRecipes,
    getFamilyRecipes,
    postFamilyRecipes,
    postMyRecipe,
    getMyRecipes
};
