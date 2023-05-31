const DButils = require("./DButils");
const api_domain = "https://api.spoonacular.com/recipes";
require("dotenv").config();
const apikeys_recipes = process.env.APIKEYS_SPOON;
const fs = require('fs');
const axios = require("axios");

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into FavoriteRecipes values ('${user_id}',${recipe_id})`);
}
async function handleDeleteFavoriteRecipesOfUser(user_id,recipeId){
    /**
     * @TODO create a sql query that delete this from the DB
     * const recipesList = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${user_id}'`);
     * return recipesList;
     */ 
}
async function handleDeleteFamilyRecipeOfUser(user_id,recipeId){
    /**
     * @TODO create a sql query that delete this from the DB
     * const recipesList = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${user_id}'`);
     * return recipesList;
     */
}
async function handleDeleteImage(imageName) {
    fs.unlink(process.env.PATHIMAGES+imageName,function(err) {
        if (err) {
          throw err
        } else {
          return "Image Deleted successfully"
        }
    });

}

/**
 * @description this section is for the Get requests of user 
 * @method Get 
 */



async function handleGetFamilyRecipes(currentUserId)
{
    const recipeId_List = await DButils.execQuery(`select recipe_id from family_recipes where user_id='${currentUserId}'`);
    console.log(recipeId_List);
    if (recipeId_List.length > 0)
    {return await handleGetRecipesOfDB(recipeId_List);}
    else
    {return null;}
}
async function handleGetPersonalRecipesOfUser(currentUserId)
{
    const recipeId_List = await DButils.execQuery(`select recipe_id from personal_recipes where user_id='${currentUserId}'`);
    console.log(recipeId_List);
    if (recipeId_List.length > 0)
    {return await handleGetRecipesOfDB(recipeId_List);}
    else
    {return null;}
}
//TODO:
async function handleGetFavoriteRecipesOfUser(userId){
    const recipesList = await DButils.execQuery(`select recipe_id from favorite_recipes where user_id='${userId}'`);
    //MORE COMPLEX, some recipes Might belong to DB and some might belong to API
    return recipesList;
}

//TODO:
async function handleGetLikedRecipesOfUser(userId){
    const recipesList = await DButils.execQuery(`select recipe_id from liked_recipes where user_id='${userId}'`);
    //MORE COMPLEX, some recipes Might belong to DB and some might belong to API
    return recipesList;
}
//TODO:
async function handleGetLastVisitedRecipes(userId, limit = 3) {
    let query = `SELECT recipe_id FROM visited_recipes
                 WHERE username = '${userId}'
                 ORDER BY timestamp DESC
                 LIMIT ${limit}`;
    let result = await DButils.execQuery(query);
    //MORE COMPLEX, some recipes Might belong to DB and some might belong to API
    return result;
}
 

//TODO: EITAN 
async function handleGetRecipesFromAPI(recipeId_ListFromAPI)
{
}

async function handleGetSearchRecipes( query, cuisine, diet, intolerance, number = 5 ) {
    let ans =  await axios.get(`${api_domain}/complexSearch`, {
        headers: {
            "x-api-key":apikeys_recipes
        },
        params: {
            "query":query,
            "cuisine": cuisine,
            "diet":diet,
            "intolerances":intolerance,
            "number":number
        }
    });
    return ans.data.results;
}


/**
 * @returns {recipes}, Array of Recipes JSONS, from DB !
 */
async function handleGetRecipesOfDB(recipeId_List)
{
    recipes = [];
    for(let i = 0; i < recipeId_List.length; i++)
    {
        recipeId = recipeId_List[i].recipe_id;
        let RecipeRow = await DButils.execQuery(`select * from recipes where recipe_id='${recipeId}'`);
        //Query Returns From DB as Array
        //We Select Only One Recipe At Time, So It is necessary to reach index [0]
        RecipeRow = RecipeRow[0];
        recipe = {recipe_id:RecipeRow.recipe_id, name:RecipeRow.name,Time:RecipeRow.Time,Likes:RecipeRow.Likes, isVegan:RecipeRow.isVegan, isVeget:RecipeRow.isVeget, isGfree:RecipeRow.isGfree, portions:RecipeRow.portions, Image:RecipeRow.Image, intolerances:RecipeRow.intolerances, Cuisine:RecipeRow.cuisine}
        console.log(recipe);
        let ingredient = await DButils.execQuery(`select * from ingredients where recipe_id='${recipeId}'`);
        let steps = await DButils.execQuery(`select * from steps_recipes where recipe_id='${recipeId}'`);
        let recipeJson = {recipe:recipe,ingredients:ingredient,steps:steps}
        recipes.push(recipeJson);
    }
    return recipes;
}


/**
 * @description this section is for the POST requests of user 
 * @method Post 
 */


async function handleCreateRecipe(name,Time,Likes,isVegan,isVeget,isGfree,portions,image,intolerances,cuisine) {

    let recipe_info = await DButils.execQuery(
        `INSERT INTO recipes (name, Time, Likes, isVegan, isVeget, isGfree, Portions, Image, Intolerances, Cuisine)
         VALUES ('${name}', '${Time}', '${Likes}', '${isVegan}', '${isVeget}', '${isGfree}', '${portions}', '${image}', '${intolerances}', '${cuisine}')`
    );
    console.log("Recipe ID");
    console.log(recipe_info.insertId);
    return recipe_info.insertId;
}
async function handleVisitRecipe(userId, recipeId, source) {
    let query = `INSERT INTO visited_recipes (user_id, recipe_id, timestamp, source)
                 VALUES ('${userId}', ${recipeId}, CURRENT_TIMESTAMP(), ${source})
                 ON DUPLICATE KEY UPDATE timestamp = CURRENT_TIMESTAMP()`;
    let result = await DButils.execQuery(query);
    return result;
}
async function handleAddRecipeToPersonal(currentUserId,recipeId)
{
    let queryExec = await DButils.execQuery(`INSERT INTO personal_recipes (user_id, recipe_id)
    VALUES ('${currentUserId}', '${recipeId}')`);
    return queryExec.data;
}

async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into favorite_recipes values ('${user_id}',${recipe_id})`);
}


let functions = {
    markAsFavorite,
    handleDeleteFavoriteRecipesOfUser,
    handleDeleteFamilyRecipeOfUser,
    handleAddRecipeToPersonal,
    handleCreateRecipe,
    handleVisitRecipe,
    handleGetLastVisitedRecipes,
    handleDeleteImage,
    handleGetPersonalRecipesOfUser,
    handleGetFamilyRecipes,
    handleGetSearchRecipes

};
exports.functions = functions