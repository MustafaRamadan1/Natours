/*eslint-disable */
// import {showAlert, hideAlert} from './alert';
const email = document.getElementById('email');
const password = document.getElementById('password');
const loginForm = document.querySelector('.form--login');

 const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
  };
  
  // type is 'success' or 'error'
   const showAlert = (type, msg) => {
    hideAlert();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, 5000);
  };
  

const login  = async (email, password)=>{
   try
   {
    const res = await axios({
        method: 'POST',
        url: 'http://localhost:3000/api/v1/users/login',
        data: {
            email, password
        }
    });

    console.log(res.data.user);
    if(res.data.status === "success"){
        showAlert(res.data.status, `Logging Success`);
        setTimeout(()=>{
            location.assign('/');
        }, 1500)
    }

    // console.log(res.data);
   
   }
   catch (error){
    console.log(error.response.data.status);
    showAlert(error.response.data.status, error.response.data.message);

   }
};


if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
  
      login(email.value, password.value);
      console.log(email, password);
    });
  }
  