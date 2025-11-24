import authService from "../services/authService";
import {
  loginValidationSchema,
  signUpValidationSchema,
} from "../validation/authValidation";

export const signUpAction = async (prevState, formData, loginFunction) => {
  try {
    const values = Object.fromEntries(formData);

    await signUpValidationSchema.validate(values, { abortEarly: false });

    const userData = {
      name: values.name,
      email: values.email,
      password: values.password,
      phone: values.phone,
      role: values.role,
      password_confirmation: values.password_confirmation,
    };

    const response = await authService.signUp(userData);
    if (loginFunction && response.token && response.user) {
      loginFunction(response.token, response.user);
    }

    return {
      success: true,
      message: "Account created successfully!",
      data: response.data || response,
      errors: {},
    };
  } catch (error) {
    if (error.name === "ValidationError" && error.inner) {
      const errors = {};
      error.inner.forEach((err) => {
        errors[err.path] = err.message;
      });

      return {
        success: false,
        message: "Please fix the validation errors",
        errors: errors,
        data: null,
      };
    }
    if (error.response && error.response.errors) {
      return {
        success: false,
        message: error.response.message || "Validation failed",
        errors: error.response.errors,
        data: null,
      };
    }

    return {
      success: false,
      message: error.message || "Sign up failed. Please try again.",
      errors: {},
      data: null,
    };
  }
};

// Login Action
export const loginAction = async (prevState, formData, loginFunction) => {
  try {
    const values = Object.fromEntries(formData);

    await loginValidationSchema.validate(values, { abortEarly: false });

    const credentials = {
      email: values.email,
      password: values.password,
    };

    const response = await authService.login(credentials);
    if (loginFunction && response.token && response.user) {
      loginFunction(response.token, response.user);
    }

    return {
      success: true,
      message: "Login successful!",
      data: response.data || response,
      errors: {},
    };
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = {};
      error.inner.forEach((err) => {
        errors[err.path] = err.message;
      });

      return {
        success: false,
        message: "Please fix the validation errors",
        errors: errors,
        data: null,
      };
    }

    return {
      success: false,
      message: error.message || "Login failed. Please check your credentials.",
      errors: {},
      data: null,
    };
  }
};

export default { signUpAction, loginAction };
