var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const e = require("express");
require("dotenv").config();

router.use(express.json());
router.get("/", (req, res) => res.send("im here"));
const { currentUserId } = require('./auth.js');



/**
 * @description this section is for the GET requests of user 
 * @method Get 
 */




router.get("/randomrecipes", async (req, res, next) => {
  try {
    let number = req.query.number;
    let recipes = await recipes_utils.getRandomRecipes(number);
    let parsed = recipes_utils.extractInfoFromRecipe(recipes)
    res.send(parsed);
  } catch (error) {
    next(error);
  }
});
// 

router.get("/getrecipe/:recipeId", async (req, res, next) => {
  try {
    let recipeId = req.params.recipeId;
    let source = req.query.src;
    if(source == "API")
    {
      let recipe = await recipes_utils.getRecipeDetails(recipeId);
      res.send(recipe);
    }
    else if(source =="Server"){
      let recipe = await recipes_utils.getRecipeDetailsDB(recipeId);
      res.send(recipe);
    }
  } catch (error) {
    next(error);
  }
});



/**
 * @todo Write this endpoint in the yaml file 
 */


/**
 * @description this section is for the post requests of user 
 * @method Post 
 */

router.post("/getArrayOfRecipes", async (req, res, next) => {
  try {
    let recipeIds =  req.body.recipeIds;
    let recipe = await recipes_utils.getArrayOfRecipes(recipeIds);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});




module.exports = router;
