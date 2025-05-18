var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");

router.get("/", (req, res) => res.send("im here"));


/**
 * This path returns a full details of a recipe by its id
 */
router.get("/:recipeId", async (req, res, next) => {
  try {
    const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
    res.status(200).send(recipe);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns a list of recipes based on the search query
 */
router.get("/search", async (req, res, next) => {
  try {
    const recipes = await recipes_utils.getRecipesByQuery(req.params);
    res.status(200).send(recipes);
  } catch (error) {
    next(error);
  }
});

/**
 * This path returns a list of random recipes
 */
router.get("/random", async (req, res, next) => {
  try {
    const randomRecipes = await recipes_utils.getRandomRecipes(req.params.number);
    res.status(200).send(randomRecipes);
  } catch (error) {
    next(error);
  }
});





module.exports = router;
