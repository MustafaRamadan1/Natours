/*eslint-disable */
const passwordForm = document.querySelector('.form-user-password');
const userForm  = document.getElementById('updateForm');
const emailUpdate = document.getElementById('email');
const nameUpdate =  document.getElementById('name');
const currentPassword = document.getElementById('password-current');
const newPassword = document.getElementById('password');
const newPasswordConfirm = document.getElementById('password-confirm');
const saveBtn = document.querySelector('#save-btn');



const updatePassword = async (currentPassword, newPassword)=>{

    try{
        const res = await axios({
            method: 'PATCH',
            url: 'http://localhost:3000/api/v1/users/updatePassword',
            data : {
                currentPassword, newPassword
            }
        });
        console.log(res)
       if(res.data.status = "success"){
        showAlert('success', `${'Password'.toUpperCase()} update Successfully`)
       }
       console.log(res.data);

    //    setTimeout(()=>{
    //     location.reload(true);
    //    }, 1000)
        
    }
    catch(error){
        console.log(error)
       showAlert('error', error.response)
    }
}


userForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    updateSettings({ name: nameUpdate.value, email: emailUpdate.value}, 'data' )
})





passwordForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    saveBtn.innerText = '....loading'
    console.log(currentPassword.value, newPassword.value);
   await  updatePassword(currentPassword.value, newPassword.value);
    saveBtn.innerText = "save Password";
    currentPassword.value = "";
    newPassword.value = "";
})

