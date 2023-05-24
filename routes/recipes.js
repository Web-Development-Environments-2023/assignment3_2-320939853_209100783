var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const e = require("express");
require("dotenv").config();

router.use(express.json());
router.get("/", (req, res) => res.send("im here"));


/**
 * This path returns a full details of a recipe by its id
 */
// // router.get("/:recipeId", async (req, res, next) => {
//   try {
//     const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
//     res.send(recipe);
//   } catch (error) {
//     next(error);
//   }
// });

/**
 * @description this section is for the GET requests of user 
 * @method Get 
 */

router.get("/randomrecipes", async (req, res, next) => {
  try {
    let number = req.query.number;
    let recipes = await recipes_utils.getRandomRecipes(number);
    res.send(recipes);
  } catch (error) {
    next(error);
  }
});
// 

router.get("/getrecipe/:recipeId", async (req, res, next) => {
  try {
    let recipeId = req.params.recipeId;
    let recipe = await recipes_utils.getRecipeDetails(recipeId);
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});

/**
 * @description this section is for the post requests of user 
 * @method Post 
 */

router.post("/getArrayOfRecipes", async (req, res, next) => {
  try {
    let recipeIds =  req.body.recipeIds;
    let recipe = await recipes_utils.getArrayOfRecipes(recipeIds);
    console.log(typeof(recipe));
    res.send(recipe);
  } catch (error) {
    next(error);
  }
});















//It'll print p itself
router.get("/Hello", (req, res) =>{ 
  let itzik = req.query.p;
  // console.log(typeof(itzik));
  res.send(`Itzik : ${itzik}`);
})
//It'll print whats before p
router.get("/Bye/:p", (req, res) => {
let itzik = req.params.p;
res.send(`Itzik : ${itzik}`);
})





module.exports = router;
