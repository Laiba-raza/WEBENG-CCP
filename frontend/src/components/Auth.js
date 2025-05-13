import React, { useState } from "react";
import Login from "./Login";
import Register from "./Register";
import "./Auth.css";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="container">
      {isLogin ? <Login /> : <Register />}
      <div className="switch-button">
        <button onClick={() => setIsLogin(!isLogin)}>
          Switch to {isLogin ? "Register" : "Login"}
        </button>
      </div>
    </div>
  );
};

export default Auth;
