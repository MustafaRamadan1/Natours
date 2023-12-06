/*eslint-disable */


const logoutEl = document.querySelector('.nav__el--logout');
const logout = async () => {
    try
    {
     const res = await axios({
         method: 'GET',
         url: 'http://localhost:3000/api/v1/users/logout'
     });
    
     if(res.data.status === "success"){
         showAlert(res.data.status, `Logging Out Success`);
         setTimeout(()=>{
             location.reload(true);
         }, 1500)
     }
 
     // console.log(res.data);
    
    }
    catch (error){
     console.log(error);
     showAlert('error', error.response.data.message);
    }
};

if (logoutEl) {
  logoutEl.addEventListener('click', logout);
}





