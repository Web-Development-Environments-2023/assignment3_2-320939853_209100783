var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");

/**
 * Authenticate all incoming requests by middleware
 */
router.use(async function (req, res, next) { 
  if (req.session && req.session.user_id) {
    DButils.execQuery("SELECT user_id FROM users").then((users) => {
      if (users.find((x) => x.user_id === req.session.user_id)) {
        req.user_id = req.session.user_id;
        next();
      }
    }).catch(err => next(err));
  } else {
    console.log("erorr is hereeee");
    res.sendStatus(401);
  }
});



/**
 * @description this section is for the post requests of user 
 * @method Post 
 */
router.post('/favorites', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    await user_utils.markAsFavorite(user_id,recipe_id);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})


router.post("/createRecipe", async (req, res, next) => {
  try {
    const userId = req.session.user_id;
    let {name,Time,Likes,isVegan,isVeget,isGfree,portions,image,intolerances,cuisine} =  req.body;
    let createdRecipeID = await user_utils.functions.handleCreateRecipe(name,Time,Likes,isVegan,isVeget,isGfree,portions,image,intolerances,cuisine);
    console.log("YOUR MOM ");
    //HERE'S LOGIC OF ADDING RECIPE TO PERSONAL
    await user_utils.functions.handleAddRecipeToPersonal(userId, createdRecipeID);
    res.status(200).send({ message: "recipe created and added to personal ", success: true });
  } catch (error) {
    next(error);
  }
});

router.post("/visitRecipe", async (req, res, next) => {
  try {
    const userId = req.session.user_id;
    let {recipeId, source} =  req.body;
    await user_utils.functions.handleVisitRecipe(userId, recipeId, source);
    res.status(200).send({ message: "recipe visited", success: true });
  } catch (error) {
    next(error);
  }
});



/**
 * @description this section is for the GET requests of user 
 * @method Get 
 */
router.get('/favoriterecipes/:userId', async (req,res,next) => {
  try{
    let requestedUserId = req.params.userId;
    
    let favRecipes = await user_utils.functions.handleFavoriteRecipesOfUser(requestedUserId);
    res.status(200).send(favRecipes);
    } catch(error){
    next(error);
  }
});
/**
 * 
 * 
 * @todo Eitna finish this 
 */
router.get('/privaterecipes', async (req,res,next) => {
  try{
    const userId = req.session.user_id;
    await user_utils.functions.handleAddPrivateRecipeToUser(userId,recipe);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
});

router.get("/visitedRecipes", async (req,res,next) => {
  try{

    //Im not even sure if we need this endpoint
    //anyway, for testing
    const userId = req.session.user_id;
    let limit = req.query.limit;
    let visitedRecipes = await user_utils.handleGetLastVisitedRecipes(userId,limit);
    res.status(200).send({message:"Retrieved Last 3 Visited Recipes ", success: true,"visitedRecipes":visitedRecipes});
    console.log(visitedRecipes);
  }
  catch(error)
  {
    next(error);
  }
});

/**
 * @description this section is for the DELETE requests of user 
 * @method Delete 
 */
router.delete('/recipefav', async (req,res,next) => {
  try{
    let  userId = req.query.userId;
    let recipeId = req.query.recipeId;
    const sessionUser_id = req.session.user_id;
    if (userId === sessionUser_id){
      await user_utils.functions.handleDeleteFavoriteRecipesOfUser(userId,recipeId);
      res.status(200).send(favRecipes);
    }else{
      throw new Error("The user that is trying to delete this recipe is not the one who is logged in");
    }
    } catch(error){
    next(error);
  }
})

router.delete('/privaterecipes', async (req,res,next) => {
  try{
    let userId = req.query.userId;
    let recipeId = req.query.recipeId;
    const sessionUser_id = req.session.user_id;
    if (userId === sessionUser_id){
      await user_utils.functions.handleDeleteFavoriteRecipesOfUser(userId,recipeId);
      res.status(200).send(favRecipes);
    }else{
      throw new Error("The user that is trying to delete this recipe is not the one who is logged in");
    }
    } catch(error){
    next(error);
  }
})

router.delete('/recipefamily', async (req,res,next) => {
  try{
    let userId = req.query.userId;
    let recipeId = req.query.recipeId;
    const sessionUser_id = req.session.user_id;
    if (userId === sessionUser_id){
      await user_utils.functions.handleDeleteFamilyRecipeOfUser(userId,recipeId);
      res.status(200).send(favRecipes);
    }else{
      throw new Error("The user that is trying to delete this recipe is not the one who is logged in");
    }
    } catch(error){
    next(error);
  }
});



module.exports = router;
