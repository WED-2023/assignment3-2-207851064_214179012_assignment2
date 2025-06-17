var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) {
  console.log("Checking authentication for user_id:", req.session.user_id);
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    res.sendStatus(401);
  }
});


/**
 * This path gets body with recipeId and save this recipe in the favorites list of the logged-in user
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFavorite(user_id,recipe_id);
    console.log(`Recipe ${recipe_id} favorite status updated for user ${user_id}`);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})

/**
 * This path returns the favorites recipes that were saved by the logged-in user
 */
router.get('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    let favorite_recipes = {};
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    // const results = await recipe_utils.getRecipesPreview(recipes_id_array);
    res.status(200).send(recipes_id_array);
  } catch(error){
    next(error); 
  }
});

/**
 * This path gets last recipes viewed by the logged-in user
 */
router.get('/history', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    if (!user_id) {
      return res.status(400).json({ error: 'Missing user id' });
    }
    const rows = await user_utils.getHistory(user_id);
    const Ids = rows.map(r => r.recipe_id);
    const recipeIds = [...Ids].reverse();
    res.status(200).json(recipeIds);
  } catch (err) {
    next(err);
  }
});

/**
 * This path likes a recipe by its id
 */
router.post('/likespooncular', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe_id = req.query.id;

    await user_utils.likeRecipe(recipe_id, user_id);
    console.log(`Recipe ${recipe_id} like status updated for user ${user_id}`);
    res.status(200).send("Recipe like status updated successfully");
  } catch (error) {
    next(error);
  }});


/**
 * This path retrieves family recipes from database
 */
router.get('/familyRecipes', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    if (!user_id) {
      return res.status(400).json({ error: 'Missing user id' });
    }

    const familyRecipes = await user_utils.getFamilyRecipes(user_id);
    res.status(200).json(familyRecipes);
  } catch (err) {
    next(err);
  }});

/**
 * This path adds a new family recipe to the database
 */
router.post('/familyRecipes', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    if (!user_id) {
      return res.status(400).json({ error: 'Missing user id' });
    }

    const recipe = req.body;
    await user_utils.postFamilyRecipes(user_id, recipe);
    res.status(201).send("Family recipe added successfully");
  } catch (err) {
    next(err);
  }
});

/**
 * This path returns if user liked a recipe by its id
 */
router.get('/recipesliked', async (req, res, next) => {
  try {
    const user_id = req.session.user_id;

    if (!user_id) {
      return res.status(400).json({ error: 'Missing user id or recipe id' });
    }

    const liked = await user_utils.getLikedRecipes(user_id);
    console.log("Liked recipes for user:", user_id, "are:", liked);
    res.status(200).json({ liked });
  } catch (error) {
    next(error);
  }
});




module.exports = router;
