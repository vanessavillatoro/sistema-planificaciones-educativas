import React, { useState } from 'react';
import './auth.css';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const imagenAuth = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070";

const AuthContent = () => {
  const [esLogin, setEsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '', apellido: '', genero: '', edad: '', email: '', password: ''
  });

  const [passwordValidations, setPasswordValidations] = useState({
    length: false, upper: false, lower: false, number: false, special: false
  });

  const checkPassword = (pass) => {
    setPasswordValidations({
      length: pass.length >= 8,
      upper: /[A-Z]/.test(pass),
      lower: /[a-z]/.test(pass),
      number: /\d/.test(pass),
      special: /[@$!%*?&#]/.test(pass)
    });
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch('https://sistema-planificaciones-educativas.vercel.app/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential })
      });
      const data = await response.json();
      if (response.ok) {
        // Guardamos userId, nombre y la URL de la foto para sincronización total
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userName', data.userName);
        if (data.fotoUrl) localStorage.setItem('userFoto', data.fotoUrl);
        
        window.location.href = '/dashboard';
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Error al conectar con Google");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'password') checkPassword(value);
    
    if (name === 'edad') {
      if (value === "") { setFormData({ ...formData, [name]: "" }); return; }
      if (!/^\d+$/.test(value)) return; 
      const num = parseInt(value);
      if (value.length === 1 && !/[2-9]/.test(value)) return; 
      if (num > 100) return;
      setFormData({ ...formData, [name]: value });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!esLogin) {
      const allValid = Object.values(passwordValidations).every(val => val);
      if (!allValid) { alert("La contraseña no cumple los requisitos"); return; }
    }

    const ruta = esLogin ? '/api/auth/login' : '/api/auth/register';
    try {
      const response = await fetch(`https://sistema-planificaciones-educativas.app${ruta}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userName', data.userName);
        // Si el login manual devuelve foto, la guardamos
        if (data.fotoUrl) localStorage.setItem('userFoto', data.fotoUrl);

        window.location.href = '/dashboard'; 
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  return (
    <div className="auth-container">
      <div className={`auth-card ${!esLogin ? 'flex-reverse' : ''}`}>
        <div className="auth-form-side">
          <h1>{esLogin ? 'Iniciar sesión' : 'Regístrate'}</h1>
          
          <div className="google-btn-container">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert('Error en el login con Google')}
              theme="filled_black"
              text={esLogin ? "signin_with" : "signup_with"}
              shape="pill"
            />
          </div>

          <div className="separator">
            <span>o usa tu correo</span>
          </div>

          <form onSubmit={handleSubmit}>
            {!esLogin && (
              <>
                <input type="text" name="name" placeholder="Nombre" value={formData.name} onChange={handleChange} required />
                <input type="text" name="apellido" placeholder="Apellido" value={formData.apellido} onChange={handleChange} required />
                <select name="genero" value={formData.genero} onChange={handleChange} required>
                  <option value="">Género</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
                <input type="text" name="edad" placeholder="Edad" value={formData.edad} onChange={handleChange} required />
              </>
            )}

            <input type="text" name="email" placeholder="Correo electrónico" value={formData.email} onChange={handleChange} required />
            <input type="password" name="password" placeholder="Contraseña" value={formData.password} onChange={handleChange} required />

            {!esLogin && (
              <div className="password-hints">
                <p style={{ color: passwordValidations.special ? '#2ecc71' : '#e74c3c' }}>
                  {passwordValidations.special ? '✔' : '✖'} Carácter especial (@$!%*?&#)
                </p>
              </div>
            )}
            
            <button type="submit" className="btn-primary">
              {esLogin ? 'Entrar' : 'Registrarse'}
            </button>
          </form>
          
          <p className="switch-text">
            {esLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
            <span onClick={() => setEsLogin(!esLogin)}>
              {esLogin ? ' Crear una cuenta' : ' Iniciar sesión'}
            </span>
          </p>
        </div>

        <div className="auth-image-side">
          <img src={imagenAuth} alt="Auth Visual" className="auth-bg-img" />
          <div className="overlay">
            <p className="quote">
              {esLogin ? (
                <>
                  "El futuro pertenece a quienes creen en la belleza de sus sueños"<br/>
                  — Eleanor Roosevelt
                </>
              ) : (
                <>
                  "La única forma de hacer un gran trabajo es amar lo que haces"<br/>
                  — Steve Jobs
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Auth = () => {
  return (
    <GoogleOAuthProvider clientId="59956714352-khuqjil9htb556ng1ik3rdf42no67nu3.apps.googleusercontent.com">
      <AuthContent />
    </GoogleOAuthProvider>
  );
};

export default Auth;