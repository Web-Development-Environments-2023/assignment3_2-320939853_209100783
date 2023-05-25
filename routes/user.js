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

router.post('/privaterecipes', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    let recipe = req.body.recipe;
    await user_utils.functions.handleAddPrivateRecipeToUser(user_id,recipe);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
})
/**
 * This path returns the favorites recipes that were saved by the logged-in user
 * @TODO check with mark if this function is neccery I think not
 */
// router.get('/favorites', async (req,res,next) => {
//   try{
//     const user_id = req.session.user_id;
//     let favorite_recipes = {};
//     const recipes_id = await user_utils.getFavoriteRecipes(user_id);
//     let recipes_id_array = [];
//     recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
//     const results = await recipe_utils.getRecipesPreview(recipes_id_array);
//     res.status(200).send(results);
//   } catch(error){
//     next(error); 
//   }
// });

/**
 * @description this section is for the GET requests of user 
 * @method Get 
 */
router.get('/favoriterecipes/:userId', async (req,res,next) => {
  try{
    let requestedUserId = req.params.userId;
    const user_id = req.session.user_id;
    let favRecipes = await user_utils.functions.handleFavoriteRecipesOfUser(requestedUserId);
    res.status(200).send(favRecipes);
    } catch(error){
    next(error);
  }
})
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
})


module.exports = router;
