
import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";
import "./AuthPage.css";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(isLogin ? "Login details:" : "Signup details:", form);
  };

  return (
    <main className="auth-container">
      {/* LEFT SECTION */}
      <section className="auth-showcase">
        <div className="auth-logo">
          <span>TripNest</span>
        </div>

        <div className="showcase-content">
          <h1>
            Discover,
            <br />
            Plan &
            <br />
            <span className="highlight-word">Explore</span>
          </h1>

          <p>
            Your personal travel planner
            <br />
            for unforgettable trips.
          </p>

          <div className="purple-line"></div>
        </div>

        <div className="photo photo-one">
          <img
            src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=700"
            alt="Colorful Italian coastal village"
          />
        </div>

        <div className="photo photo-two">
          <img
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=700"
            alt="Snowy mountain landscape"
          />
        </div>

        <div className="photo photo-three">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=700"
            alt="Tropical beach"
          />
        </div>
      </section>

      {/* RIGHT SECTION */}
      <section className="auth-form-section">
        <div className="auth-card">
          <div className="auth-tabs">
            <button
              type="button"
              className={isLogin ? "selected" : ""}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>

            <button
              type="button"
              className={!isLogin ? "selected" : ""}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          <div className="auth-heading">
            <h2>{isLogin ? "Welcome back!" : "Create your account!"}</h2>
            <p>
              {isLogin
                ? "Login to continue planning your next trip."
                : "Join TripNest and start planning your next adventure."}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="auth-input">
                <Mail size={19} />
                <input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="auth-input">
              <Mail size={19} />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-input">
              <Lock size={19} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />

              <button
                type="button"
                className="eye-button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>

            {!isLogin && (
              <div className="auth-input">
                <Lock size={19} />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <button type="submit" className="auth-submit">
              {isLogin ? "Login" : "Create Account"}
              <ArrowRight size={19} />
            </button>
          </form>

          <div className="social-divider">
            <span></span>
            <p>or continue with</p>
            <span></span>
          </div>

          <div className="social-buttons">
            <button type="button" aria-label="Google">
              <span className="google-icon">G</span>
            </button>
            <button type="button" aria-label="GitHub">
              <i className="devicon-github-original"></i>
              <span>GitHub</span>
            </button>
            <button type="button" aria-label="LinkedIn">
              <span className="linkedin-icon">in</span>
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AuthPage;
