import React from "react";
import { NavLink } from "react-router-dom";
 

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-left">
          <h3> Smart Recipe Generator </h3>
          <p>
            Discover, share, and explore mouth-watering recipes — all crafted with love, creativity, and a dash of AI inspiration. ✨🍽️
          </p>
        </div>

        <div className="footer-center">
          <h4>Quick Links</h4>
          <ul>
            <li><NavLink to="/">Home</NavLink></li>
            <li><NavLink to="/myRecipe">My Recipes</NavLink></li>
            <li><NavLink to="/favRecipe">Favourites</NavLink></li>
          </ul>
        </div>

        <div className="footer-right">
          <h4>Follow Us</h4>
          <div className="social-icons">
            <a href="#"><i className="fab fa-facebook-f"></i></a>
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 Smart Recipe Generator (By - Nazil Sheikh) | All Rights Reserved</p>
      </div>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

    </footer>
  );
}
