const DButils = require("./DButils");
const fs = require('fs');
async function markAsFavorite(user_id, recipe_id){
    await DButils.execQuery(`insert into FavoriteRecipes values ('${user_id}',${recipe_id})`);
}

async function getFavoriteRecipes(user_id){
    const recipes_id = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${user_id}'`);
    return recipes_id;
}
async function handleAddPrivateRecipeToUser(user_id, recipe){
    let { id, title, readyInMinutes, image, aggregateLikes, vegan, vegetarian, glutenFree } = recipe;
    /**
     * @TODO handle the sql query insert into the right tables
     * @this await DButils.execQuery(`insert into FavoriteRecipes values ('${user_id}',${recipe_id})`);
     */
}
async function handleFavoriteRecipesOfUser(userId){
    const recipesList = await DButils.execQuery(`select recipe_id from FavoriteRecipes where user_id='${userId}'`);
    return recipesList;
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
async function handleAddRecipeToPersonal(currentUserId,recipeId)
{
    let queryExec = await DButils.execQuery(`INSERT INTO personal_recipes (user_id, recipe_id)
    VALUES ('${currentUserId}', '${recipeId}')`);
    return queryExec.data;
}
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

async function handleGetLastVisitedRecipes(userId, limit = 3) {
    let query = `SELECT recipe_id FROM visited_recipes
                 WHERE username = '${userId}'
                 ORDER BY timestamp DESC
                 LIMIT ${limit}`;
    let result = await DButils.execQuery(query);
    return result;
}
/**
 * 
 * 
 * @todo Eitna finish this 
 */
async function handleGetprivaterecipes(userId) {
    let query = `SELECT * FROM recipes
                 WHERE user_id = '${userId}'
                 ORDER BY timestamp DESC
                 LIMIT ${limit}`;
    let result = await DButils.execQuery(query);
    return result;
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


let functions = {
    markAsFavorite,
    getFavoriteRecipes,
    handleAddPrivateRecipeToUser,
    handleFavoriteRecipesOfUser,
    handleDeleteFavoriteRecipesOfUser,
    handleDeleteFamilyRecipeOfUser,
    handleAddRecipeToPersonal,
    handleCreateRecipe,
    handleVisitRecipe,
    handleGetLastVisitedRecipes,
    handleDeleteImage,

};
exports.functions = functions
exports.markAsFavorite = markAsFavorite;
exports.getFavoriteRecipes = getFavoriteRecipes;
