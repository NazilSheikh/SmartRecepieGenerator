 

const express = require("express");
const {
  getRecipes,
  getRecipe,
  addRecipe,
  editRecipe,
  deleteRecipe,
  upload,
  getSuggestions,
  rateRecipe 
} = require("../controller/recipe");

const verifyToken = require("../middleware/auth");
const router = express.Router();

 
router.get("/suggestions", verifyToken, getSuggestions);  
router.post("/rate", verifyToken, rateRecipe);
router.get("/", getRecipes);  
router.post("/", upload.single("file"), verifyToken, addRecipe);  
router.put("/:id", upload.single("file"), editRecipe);  
router.delete("/:id", deleteRecipe);  
router.get("/:id", getRecipe);  

module.exports = router;
