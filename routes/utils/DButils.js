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
        await connection.query("CREATE TABLE IF NOT EXISTS Users (user_id VARCHAR(255) PRIMARY KEY, first_name VARCHAR(255), last_name VARCHAR(255), email VARCHAR(255), password VARCHAR(255))");
        await connection.query("CREATE TABLE IF NOT EXISTS FavoriteRecipes (user_id VARCHAR(255), recipe_id INT, PRIMARY KEY (user_id, recipe_id))");
        await connection.query("CREATE TABLE IF NOT EXISTS Recipes (id INT PRIMARY KEY, title VARCHAR(255), readyInMinutes INT, image VARCHAR(255), popularity INT, vegan BOOLEAN, vegetarian BOOLEAN, glutenFree BOOLEAN)");
        await connection.query("CREATE TABLE IF NOT EXISTS lastSearches (user_id VARCHAR(255), recipe_id INT, PRIMARY KEY (user_id, recipe_id))");
        await connection.query("COMMIT");
    } catch (err) {
        await connection.query("ROLLBACK");
        console.log('ROLLBACK at startTables', err);
        throw err;
    } finally {
        await connection.release();
    }
}

