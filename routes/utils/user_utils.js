const DButils = require("./DButils");
const api_domain = "https://api.spoonacular.com/recipes";
require("dotenv").config();
const apikeys_recipes = process.env.APIKEYS_SPOON;
const fs = require('fs');
const axios = require("axios");
const recipes_utils = require("./recipes_utils.js")

/**
 * @description This Function Is for distincting DB SQL Recipe Rows - Distincting Between Server Recipes or API Recipes. 
 * @param rows : List of rows from DB, Comes As RowDataObj
 * @return Two Lists: API_LIST, Server_LIST
 */
function DistinctRecipes(rows)
{
    recipesList = JSON.parse(JSON.stringify(rows));
    let Server_Recipes = []
    let API_recipes = []
    recipesList.forEach((row) => {
        if(row.source === 'Server'){
            Server_Recipes.push(row.recipe_id);
        }
        else{
            API_recipes.push(row.recipe_id);
        }
    })
    return [Server_Recipes, API_recipes]
}
async function combineRecipeResults(API_Recipes, Server_Recipes)
{
    //Modifying API_Recipes to match handleGetRecipesFromAPI params.
    API_Recipes = API_Recipes.map(recipe => recipe.toString());
    //MECHANISM OF RETURN RECIPES OBJECTS
    let Server = await handleGetRecipesOfDB(Server_Recipes);
    //TODO - MODIFY SERVER RECIPES STRUCTURE
    let API = await handleGetRecipesFromAPI(API_Recipes);
    let combinedResult = {"Server":Server,"API":API};
    return combinedResult;
}





/**
 * @description this section is for the Delete requests of user 
 * @method Delete 
 */
async function handleDeleteFavoriteRecipesOfUser(userId,recipeId){
    await DButils.execQuery(`DELETE FROM family_recipes WHERE recipe_id='${recipeId}' AND user_id = '${userId}'`);
}
async function handleDeleteFamilyRecipeOfUser(user_id,recipeId){
    //There'll be here 2 Delete Queries.
    //One From family_recipes, Second from Recipes.
    await DButils.execQuery(`DELETE FROM family_recipes WHERE recipe_id='${recipeId}'`);
    await DButils.execQuery(`DELETE FROM ingredients WHERE recipe_id='${recipeId}'`);
    await DButils.execQuery(`DELETE FROM steps_recipes WHERE recipe_id='${recipeId}'`);
    await DButils.execQuery(`DELETE FROM recipes WHERE recipe_id = '${recipeId}'`);
    //Probably We'll have to implement Delete_Steps, Delete_Ingredients
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
async function handleDeletePersonalRecipe(recipeId)
{
    //There'll be here 2 Delete Queries.
    //One From personal_recipes, Second from Recipes.
    await DButils.execQuery(`DELETE FROM personal_recipes WHERE recipe_id='${recipeId}'`);
    await DButils.execQuery(`DELETE FROM ingredients WHERE recipe_id='${recipeId}'`);
    await DButils.execQuery(`DELETE FROM steps_recipes WHERE recipe_id='${recipeId}'`);
    await DButils.execQuery(`DELETE FROM recipes WHERE recipe_id = '${recipeId}'`);

}
async function handleDeleteLikedRecipe(recipeId,userId)
{
    await DButils.execQuery(`DELETE FROM liked_recipe WHERE recipe_id='${recipeId}' AND user_id = '${userId}'`);
}




/**
 * @description this section is for the Get requests of user 
 * @method Get 
 */



async function handleGetFamilyRecipes(currentUserId)
{
    const rows = await DButils.execQuery(`select recipe_id from family_recipes where user_id='${currentUserId}'`);
    let recipeId_List = []
    rows.forEach((row) => {
        recipeId_List.push(row.recipe_id);
    });
    if (recipeId_List.length > 0){
        return await handleGetRecipesOfDB(recipeId_List);
    }
    else{
        return null;
    }
}
async function handleGetPersonalRecipesOfUser(currentUserId)
{
    const rows = await DButils.execQuery(`select recipe_id from personal_recipes where user_id='${currentUserId}'`);
    let recipeId_List = []
    rows.forEach((row) => {
        recipeId_List.push(row.recipe_id);
    });
    if (recipeId_List.length > 0){
        return await handleGetRecipesOfDB(recipeId_List);
    }
    else{
        return null;
    }
}
async function handleGetFavoriteRecipesOfUser(userId){
    let rows = await DButils.execQuery(`select recipe_id, source from favorite_recipes where user_id='${userId}'`);
    let [Server_Recipes, API_recipes] = DistinctRecipes(rows);
    return combineRecipeResults(API_recipes, Server_Recipes);
}
async function handleGetLikedRecipesOfUser(userId){
    const recipesList = await DButils.execQuery(`select recipe_id from liked_recipes where user_id='${userId}'`);
    let [Server_Recipes, API_recipes] = DistinctRecipes(recipesList);
    return combineRecipeResults(API_recipes, Server_Recipes);
}
async function handleGetLastVisitedRecipes(userId, limit = 3) {
    let query = `SELECT recipe_id FROM visited_recipes
                 WHERE username = '${userId}'
                 ORDER BY timestamp DESC
                 LIMIT ${limit}`;
    let recipesList = await DButils.execQuery(query);
    let [Server_Recipes, API_recipes] = DistinctRecipes(recipesList);
    return combineRecipeResults(API_recipes, Server_Recipes);
}
async function handleGetRecipesFromAPI(recipeId_ListFromAPI){
    let recipiesStr = "";
    recipeId_ListFromAPI.forEach(element =>{
        recipiesStr += element+",";
    });
    let results = await recipes_utils.getArrayOfRecipes(recipiesStr);
    let parsedRecipes = recipes_utils.extractInfoFromRecipe(results);
    return parsedRecipes;
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
        recipeId = recipeId_List[i];
        let RecipeRow = await DButils.execQuery(`select * from recipes where recipe_id='${recipeId}'`);
        await console.log(RecipeRow);
        //Query Returns From DB as Array
        //We Select Only One Recipe At Time, So It is necessary to reach index [0]
        RecipeRow = RecipeRow[0];       
        let ingredient = await DButils.execQuery(`select * from ingredients where recipe_id='${recipeId}'`);
        let steps = await DButils.execQuery(`select * from steps_recipes where recipe_id='${recipeId}'`);
       
        let recipe = {id:RecipeRow.recipe_id, name:RecipeRow.name,Time:RecipeRow.Time,Likes:RecipeRow.Likes, isVegan:RecipeRow.isVegan, isVeget:RecipeRow.isVeget, isGfree:RecipeRow.isGfree, portions:RecipeRow.portions, image:RecipeRow.Image,
            ingredients:ingredient,steps:steps, intolerances:RecipeRow.intolerances, Cuisine:RecipeRow.cuisine}
       
        // let recipeJson = {recipe:recipe,ingredients:ingredient,steps:steps}
        recipes.push(recipe);
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

async function markAsFavorite(user_id, recipe_id, source){
    console.log(recipe_id);
    await DButils.execQuery(`insert into favorite_recipes (user_id, recipe_id, source) values ('${user_id}','${recipe_id}', '${source}')`);
}
async function handleAddLikedRecipe(userId,recipeId)
{
    await DButils.execQuery(`insert into liked_recipes (user_id, recipe_id) values ('${user_id}','${recipe_id}')`);
}


let functions = {
    markAsFavorite,
    handleDeleteFavoriteRecipesOfUser,
    handleDeleteFamilyRecipeOfUser,
    handleAddRecipeToPersonal,
    handleAddLikedRecipe,
    handleCreateRecipe,
    handleVisitRecipe,
    handleGetLastVisitedRecipes,
    handleDeleteImage,
    handleGetPersonalRecipesOfUser,
    handleGetFavoriteRecipesOfUser,
    handleGetFamilyRecipes,
    handleGetSearchRecipes,
    handleDeletePersonalRecipe,
    handleDeleteLikedRecipe,
    handleGetRecipesFromAPI,
    handleGetFavoriteRecipesOfUser,
    handleGetLikedRecipesOfUser
};
exports.functions = functions