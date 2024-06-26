// handleacc.js
document.addEventListener('DOMContentLoaded', function () {
  var loginButton = document.getElementById('login-btn');
  var registerButton = document.getElementById('register-btn');

  if (loginButton) loginButton.addEventListener('click', loginUser);
  if (registerButton) registerButton.addEventListener('click', registerUser);
});

function registerUser() {
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;

  fetch('http://108.160.142.73:80/register', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
  })
  .then(response => response.text())
  .then(data => alert(data))
  .catch(error => {
      console.error('Error:', error);
      alert('Registration failed. Please try again later.');
  });
}

function loginUser() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  fetch('http://108.160.142.73:80/login', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
  })
  .then(response => response.text())
  .then(data => {
      if (data === 'Login successful') {
          localStorage.setItem('userEmail', email);
          alert('Login successful');
          window.location.href = 'index.html'; // Redirect to main page after login
      } else {
          alert(data);
      }
  })
  .catch(error => {
      console.error('Error:', error);
      alert('Login failed. Please try again later.');
  });
}
