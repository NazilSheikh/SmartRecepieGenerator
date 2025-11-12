 



import React, { useEffect, useState } from "react";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import foodImg from "../assets/foodRecipe.png";
import { BsStopwatchFill } from "react-icons/bs";
import { FaHeart } from "react-icons/fa6";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import axios from "axios";
import { FaStar } from "react-icons/fa";
export default function RecipeItems() {
  const recipes = useLoaderData();
  const [allRecipes, setAllRecipes] = useState();
  const [isFavRecipe, setIsFavRecipe] = useState(false);

  const navigate = useNavigate();
  const path = window.location.pathname === "/myRecipe";
  let favItems = JSON.parse(localStorage.getItem("fav")) ?? [];

  useEffect(() => {
    setAllRecipes(recipes);
  }, [recipes]);

  const onDelete = async (id, e) => {
    e.stopPropagation();  

    const confirmDelete = window.confirm("🗑️ Are you sure you want to delete this recipe?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/recipe/${id}`);
      setAllRecipes((recipes) => recipes.filter((recipe) => recipe._id !== id));
      let filterItem = favItems.filter((recipe) => recipe._id !== id);
      localStorage.setItem("fav", JSON.stringify(filterItem));
      alert(" Recipe deleted successfully!");
    } catch (err) {
      console.error(err);
      alert(" Failed to delete recipe.");
    }
  };

  const favRecipe = (item, e) => {
    e.stopPropagation(); 
    let filterItem = favItems.filter((recipe) => recipe._id !== item._id);
    favItems =
      favItems.filter((recipe) => recipe._id === item._id).length === 0
        ? [...favItems, item]
        : filterItem;
    localStorage.setItem("fav", JSON.stringify(favItems));
    setIsFavRecipe((pre) => !pre);
  };


const rateRecipe = async (e, recipeId, star) => {
  e.stopPropagation();
  try {
    await axios.post(
      "http://localhost:5000/recipe/rate",
      { recipeId, rating: star },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

   
    setAllRecipes((prev) =>
      prev.map((r) =>
        r._id === recipeId ? { ...r, averageRating: star } : r
      )
    );
  } catch (err) {
    console.error("Rating failed:", err);
    alert(" Unable to submit rating");
  }
};


  return (
    <>
      <div className="card-container">
        {allRecipes?.map((item, index) => {
          return (
            <div key={index} className="card">
            
              <img
                src={`http://localhost:5000/images/${item.coverImage}`}
                width="120px"
                height="100px"
                alt="recipe"
                onClick={() => navigate(`/recipe/${item._id}`)}
                style={{ cursor: "pointer", width: "100%", borderRadius: "4px" }}
              />
              <div className="rating">
  {[1, 2, 3, 4, 5].map((star) => (
    <FaStar
      key={star}
      onClick={(e) => rateRecipe(e, item._id, star)}
      color={star <= (item.averageRating || 0) ? "#FFD700" : "#ccc"}
      style={{ cursor: "pointer", marginRight: "3px" }}
    />
  ))}
</div>

              <div className="card-body">
                <div className="title">{item.title}</div>
                <div className="icons">
                  <div className="timer">
                    <BsStopwatchFill />
                    {item.time}
                  </div>

                  {!path ? (
                  
                    <FaHeart
                      onClick={(e) => favRecipe(item, e)}
                      style={{
                        color: favItems.some((res) => res._id === item._id)
                          ? "red"
                          : "",
                        cursor: "pointer",
                      }}
                    />
                  ) : (
                   
                    <div className="action">
                      <Link
                        to={`/editRecipe/${item._id}`}
                        className="editIcon"
                        onClick={(e) => e.stopPropagation()} 
                      >
                        <FaEdit />
                      </Link>

                      <MdDelete
                        onClick={(e) => onDelete(item._id, e)}
                        className="deleteIcon"
                        title="Delete Recipe"
                      />
                    </div>



                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}






 