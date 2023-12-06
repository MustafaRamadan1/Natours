/*eslint-disable */
import {login} from './login.js';
import '@babel/polyfill';
import {displayMap} from './mapBox.js';

//VALUES

const email = document.getElementById('email');
const password = document.getElementById('password');
const loginForm = document.querySelector('.form');

// DOM
const mapBox = document.getElementById('map');

if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);

  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    login(email.vale, password.value);
    console.log(email, password);
  });
}
