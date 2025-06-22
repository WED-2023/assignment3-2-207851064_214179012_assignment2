require("dotenv").config();
const MySql = require("./MySql");

exports.execQuery = async function (query) {
    let returnValue = []
    const connection = await MySql.connection();
    try {
    await connection.query("START TRANSACTION");
    returnValue = await connection.query(query);
    await connection.query("COMMIT");

  } catch (err) {
    await connection.query("ROLLBACK");
    console.log('ROLLBACK at querySignUp', err);
    throw err;
  } finally {
    await connection.release();
  }
  return returnValue
}

exports.startTables = async function () {
    const connection = await MySql.connection();
    try {
        await connection.query("START TRANSACTION");
        await connection.query("CREATE TABLE IF NOT EXISTS Users (user_id INT PRIMARY KEY, username VARCHAR(50), firstname VARCHAR(100), lastname VARCHAR(100), country VARCHAR(100), password VARCHAR(255), email VARCHAR(100),profilePic VARCHAR(255))");
        await connection.query("CREATE TABLE IF NOT EXISTS FavoriteRecipes (user_id INT, recipe_id INT, PRIMARY KEY (user_id, recipe_id))");
        await connection.query("CREATE TABLE IF NOT EXISTS Recipes (user_id INT, recipe_id INT, title VARCHAR(255), owner VARCHAR(255), occasion VARCHAR(255), ingredients TEXT, instructions TEXT, PRIMARY KEY (user_id, recipe_id))");
        await connection.query("CREATE TABLE IF NOT EXISTS lastSearches (user_id INT, recipe_id INT, viewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, recipe_id))");
        await connection.query("CREATE TABLE IF NOT EXISTS SpooncularLikes (recipe_id INT, user_id INT, PRIMARY KEY (recipe_id, user_id))");
        await connection.query("CREATE TABLE IF NOT EXISTS MyRecipes (user_id INT, recipe_id INT, title VARCHAR(255), image VARCHAR(255), readyInMinutes INT, vegan BOOLEAN, vegetarian BOOLEAN, glutenFree BOOLEAN, ingredients JSON, instructions JSON, Servings INT, PRIMARY KEY (user_id, recipe_id))");       
        await connection.query("COMMIT");
    } catch (err) {
        await connection.query("ROLLBACK");
        console.log('ROLLBACK at startTables', err);
        throw err;
    } finally {
        await connection.release();
    }
}

