const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const OpenAI = require("openai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// SSE streaming route for recipe generation
router.get("/recipeStream", async (req, res) => {
  const { ingredients, mealType, cuisine, cookingTime, complexity } = req.query;

  // Enable Server-Sent Events (SSE)
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Prompt sent to AI model
  const prompt = `
Generate 3 unique, creative recipes based on these details:

Ingredients: ${ingredients || "any available ingredients"}
Meal Type: ${mealType || "Any"}
Cuisine: ${cuisine || "Any"}
Cooking Time: ${cookingTime || "30 minutes"}
Complexity: ${complexity || "Easy"}

Each recipe must include:
- A descriptive title
- Ingredients list with quantities
- Step-by-step cooking instructions
- Nutritional information (Calories, Protein, Carbs)
- Estimated time

Return ONLY a valid JSON array in this exact format (no markdown, no explanations):

[
  {
    "title": "String",
    "ingredients": ["String"],
    "instructions": "String",
    "nutrition": {"calories": "String", "protein": "String", "carbs": "String"},
    "time": "String"
  }
]
`;

  try {
    // Use Gemini as the primary model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);

    let text = result.response.text().trim();

    // Remove any JSON formatting wrapper if Gemini adds it
    text = text.replace(/```json|```/g, "").trim();

    let recipes;
    try {
      // Attempt direct JSON parsing
      recipes = JSON.parse(text);
    } catch (err) {
      // Fallback cleaning in case Gemini returns malformed JSON
      const cleanText = text
        .replace(/[\u0000-\u001F]+/g, "")
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ");
      recipes = JSON.parse(cleanText.match(/\[.*\]/s)[0]);
    }

    // Stream each recipe to the frontend
    for (const recipe of recipes) {
      res.write(`data: ${JSON.stringify({ action: "recipe", recipe })}\n\n`);
    }

    // Notify the client that streaming is complete
    res.write(`data: ${JSON.stringify({ action: "close" })}\n\n`);
    res.end();
  } catch (geminiError) {
    console.error("Gemini failed:", geminiError.message);

    // If Gemini fails, fallback to OpenAI
    try {
      const fallbackPrompt = `
Generate 2 recipes with these ingredients: ${ingredients}.
Each must include title, ingredients, instructions, nutrition info (calories, protein, carbs), and estimated time.
Return as a valid JSON array.
`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: fallbackPrompt }],
      });

      const fallbackText = completion.choices[0].message.content.trim();
      const fallbackRecipes = JSON.parse(
        fallbackText.replace(/```json|```/g, "").trim()
      );

      // Stream fallback recipes
      for (const recipe of fallbackRecipes) {
        res.write(`data: ${JSON.stringify({ action: "recipe", recipe })}\n\n`);
      }

      res.write(`data: ${JSON.stringify({ action: "close" })}\n\n`);
      res.end();
    } catch (openaiError) {
      console.error("Both Gemini & OpenAI failed:", openaiError.message);

      // Error event sent to client
      res.write(
        `data: ${JSON.stringify({
          action: "error",
          error: "AI recipe generation unavailable right now.",
        })}\n\n`
      );
      res.end();
    }
  }

  // Close SSE connection cleanly
  req.on("close", () => res.end());
});

module.exports = router;








// WITHOUT COMMENTS CODE : 

// const express = require("express");
// const router = express.Router();
// const { GoogleGenerativeAI } = require("@google/generative-ai");
// const OpenAI = require("openai");

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
 
// router.get("/recipeStream", async (req, res) => {
//   const { ingredients, mealType, cuisine, cookingTime, complexity } = req.query;

   
//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");

//   const prompt = `
// Generate 3 unique, creative recipes based on these details:

// Ingredients: ${ingredients || "any available ingredients"}
// Meal Type: ${mealType || "Any"}
// Cuisine: ${cuisine || "Any"}
// Cooking Time: ${cookingTime || "30 minutes"}
// Complexity: ${complexity || "Easy"}

// Each recipe must include:
// - A descriptive title
// - Ingredients list with quantities
// - Step-by-step cooking instructions
// - Nutritional information (Calories, Protein, Carbs)
// - Estimated time

// Return ONLY a valid JSON array in this exact format (no markdown, no explanations):

// [
//   {
//     "title": "String",
//     "ingredients": ["String"],
//     "instructions": "String",
//     "nutrition": {"calories": "String", "protein": "String", "carbs": "String"},
//     "time": "String"
//   }
// ]
// `;

//   try {
//     console.log("⚙️ Using Gemini to generate recipes...");
//     const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
//     const result = await model.generateContent(prompt);

//     let text = result.response.text().trim();
//     text = text.replace(/```json|```/g, "").trim();  

//     let recipes;
//     try {
//       recipes = JSON.parse(text);
//     } catch (err) {
//       console.warn("⚠️ Gemini returned invalid JSON. Cleaning...");
//       const cleanText = text
//         .replace(/[\u0000-\u001F]+/g, "")
//         .replace(/\n/g, " ")
//         .replace(/\s+/g, " ");
//       recipes = JSON.parse(cleanText.match(/\[.*\]/s)[0]);
//     }

//     // Stream each recipe one by one
//     for (const recipe of recipes) {
//       res.write(`data: ${JSON.stringify({ action: "recipe", recipe })}\n\n`);
//     }

//     res.write(`data: ${JSON.stringify({ action: "close" })}\n\n`);
//     res.end();
//     console.log(" Gemini recipes streamed successfully!");
//   } catch (geminiError) {
//     console.error(" Gemini failed:", geminiError.message);

     
//     try {
//       const fallbackPrompt = `
// Generate 2 recipes with these ingredients: ${ingredients}.
// Each must include title, ingredients, instructions, nutrition info (calories, protein, carbs), and estimated time.
// Return as a valid JSON array.
// `;
//       const completion = await openai.chat.completions.create({
//         model: "gpt-4o-mini",
//         messages: [{ role: "user", content: fallbackPrompt }],
//       });

//       const fallbackText = completion.choices[0].message.content.trim();
//       const fallbackRecipes = JSON.parse(fallbackText.replace(/```json|```/g, "").trim());

//       for (const recipe of fallbackRecipes) {
//         res.write(`data: ${JSON.stringify({ action: "recipe", recipe })}\n\n`);
//       }

//       res.write(`data: ${JSON.stringify({ action: "close" })}\n\n`);
//       res.end();
//       console.log(" Fallback OpenAI recipe generation successful!");
//     } catch (openaiError) {
//       console.error(" Both Gemini & OpenAI failed:", openaiError.message);
//       res.write(
//         `data: ${JSON.stringify({
//           action: "error",
//           error: "AI recipe generation unavailable right now.",
//         })}\n\n`
//       );
//       res.end();
//     }
//   }

//   req.on("close", () => res.end());
// });

// module.exports = router;

