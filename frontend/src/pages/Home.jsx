 



import React, { useEffect, useState } from "react";
import foodRecipe from "../assets/foodRecipe.png";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RecipeItems from "../components/RecipeItems";
import { useNavigate } from "react-router-dom";
import Modal from "../components/Modal";
import InputForm from "../components/InputForm";
import axios from "axios";

export default function Home() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  const addRecipe = () => {
    const token = localStorage.getItem("token");
    if (token) navigate("/addRecipe");
    else setIsOpen(true);
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const favItems = JSON.parse(localStorage.getItem("fav")) || [];
      const favIds = favItems.filter(f => f && f._id).map(f => f._id).join(",");

      if (!favIds) {
        setSuggestedRecipes([]);
        setLoading(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(
        `http://localhost:5000/recipe/suggestions?favIds=${favIds}`,
        { headers: { Authorization: "Bearer " + token } }
      );
      setSuggestedRecipes(res.data || []);
    } catch (error) {
      console.error(" Error loading suggestions:", error);
    } finally {
      setLoading(false);
    }
  };

  const openRecipe = (id) => navigate(`/recipe/${id}`);

  return (
    <>
      <Navbar />

     


<section className="home">
  <div className="left">
    <h1>Discover. Share. Save. Favorite. Create — all powered by AI. 🤖✨</h1>
    <p>
      Design your own recipes or explore intelligent AI suggestions crafted around your taste, dietary needs, and cooking time.
Whether you’re vegan, gluten-free, or in a hurry — we’ve got the perfect match waiting for you!
    </p>
    <button onClick={addRecipe}>+ Create Your Recipe</button>
  </div>
  <div className="right">
    <img src={foodRecipe} alt="Food illustration" />
  </div>
</section>

 


      <div className="bg">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#d4f6e8"
            fillOpacity="1"
            d="M0,64L48,85.3C96,107,192,149,288,144C384,139,480,85,576,90.7C672,96,768,160,864,181.3C960,203,1056,181,1152,165.3C1248,149,1344,139,1392,133.3L1440,128V320H0Z"
          ></path>
        </svg>
      </div>

      {isOpen && (
        <Modal onClose={() => setIsOpen(false)}>
          <InputForm setIsOpen={() => setIsOpen(false)} />
        </Modal>
      )}

      
      <section className="recipes-section">
        <h2>Mouth-Watering Recipess 😋🤖</h2>
        <RecipeItems />
      </section>

     
      <section className="recipes-section">
        <h2>✨ Recipes You Might Like (Suggested By Our Ai) </h2>

        {loading ? (
          <p className="loading">⏳ Loading personalized suggestions...</p>
        ) : suggestedRecipes.length === 0 ? (
          <p className="no-data">No suggestions yet ⭐ — add favorites ❤️ or rate recipes 😊 to unlock personalized AI recommendations!</p>
        ) : (
          <div className="card-grid">
            {suggestedRecipes.map((item, idx) => (
              <div key={idx} className="card" onClick={() => openRecipe(item._id)}>
                <img
                  src={`http://localhost:5000/images/${item.coverImage}`}
                  alt={item.title}
                />
                <div className="card-body">
                  <h4>{item.title}</h4>
                  <p>⏱ {item.time || "30 mins"}</p>
                  <p>🥗 {item.dietaryPreference}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      
    </>
  );
}
