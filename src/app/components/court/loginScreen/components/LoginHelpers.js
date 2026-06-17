export const validateLoginFormFields = (username, password) => {
    let errors = {};
    let isValid = true;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!username.trim() || !emailRegex.test(username)) {
      errors.username = "يرجى إدخال بريد إلكتروني صحيح";
      isValid = false;
    }
    
    if (!password.trim()) {
      errors.password = "يرجى إدخال كلمة المرور";
      isValid = false;
    }
  
    return { isValid, errors };
};

export const validatePasswordChangeFields = (password, newPassword, confirmPassword) => {
    let errors = {};
    let isValid = true;
    
    if (!password.trim()) {
      errors.currentPassword = "يرجى إدخال كلمة المرور الحالية";
      isValid = false;
    }
    
    if (!newPassword.trim() || newPassword.length < 6) {
      errors.newPassword = "يجب أن تتكون كلمة المرور من 6 خانات على الأقل";
      isValid = false;
    }
    
    if (!confirmPassword.trim() || newPassword !== confirmPassword) {
      errors.confirmPassword = "كلمتا المرور غير متطابقتين";
      isValid = false;
    }

    return { isValid, errors };
};