var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
const e = require("express");
require("dotenv").config();

router.use(express.json());
router.get("/", (req, res) => res.send("im here"));
const { currentUserId } = require('./auth.js');


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



router.post("/CreateRecipe", async (req, res, next) => {
  try {
    let {name,Time,Likes,isVegan,isVeget,isGfree,portions,image,instructions,intolerances,cuisine} =  req.body;
    let CreatedRecipeID = await recipes_utils.CreateRecipe(name,Time,Likes,isVegan,isVeget,isGfree,portions,image,instructions,intolerances,cuisine);
    res.status(200).send({ message: "recipe created", success: true });
    console.log("YOUR MOM ");
    //HERE'S LOGIC OF ADDING RECIPE TO PERSONAL
    // recipes_utils.addRecipeToPersonal(currentUserId, CreatedRecipeID)
  } catch (error) {
    next(error);
  }
});

router.post("/VisitRecipe", async (req, res, next) => {
  try {
    let {username, recipeID, source} =  req.body;
    let VisitedRecipe = await recipes_utils.VisitRecipe(username, recipeID, source);
    res.status(200).send({ message: "recipe visited", success: true });
  } catch (error) {
    next(error);
  }
});

router.get("/VisitedRecipes", async (req,res,next) => {
  try{
    //Im not even sure if we need this endpoint
    //anyway, for testing
    let {username} = req.body;
    visitedrecipes = await recipes_utils.getLastVisitedRecipes(username);
    res.status(200).send({message:"Retrieved Last 3 Visited Recipes ", success: true});
    console.log(visitedrecipes);
  }
  catch(error)
  {
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
