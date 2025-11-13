 

 

import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

export default function AddFoodRecipe() {
//  Form state
  const [recipeData, setRecipeData] = useState({
    title: "",
    time: "",
    ingredients: [],
    instructions: "",
    dietaryPreference: "others",
    file: null,
  });
  // UI states
  const [imagePreview, setImagePreview] = useState(null);
  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [aiRecipes, setAiRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  //  Ingredient dropdown options
  const ingredientOptions = [
    "Tomato", "Onion", "Garlic", "Cheese", "Paneer", "Chicken", "Milk", "Rice",
    "Potato", "Eggs", "Spinach", "Carrot", "Butter", "Salt", "Pepper", "Cumin",
    "Coriander", "Chili Powder", "Ginger", "Honey", "Lemon", "Olive Oil",
    "Flour", "Sugar", "Bread", "Yogurt", "Basil", "Oregano", "Thyme",
    "Mushroom", "Capsicum", "Corn", "Beans", "Cabbage", "Broccoli", "Cauliflower",
    "Fish", "Tofu", "Peas", "Coconut", "Vinegar", "Mustard", "Mayonnaise",
    "Cream", "Pasta", "Noodles", "Chickpeas", "Cashew", "Almond", "Mint",
  ].map(item => ({ value: item, label: item }));




  const dietaryOptions = [
      { value: "vegetarian", label: "Vegetarian" },
      { value: "vegan", label: "Vegan" },
      { value: "gluten-free", label: "Gluten-Free" },
      { value: "non-vegetarian", label: "Non-Vegetarian" },
      { value: "others", label: "Others" },
    ];

  // Handles text input and image upload
  
  const onHandleChange = (e) => {
    const { name, value, files } = e.target;
    const val = name === "file" ? files[0] : value;
    setRecipeData((prev) => ({ ...prev, [name]: val }));

// Generate preview for selected image
    
    if (name === "file" && files[0]) {
      const imageURL = URL.createObjectURL(files[0]);
      setImagePreview(imageURL);
    }
  };
  // Handles multi-select ingredient dropdown
  const handleIngredientSelect = (selectedOptions) => {
    const selectedIngredients = selectedOptions.map((opt) => opt.value);
    setRecipeData((prev) => ({ ...prev, ingredients: selectedIngredients }));
  };


//  Handles dietary preference dropdown

  const handleDietaryChange = (selectedOption) => {
    setRecipeData((prev) => ({ ...prev, dietaryPreference: selectedOption.value }));
  };


  // Sends image to backend for ingredient detection (Gemini Vision)


  const handleImageUpload = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/ai/ingredients/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.ingredients?.length) {
        setDetectedIngredients(res.data.ingredients);
        alert(" Gemini detected: " + res.data.ingredients.join(", "));
      } else {
        alert(" No clear ingredients detected.");
      }
    } catch (error) {
      console.error(error);
      alert(" Gemini image analysis failed.");
    } finally {
      setLoading(false);
    }
  };




  // Handles manual recipe submission


  const onHandleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (let key in recipeData) {
      if (key === "ingredients") formData.append(key, recipeData[key].join(","));
      else formData.append(key, recipeData[key]);
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:5000/recipe", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      });
      alert("✅ Recipe added successfully!");
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("❌ Error adding recipe.");
    } finally {
      setLoading(false);
    }
  };

    // Requests AI (SSE stream) to generate recipe ideas

const generateRecipes = async () => {
  try {
    setLoading(true);
    setAiRecipes([]);


//  Prefer selected ingredients → else detected ones

    const ingredientsList = recipeData.ingredients.length
      ? recipeData.ingredients.join(", ")
      : detectedIngredients.join(", ");

    if (!ingredientsList) {
      alert("⚠️ Please select or detect ingredients first!");
      setLoading(false);
      return;
    }

    const url = `http://localhost:5000/ai/recipeStream?ingredients=${ingredientsList}`;
    const eventSource = new EventSource(url);
    const tempRecipes = [];

  //  Receive SSE stream message-by-message

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.action === "recipe") {
        const r = data.recipe;

      //  Append nutrition info into final instruction text
    
        let nutritionText = "";
        if (r.nutrition) {
          nutritionText = `
          
---  
🍽️ **Nutrition Info:**  
Calories: ${r.nutrition.calories || "N/A"}  
Protein: ${r.nutrition.protein || "N/A"}  
Carbs: ${r.nutrition.carbs || "N/A"}  
Fat: ${r.nutrition.fat || "N/A"}
`;
        }

        const recipeWithNutrition = {
          ...r,
          instructions: r.instructions + nutritionText,
          imagePreview: imagePreview, 
        };

        tempRecipes.push(recipeWithNutrition);
        setAiRecipes([...tempRecipes]);
      } else if (data.action === "close") {
        eventSource.close();
        setLoading(false);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      setLoading(false);
      alert(" AI recipe generation failed.");
    };
  } catch (error) {
    console.error(error);
    alert(" Failed to connect to AI service.");
    setLoading(false);
  }
};



  // Saves an AI-generated recipe into the database

const saveAiRecipe = async (recipe) => {
  if (!recipeData.file) {
    alert("⚠️ Please upload an image first!");
    return;
  }

  const formData = new FormData();
  formData.append("title", recipe.title);
  formData.append("instructions", recipe.instructions); 
  formData.append("ingredients", recipe.ingredients.join(","));
  formData.append("time", recipe.time || recipeData.time || "30 minutes");
  formData.append("dietaryPreference", recipeData.dietaryPreference);
  formData.append("file", recipeData.file);

  try {
    await axios.post("http://localhost:5000/recipe", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
    alert(" AI Recipe saved successfully with image and nutrition info!");
  } catch (err) {
    console.error(err);
    alert(" Failed to save recipe.");
  }
};


  return (
    <div className="container">
      <h2>Create with AI 🤖 or Fill Manually ✍️ — unleash your inner chef! 👨‍🍳🔥 </h2>
      <form className="form" onSubmit={onHandleSubmit}>
        {/* Title */}
        <div className="form-control">
          <label>🍽️ Title — 🧠💡 “What’s cooking?”</label>
          <input
            type="text"
            className="input"
            name="title"
            value={recipeData.title}
            onChange={onHandleChange}
            required
          />
        </div>

        {/* Time */}
        <div className="form-control">
          <label>Time ⏰ (e.g., 30 mins)—because every recipe has its moment!</label>
          <input
            type="text"
            className="input"
            name="time"
            value={recipeData.time}
            onChange={onHandleChange}
          />
        </div>

       
        <div className="form-control">
          <label>🥦 Ingredients — the real heroes of your recipe!</label>
          <Select
            isMulti
            name="ingredients"
            options={ingredientOptions}
            onChange={handleIngredientSelect}
            placeholder="Select or type ingredients..."
            isClearable
            isSearchable
          />
        </div>
<div className="form-control">
         <label>🔥 Difficulty — how brave are you in the kitchen?</label>
  <select
    name="complexity"
    className="input"
    value={recipeData.complexity || "Intermediate"}
    onChange={onHandleChange}
  >
    <option>Easy</option>
    <option>Intermediate</option>
    <option>Advanced</option>
  </select>
</div>
       
        {detectedIngredients.length > 0 && (
          <div className="detected">
            <b>Detected Ingredients:</b> {detectedIngredients.join(", ")}
          </div>
        )}
 
        <div className="form-control">
          <label>🥗 Dietary Preference — for every foodie’s lifestyle!</label>
          <Select
            name="dietaryPreference"
            options={dietaryOptions}
            defaultValue={dietaryOptions.find((o) => o.value === "others")}
            onChange={handleDietaryChange}
          />
        </div>
 
        <div className="form-control">
          <label>📜 Instructions — your master chef roadmap!</label>
          <textarea
            className="input-textarea"
            name="instructions"
            rows="5"
            value={recipeData.instructions}
            onChange={onHandleChange}
          />
        </div>
 
        <div className="form-control">
          <label>📸 Recipe Image (used for AI too) — say cheese to AI magic!</label>
          <input
            type="file"
            className="input"
            name="file"
            accept="image/*"
            onChange={(e) => {
              onHandleChange(e);
              handleImageUpload(e.target.files[0]);
            }}
          />
          {imagePreview && (
            <div style={{ marginTop: "10px" }}>
              <img
                src={imagePreview}
                alt="Preview"
                width="150"
                height="120"
                style={{ borderRadius: "10px" }}
              />
            </div>
          )}
        </div>
 
        <div className="form-control flex gap-3">
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Add Recipe ✍️"}
          </button>
          <button type="button" onClick={generateRecipes} disabled={loading}>
            {loading ? "Generating..." : "Generate AI Recipe 🤖"}
          </button>
        </div>
      </form>

 




<div className="ai-recipes">
  <h3>✨ AI Generated Recipes</h3>
  <div className="recipe-grid">
    {aiRecipes.length > 0 && (
  <div className="ai-recipes">
    <h3>✨ AI Generated Recipes</h3>
    <div className="recipe-grid">
      {aiRecipes.map((r, idx) => (
        <div key={idx} className="recipe-card">
          {/* Use uploaded preview image */}
          {r.imagePreview && (
            <img
              src={r.imagePreview}
              alt={r.title}
              width="220"
              height="200"
              style={{ borderRadius: "10px" }}
            />
          )}
          <h4>{r.title}</h4>
          <p><b>Time:</b> {r.time}</p>
          <p><b>Calories:</b> {r.nutrition?.calories}</p>
          <p><b>Protein:</b> {r.nutrition?.protein}</p>
          <button
            onClick={() => saveAiRecipe(r)}
            className="btn-primary"
          >
            ➕ Add Recipe
          </button>
        </div>
      ))}
    </div>
  </div>
)}

  </div>
</div>


    </div>
  );
}
