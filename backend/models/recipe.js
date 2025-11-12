 






const mongoose = require("mongoose");

const recipeSchema = mongoose.Schema({
  title: { type: String, required: true },
  ingredients: { type: [String], required: true },
  instructions: { type: String, required: true },
  time: { type: String },
  dietaryPreference: {
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'non-vegetarian', 'others'],
    default: 'others'
  },
  cuisineType: { type: String },
  coverImage: { type: String },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  // ⭐ New rating fields
  ratings: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      value: { type: Number, min: 1, max: 5 }
    }
  ],
  averageRating: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

 
recipeSchema.methods.calculateAverageRating = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
  } else {
    const total = this.ratings.reduce((sum, r) => sum + r.value, 0);
    this.averageRating = total / this.ratings.length;
  }
  return this.averageRating;
};

module.exports = mongoose.model("Recipes", recipeSchema);
