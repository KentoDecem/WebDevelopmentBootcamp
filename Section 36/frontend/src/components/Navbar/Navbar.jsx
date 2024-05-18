import React, { useState } from "react";
import { Link } from 'react-router-dom';
import "./Navbar.css";
import logo from "../Assets/logo.png";
import cart_icon from "../Assets/cart_icon.png";

function Navbar() {
  const [menu, setMenu] = useState("strona główna");

  return (
    <div className="navbar">
      <div className="nav-logo">
        <img src={logo} alt="" />
        <p>Amereo</p>
      </div>

      <ul className="nav-menu">
        <li onClick={() => setMenu("strona główna")}>
          <Link to='/'>Strona Główna</Link>{menu === "strona główna" && <hr />}
        </li>
        <li onClick={() => setMenu("świeczki")}>
        <Link to='/swieczki'>Świeczki</Link>{menu === "świeczki" && <hr />}
        </li>
        <li onClick={() => setMenu("blog")}>
        <Link to='/blog'>Blog</Link>{menu === "blog" && <hr />}
        </li>
        <li onClick={() => setMenu("kontakt")}>
        <Link to='/kontakt'>Kontakt</Link>{menu === "kontakt" && <hr />}
        </li>
        <li onClick={() => setMenu("o nas")}>
        <Link to='/o_nas'>O nas</Link>{menu === "o nas" && <hr />}
        </li>
      </ul>

      <div className="nav-login-cart">
        <Link to='/login'><button>Login</button></Link>
        <Link to='/cart'><img src={cart_icon} /></Link>
        <div className="nav-cart-count">0</div>
      </div>
    </div>
  );
}

export default Navbar;
