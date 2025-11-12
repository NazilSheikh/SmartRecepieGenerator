const Recipes=require("../models/recipe")
const multer  = require('multer')
 
const mongoose = require("mongoose");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images')
    },
    filename: function (req, file, cb) {
      const filename = Date.now() + '-' + file.fieldname
      cb(null, filename)
    }
  })
  
  const upload = multer({ storage: storage })

const getRecipes=async(req,res)=>{
    const recipes=await Recipes.find()
    return res.json(recipes)
}

 

const getRecipe = async (req, res) => {
  try {
 
    const recipe = await Recipes.findById(req.params.id).populate("createdBy", "email");

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json(recipe);
  } catch (err) {
    console.error(" Error fetching recipe:", err);
    res.status(500).json({ message: "Failed to fetch recipe" });
  }
};





// const addRecipe=async(req,res)=>{
//     console.log(req.user)
//     const {title,ingredients,instructions,time}=req.body 

//     if(!title || !ingredients || !instructions)
//     {
//         res.json({message:"Required fields can't be empty"})
//     }

//     const newRecipe=await Recipes.create({
//         title,ingredients,instructions,time,coverImage:req.file.filename,
//         createdBy:req.user.id
//     })
//    return res.json(newRecipe)
// }




const addRecipe = async (req, res) => {
    const { title, ingredients, instructions, time, dietaryPreference, cuisineType } = req.body;

    if (!title || !ingredients || !instructions) {
        return res.json({ message: "Required fields can't be empty" });
    }

    try {
        const newRecipe = await Recipes.create({
            title,
            ingredients: Array.isArray(ingredients) ? ingredients : ingredients.split(","),
            instructions,
            time,
            dietaryPreference,
            cuisineType,
            coverImage: req.file ? req.file.filename : null,
            createdBy: req.user.id
        });

        return res.json(newRecipe);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Failed to add recipe" });
    }
};


const editRecipe=async(req,res)=>{
    const {title,ingredients,instructions,time}=req.body 
    let recipe=await Recipes.findById(req.params.id)

    try{
        if(recipe){
            let coverImage=req.file?.filename ? req.file?.filename : recipe.coverImage
            await Recipes.findByIdAndUpdate(req.params.id,{...req.body,coverImage},{new:true})
            res.json({title,ingredients,instructions,time})
        }
    }
    catch(err){
        return res.status(404).json({message:err})
    }
    
}
const deleteRecipe=async(req,res)=>{
    try{
        await Recipes.deleteOne({_id:req.params.id})
        res.json({status:"ok"})
    }
    catch(err){
        return res.status(400).json({message:"error"})
    }
}


// ===================== //
// 🍽️ Recipe Suggestions //
// ===================== //



// const getSuggestions = async (req, res) => {
//   try {
//     const user = req.user; // from token
//     const favIds = req.query.favIds?.split(",") || []; // client sends list of favorite IDs

//     if (!favIds.length) {
//       // if user has no favorites, just return top-rated or random recipes
//       const randomRecipes = await Recipes.aggregate([{ $sample: { size: 5 } }]);
//       return res.json(randomRecipes);
//     }

//     // Get all user's favorite recipes
//     const favRecipes = await Recipes.find({ _id: { $in: favIds } });

//     // Collect preferred ingredients and dietary preferences
//     const allIngredients = favRecipes.flatMap(r => r.ingredients);
//     const allDiets = favRecipes.map(r => r.dietaryPreference);

//     // Find similar recipes
//     const suggestions = await Recipes.find({
//       ingredients: { $in: allIngredients },
//       dietaryPreference: { $in: allDiets },
//       _id: { $nin: favIds }, // exclude already-favorited
//     }).limit(8);

//     res.json(suggestions);
//   } catch (err) {
//     console.error("❌ Suggestion Error:", err);
//     res.status(500).json({ message: "Failed to fetch suggestions" });
//   }
// };


// const getSuggestions = async (req, res) => {
//   try {
//     const favIds = req.query.favIds?.split(",").filter(Boolean) || [];
//     console.log("🧩 Received favIds:", favIds);

//     const validFavIds = favIds.filter((id) => mongoose.Types.ObjectId.isValid(id));
//     console.log("✅ Valid favIds:", validFavIds);

//     if (!validFavIds.length) {
//       console.log("⚠️ No valid favorites found — returning random recipes");
//       const randomRecipes = await Recipes.aggregate([{ $sample: { size: 5 } }]);
//       return res.json(randomRecipes);
//     }

//     const favRecipes = await Recipes.find({ _id: { $in: validFavIds } });
//     console.log("💾 Found favorite recipes:", favRecipes.length);

//     const allIngredients = favRecipes.flatMap(r => r.ingredients || []);
//     const allDiets = favRecipes.map(r => r.dietaryPreference).filter(Boolean);
//     console.log("🧂 Ingredients collected:", allIngredients);

//     const suggestions = await Recipes.find({
//       _id: { $nin: validFavIds },
//       $or: [
//         { ingredients: { $in: allIngredients } },
//         { dietaryPreference: { $in: allDiets } },
//       ],
//     }).limit(8);

//     console.log("✨ Suggestions found:", suggestions.length);
//     return res.json(suggestions);
//   } catch (err) {
//     console.error("❌ Suggestion Error:", err);
//     res.status(500).json({ message: "Failed to fetch recipe suggestions" });
//   }
// };


 
const getSuggestions = async (req, res) => {
  try {
    const favIds = req.query.favIds?.split(",").filter(Boolean) || [];
    console.log("🧩 Received favIds:", favIds);

    const validFavIds = favIds.filter(id => mongoose.Types.ObjectId.isValid(id));
    console.log("✅ Valid favIds:", validFavIds);

    if (!validFavIds.length) {
      console.log("⚠️ No valid favorites found — returning random recipes");
      const randomRecipes = await Recipes.aggregate([{ $sample: { size: 5 } }]);
      return res.json(randomRecipes); // ✅ return to stop further execution
    }

    const favRecipes = await Recipes.find({ _id: { $in: validFavIds } });
    console.log("💾 Found favorite recipes:", favRecipes.length);

    const allIngredients = favRecipes.flatMap(r => r.ingredients || []);
    const allDiets = favRecipes.map(r => r.dietaryPreference).filter(Boolean);
    console.log("🧂 Ingredients collected:", allIngredients);

    const suggestions = await Recipes.find({
      _id: { $nin: validFavIds },
      $or: [
        { ingredients: { $in: allIngredients } },
        { dietaryPreference: { $in: allDiets } },
      ],
    }).limit(8);

    console.log("✨ Suggestions found:", suggestions.length);
    return res.json(suggestions); // ✅ return here too
  } catch (err) {
    console.error("❌ Suggestion Error:", err);
    return res.status(500).json({ message: "Failed to fetch recipe suggestions" }); // ✅ return
  }
};



// ⭐ Rate a recipe
const rateRecipe = async (req, res) => {
  try {
    const { recipeId, rating } = req.body;
    const userId = req.user.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Invalid rating value" });
    }

    const recipe = await Recipes.findById(recipeId);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // Check if user has rated before
    const existingRating = recipe.ratings.find(r => r.user.toString() === userId);
    if (existingRating) {
      existingRating.value = rating;
    } else {
      recipe.ratings.push({ user: userId, value: rating });
    }

    // Update average rating
    recipe.calculateAverageRating();
    await recipe.save();

    return res.json({ message: "Rating updated", averageRating: recipe.averageRating });
  } catch (err) {
    console.error("❌ Rating Error:", err);
    return res.status(500).json({ message: "Failed to rate recipe" });
  }
};



module.exports = {
  getRecipes,
  getRecipe,
  addRecipe,
  editRecipe,
  deleteRecipe,
  upload,
  getSuggestions,
    rateRecipe
};


// module.exports={getRecipes,getRecipe,addRecipe,editRecipe,deleteRecipe,upload}