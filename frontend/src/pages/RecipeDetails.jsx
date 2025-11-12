 

import React from "react";
import { useLoaderData } from "react-router-dom";
import profileImg from "../assets/profile.png";

export default function RecipeDetails() {
  const recipe = useLoaderData();

  if (!recipe) return <p>Loading recipe...</p>;

  return (
    <div className="outer-container">
      <div className="profile">
        <img src={profileImg} width="50px" height="50px" alt="profile" />
        <h5>{recipe.createdBy?.email || "Anonymous"}</h5>
      </div>

      <h3 className="title">{recipe.title}</h3>

      {recipe.coverImage && (
        <img
          src={`http://localhost:5000/images/${recipe.coverImage}`}
          width="220px"
          height="200px"
          alt="recipe"
        />
      )}

      <div className="recipe-details">
        <div className="ingredients">
          <h4>Ingredients</h4>
          <ul>
            {recipe.ingredients?.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="instructions">
          <h4>Instructions</h4>
          {/* <p>{recipe.instructions}</p> */}
        <p style={{ whiteSpace: "pre-line" }}>{recipe.instructions}</p>
        </div>

      </div>
    </div>
  );
}


 