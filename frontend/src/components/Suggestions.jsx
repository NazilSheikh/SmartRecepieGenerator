import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const favItems = JSON.parse(localStorage.getItem("fav")) || [];
      const favIds = favItems.map(f => f._id).join(",");

      const res = await axios.get(
        `http://localhost:5000/recipe/suggestions?favIds=${favIds}`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      setSuggestedRecipes(res.data);
    } catch (error) {
      console.error(" Error loading suggestions:", error);
    }
  };

  const openRecipe = (id) => navigate(`/recipe/${id}`);

  return (
    <>
      {/* Existing home content */}
      <section className="home">
        <div className="left">
          <h1>Food Recipe</h1>
          <h5>Share your delicious creations or get inspired by AI-generated recipes!</h5>
          <button onClick={() => navigate("/addRecipe")}>Share your recipe</button>
        </div>
        <div className="right">
          <img src="/assets/foodRecipe.png" width="320px" height="300px" alt="food" />
        </div>
      </section>
 
      {suggestedRecipes.length > 0 && (
        <section className="suggestions">
          <h2>🍳 Recipes You Might Like (Suggested By Our AI Accn to user's Rating and Favourites )</h2>
          <div className="card-container">
            {suggestedRecipes.map((item, idx) => (
              <div
                key={idx}
                className="card"
                onClick={() => openRecipe(item._id)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={`http://localhost:5000/images/${item.coverImage}`}
                  alt={item.title}
                  width="120"
                  height="100"
                />
                <div className="card-body">
                  <div className="title">{item.title}</div>
                  <div className="meta">
                    <span>⏱ {item.time}</span>
                    <span>🥗 {item.dietaryPreference}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
