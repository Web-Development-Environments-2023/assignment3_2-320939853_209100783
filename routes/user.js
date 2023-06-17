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

router.post("/createRecipe",async (req, res, next) => {
  try {
    const userId = req.session.user_id;
    let {name,Time,Likes,isVegan,isVeget,isGfree,portions,image,intolerances,cuisine, ingredients, steps} =  req.body;
    let createdRecipeID = await user_utils.functions.handleCreateRecipe(name,Time,Likes,isVegan,isVeget,isGfree,portions,image,intolerances,cuisine);
    //HERE'S LOGIC OF ADDING RECIPE TO PERSONAL
    await user_utils.functions.handleAddRecipeToPersonal(userId, createdRecipeID);
    //HERE'S LOGIC OF ADDING INGREDIENTS TO RECIPE_INGREDIENT IN DB
    if(ingredients)
    {await ingredients_utils.handleCreateIngredient(ingredients,createdRecipeID);}
    if (steps)
    {await steps_utils.handleCreateSteps(steps,createdRecipeID);}
    res.status(200).send({ message: "Recipe Created, Ingredients Created, Steps Created, Recipe Has been Added to Personal Recipes. ", success: true });
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
 */
//EXAMPLE OF GETTING FAVORITE RECIPES OF UserID : 1 
//http://127.0.0.1:3000/users/favoriterecipes/1
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
 * 
 *
 * @returns {Personal_Recipes_Array}, an Array of User's Personal Recipes. 
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
 */
router.get("/familyRecipes", async (req,res,next) => {
  try{
    const userId = req.session.user_id;
    recipes = await user_utils.functions.handleGetFamilyRecipes(userId);
    res.status(200).send({message:"Family Recipes Retrieved ! ", data:recipes});
    } catch(error){
    next(error);
  }
})
router.get("/visitedRecipes", async (req,res,next) => {
  try{

    //Im not even sure if we need this endpoint
    //anyway, for testing
    const userId = req.session.user_id;
    let limit = req.query.limit;
    let visitedRecipes = await user_utils.handleGetLastVisitedRecipes(userId,limit);
    let parsed = recipe_utils.extractInfoFromRecipe(visitedRecipes)
    res.status(200).send({message:"Retrieved Last 3 Visited Recipes ", success: true,"visitedRecipes":parsed});
    console.log("Handel visited Recipes");
  }
  catch(error)
  {
    next(error);
  }
});
router.get("/getimage",async (req, res, next) => {
  try{
    let imageName = req.query.imageName;
    res.sendFile(process.env.PATHIMAGES+imageName);
  }catch(erorr){
    next(erorr);
  }

});

// router.get("/searchrecipe/:dish", async (req,res,next) => {
//   try{
//     let query = req.params.dish;
//     let { cuisine, diet, intolerance, number } = req.query;
//     let recipesStr = ""
//     let recpiesFromSearch = await user_utils.functions.handleGetSearchRecipes(query, cuisine, diet, intolerance, number);
//     recpiesFromSearch.forEach(element =>{
//        recipesStr += element.id+",";
//     });
//     console.log(recipesStr);
//     let ans = await recipe_utils.getArrayOfRecipes(recipesStr);
//     let parsed = recipe_utils.extractInfoFromRecipe(ans);
//     res.status(200).send(parsed);
//     } catch(error){
//     next(error);
//   }
// });


/**
 * @description this section is for the DELETE requests of user 
 * @method Delete 
 */
router.delete("/deleteimage",async (req, res, next) => {
  try{
    let imageName = req.query.imageName;
    res.send(user_utils.functions.handleDeleteImage(imageName));
  }catch(erorr){
    next(erorr);
  }

});

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





