var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");
const ingredients_utils = require("./utils/ingredients_util");
const steps_utils = require("./utils/steps_util");
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './static/Images')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const filetype = file.mimetype.split('/')[1];
    
    cb(null, uniqueSuffix+"."+filetype)
  }
});
const upload = multer({ storage: storage });
// const imagehandler = require('multer');
/**
 * Authenticate all incoming requests by middleware
 * This middleware function is used to authenticate all incoming requests.
 * It checks if there is an active session with a valid user ID. If the session is valid, it allows the request to proceed to the next handler. 
 * Otherwise, it returns a status code of 401 (Unauthorized).
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

    console.log("erorr is auth in users.js");
    res.sendStatus(401);
  }
});



/**
 * @description this section is for the post requests of user 
 * @method Post 
 * This endpoint handles a POST request to add a recipe to the user's favorite recipes.
 * It retrieves the user ID and recipe ID from the request body and then calls the markAsFavorite function from the user_utils module to mark the recipe
 * as a favorite for the user. 
 * If successful, it returns a status code of 200 and a success message; otherwise, it passes any errors to the error-handling middleware.
 */
router.post('/addFavorite', async (req,res,next) => {
  try{
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;
    const recipe_src = req.body.source;
    await user_utils.functions.markAsFavorite(user_id,recipe_id, recipe_src);
    res.status(200).send("The Recipe successfully saved as favorite");
    } catch(error){
    next(error);
  }
});
/**
 *  @method Post 
 *  This endpoint handles a POST request to upload an image for a new recipe.
 *  It uses the multer middleware to handle file uploads. If an image file is present in the request,
 *  it saves the file to a specified destination and returns the image path in the response. If there is an error or no image file is found,
 *  it passes the error to the error-handling middleware.
 */
router.post("/createRecipe/uploadimage", upload.single('image'),async (req, res, next) => {
  try{
    if (req.file){
      let imageFileName = req.file.filename;
      res.status(200).send({"imagePath":imageFileName})
    }else{
      throw new Error("Missing Image file in the request");
    }
    
  }catch(erorr){
    next(erorr);
  }
});
/**
 * @method POST
 * This endpoint handles a POST request to create a new recipe.
 *  It expects various recipe details (name, time, likes, dietary properties, etc.) in the request body.
 *  The function then calls different utility functions to handle various aspects of the recipe creation process,
 *  such as adding the recipe to the user's personal recipes, creating ingredients and steps for the recipe, etc. If successful,
 *  it returns a status code of 200 and a success message; otherwise, it passes any errors to the error-handling middleware.
 */
router.post("/createRecipe",async (req, res, next) => {
  try {
    const userId = req.session.user_id;
    let {name,Time,Likes,isVegan,isVeget,isGfree,portions,image,intolerances,cuisine, ingredients, steps,endpoint} =  req.body;
    image = endpoint+"Images/"+image
    let createdRecipeID = await user_utils.functions.handleCreateRecipe(name,Time,Likes,isVegan,isVeget,isGfree,portions,image,intolerances,cuisine);
    //HERE'S LOGIC OF ADDING RECIPE TO PERSONAL
    await user_utils.functions.handleAddRecipeToPersonal(userId, createdRecipeID);
    //HERE'S LOGIC OF ADDING INGREDIENTS TO RECIPE_INGREDIENT IN DB
    if(ingredients)
    {await ingredients_utils.handleCreateIngredient(ingredients,createdRecipeID);}
    if (steps)
    {await steps_utils.handleCreateSteps(steps,createdRecipeID);}
    res.status(200).send({ message: "Recipe Created, Ingredients Created, Steps Created, Recipe Has been Added to Personal Recipes. ",recipeid:createdRecipeID, success: true });
  } catch (error) {
    next(error);
  }
});
/**
 * @method POST
 * This endpoint handles a POST request to mark a recipe as visited by the user. It expects the user ID and recipe ID in the request body.
 *  The function then calls the handleVisitRecipe function from the user_utils module to mark the recipe as visited.
 *  If successful, it returns a status code of 200 and a success message; otherwise, it passes any errors to the error-handling middleware.
 */
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
 * @method POST
 * This endpoint handles a POST request to mark a recipe as liked by the user. It expects the user ID and recipe ID in the request body.
 *  The function then calls the handleAddLikedRecipe function from the user_utils module to add the recipe to the user's liked recipes.
 *  If successful, it returns a status code of 200 and a success message; otherwise, it passes any errors to the error-handling middleware.
 */
router.post("/likeRecipe", async (req, res, next) => {
  try {
    const userId = req.session.user_id;
    let {recipeId} =  req.body;
    await user_utils.functions.handleAddLikedRecipe(userId, recipeId);
    res.status(200).send({ message: "recipe Liked Successfully", success: true });
  } catch (error) {
    next(error);
  }
});




/**
 * @description this section is for the GET requests of user 
 * @method Get 
 * This endpoint handles a GET request to retrieve the favorite recipes of a specific user. It expects the user ID as a parameter in the URL.
 *  The function then calls the handleGetFavoriteRecipesOfUser function from the user_utils module to fetch the user's favorite recipes.
 *  If successful, it returns a status code of 200 and the array of favorite recipes; otherwise,
 *  it passes any errors to the error-handling middleware.
 */
//EXAMPLE OF GETTING FAVORITE RECIPES OF UserID : 1 
 router.get('/favoriterecipes/:userId', async (req,res,next) => {
  try{
    let requestedUserId = req.params.userId;
    
    let favRecipes = await user_utils.functions.handleGetFavoriteRecipesOfUser(requestedUserId);
    res.status(200).send(favRecipes);
    } catch(error){
    next(error);
  }
});
/**

 * @returns {Personal_Recipes_Array}, an Array of User's Personal Recipes. 
 * This endpoint handles a GET request to retrieve the personal recipes of the currently authenticated user.
 *  It uses the user ID from the active session to call the handleGetPersonalRecipesOfUser function from the user_utils module, which fetches the user's personal recipes.
 * If successful, it returns a status code of 200 and the array of personal recipes; otherwise, it passes any errors to the error-handling middleware.
 */
router.get('/personalRecipes', async (req,res,next) => {
  try{
    const userId = req.session.user_id;
    recipes = await user_utils.functions.handleGetPersonalRecipesOfUser(userId);
    res.status(200).send({message:"Personal Recipes Retrieved ! ", data:recipes});
    } catch(error){
    next(error);
  }
});
/**
 * @returns {Family_Recipes_Array}, an Array of User's Family Recipes.
 * This endpoint handles a GET request to retrieve the family recipes.
 *  It calls the handleGetFamilyRecipes function from the user_utils module to fetch the family recipes.
 *  If successful, it returns a status code of 200 and the array of family recipes; otherwise, it passes any errors to the error-handling middleware.
 */
router.get("/familyRecipes", async (req,res,next) => {
  try{
    let recipes = await user_utils.functions.handleGetFamilyRecipes();
    res.status(200).send({message:"Family Recipes Retrieved ! ", data:recipes});
    } catch(error){
    next(error);
  }
})
/**
 * @method GET
 * This endpoint handles a GET request to retrieve the last visited recipes of the currently authenticated user.
 *  It uses the user ID from the active session and accepts an optional limit query parameter to specify the number of visited recipes to retrieve.
 *  It calls the handleGetLastVisitedRecipes function from the user_utils module to fetch the last visited recipes.
 *  If successful, it returns a status code of 200 and the array of last visited recipes; otherwise, it passes any errors to the error-handling middleware.
 */
router.get("/visitedRecipes", async (req,res,next) => {
  try{

    //Im not even sure if we need this endpoint
    //anyway, for testing
    const userId = req.session.user_id;
    let limit = req.query.limit;
    console.log(limit)
    let visitedRecipes = await user_utils.functions.handleGetLastVisitedRecipes(userId,limit);
    res.status(200).send({message:"Retrieved Last 3 Visited Recipes ", success: true,"visitedRecipes":visitedRecipes});
    console.log("Handel visited Recipes");
  }
  catch(error)
  {
    next(error);
  }
});
/**
 * @method GET
 * This endpoint handles a GET request to retrieve an image. It expects the image name as a query parameter in the URL.
 *  The function then sends the image file with the specified name in the response. 
 * If there is an error, it passes it to the error-handling middleware.
 */
router.get("/getimage",async (req, res, next) => {
  try{
    let imageName = req.query.imageName;
    res.sendFile(process.env.PATHIMAGES+imageName);
  }catch(erorr){
    next(erorr);
  }

});


/**
 * @description this section is for the DELETE requests of user 
 * @method Delete 
 * This endpoint handles a DELETE request to delete an image. 
 * It expects the image name as a query parameter in the URL.
 * The function then calls the handleDeleteImage function from the user_utils module to delete the image file with the specified name. 
 * If successful, it returns a status code of 200; otherwise, it passes any errors to the error-handling middleware.
 */
router.delete("/deleteimage",async (req, res, next) => {
  try{
    let imageName = req.query.imageName;
    res.send(user_utils.functions.handleDeleteImage(imageName));
  }catch(erorr){
    next(erorr);
  }

});
/**
 * This endpoint handles a DELETE request to remove a recipe from the user's favorite recipes.
 * It expects the user ID and recipe ID in the request body.
 * The function then calls the handleDeleteFavoriteRecipesOfUser function from the user_utils module to remove the recipe from the user's favorites. 
 * If successful, it returns a status code of 200; otherwise, it passes any errors to the error-handling middleware.
 */
router.delete('/removeFavoriteRecipe', async (req,res,next) => {
  try{
    let userId = req.body.user_id;
    let recipeId = req.body.recipeId;
    const sessionUser_id = req.session.user_id;
    if (userId == sessionUser_id){
      let favRecipes = await user_utils.functions.handleDeleteFavoriteRecipesOfUser(userId,recipeId);
      res.status(200).send(favRecipes);
    }else{
      throw new Error("The user that is trying to delete this recipe is not the one who is logged in");
    }
    } catch(error){
    next(error);
  }
})
/**
 * @method DELETE
 * This endpoint handles a DELETE request to remove a recipe from the user's personal recipes.
 *  It expects the user ID and recipe ID as query parameters in the URL. The function then calls the handleDeletePersonalRecipe function 
 * from the user_utils module to remove the recipe from the user's personal recipes. If successful, it returns a status code of 200; otherwise,
 *  it passes any errors to the error-handling middleware.
 */
router.delete('/removePersonalRecipe', async (req,res,next) => {
  try{
    let userId = req.query.userId;
    let recipeId = req.query.recipeId;
    const sessionUser_id = req.session.user_id;
    if (userId === sessionUser_id){
      await user_utils.functions.handleDeletePersonalRecipe(userId,recipeId);
      res.status(200).send(favRecipes);
    }else{
      throw new Error("The user that is trying to delete this recipe is not the one who is logged in");
    }
    } catch(error){
    next(error);
  }
})
/**
 * This endpoint handles a DELETE request to remove a recipe from the user's family recipes.
 *  It expects the user ID and recipe ID as query parameters in the URL. The function then calls the handleDeleteFamilyRecipeOfUser
 *  function from the user_utils module to remove the
 */
router.delete('/removeFamilyRecipe', async (req,res,next) => {
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
router.delete('/removeLikedRecipe', async (req,res,next) => {
  try{
    let userId = req.query.userId;
    let recipeId = req.query.recipeId;
    const sessionUser_id = req.session.user_id;
    if (userId === sessionUser_id){
      await user_utils.functions.handleDeleteLikedRecipe(userId,recipeId);
      res.status(200).send(favRecipes);
    }else{
      throw new Error("The user that is trying to delete this recipe is not the one who is logged in");
    }
    } catch(error){
    next(error);
  }
});





module.exports = router;





