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
    await DButils.execQuery(`insert into lastSearches values ('${user_id}',${recipe_id},CURRENT_TIMESTAMP)`);
}



module.exports = {
    markAsFavorite,
    getFavoriteRecipes,
    getHistory,
    addToHistory
};
