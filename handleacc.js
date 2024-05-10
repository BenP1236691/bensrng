// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js';
console.log("done")
// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBazl1TiD0PxEXCPIbqbCwKPUQMd3ZFhpY",
    authDomain: "bensrng-3fda3.firebaseapp.com",
    projectId: "bensrng-3fda3",
    storageBucket: "bensrng-3fda3.appspot.com",
    messagingSenderId: "578564869865",
    appId: "1:578564869865:web:1289f93ecbdaa029feaa78",
    measurementId: "G-DYR9C5GPJK"
  };

// Initialize Firebase
initializeApp(firebaseConfig);
getAuth(app);

document.addEventListener('DOMContentLoaded', function () {
    var gloginButton = document.getElementById('googleLoginButton');
    if (gloginButton) {
        gloginButton.addEventListener('click', googleLogin);
    }
    var loginButton = document.getElementById('login-btn');
    if (loginButton) {
        loginButton.addEventListener('click', loginUser);
    }
    var registerbutton = document.getElementById('register-btn');
    if (registerbutton) {
        registerbutton.addEventListener('click', registerUser);
    }
});

// Function to handle Google login
function googleLogin() {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      console.log('User signed in:', user.displayName);
      const msg = document.createElement('p');
      msg.textContent = 'User signed in: ' + user.displayName;
      document.body.appendChild(msg);
    })
    .catch((error) => {
      console.error('Google Sign-In Error', error);
    });
}

// Register user with email and password
function registerUser(email, password) {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log('User registered:', user.email);
    })
    .catch((error) => {
      console.error('Register Error', error.message);
    });
}

// Log in user with email and password
function loginUser(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log('User logged in:', user.email);
    })
    .catch((error) => {
      console.error('Login Error', error.message);
    });
}
