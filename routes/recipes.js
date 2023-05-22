var express = require("express");
var router = express.Router();
const recipes_utils = require("./utils/recipes_utils");
require("dotenv").config();
router.get("/", (req, res) => res.send("im here"));


/**
 * This path returns a full details of a recipe by its id
 */
// router.get("/:recipeId", async (req, res, next) => {
//   try {
//     const recipe = await recipes_utils.getRecipeDetails(req.params.recipeId);
//     res.send(recipe);
//   } catch (error) {
//     next(error);
//   }
// });
// 
// router.get("/Hello", async (req, res, next) => {
//   try {
//     const hello = await recipes_utils.Hello();
//     res.send("Hello!!!");}
// );
//It'll print p itself
router.get("/Hello/:p", (req, res) =>{ 
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
