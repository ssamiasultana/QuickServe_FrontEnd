import * as Yup from "yup";

export const workerValidationSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),

  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),

  phone: Yup.string()
    .matches(/^\d{10,15}$/, "Phone number must be 10-15 digits")
    .required("Phone number is required"),

  age: Yup.number()
    .required("Age is required")
    .positive("Age must be positive")
    .integer("Age must be an integer"),

  nid: Yup.string()
    .matches(/^\d{10,17}$/, "NID must be 10–17 digits")
    .required("NID is required"),

  serviceType: Yup.array()
    .min(1, "Select at least one service type")
    .required("Select at least one service type"),

  expertise: Yup.number()
    .required("Enter expertise level")
    .min(1, "Minimum value is 1")
    .max(10, "Maximum value is 10"),

  shift: Yup.string().required("Select shift"),

  rating: Yup.number()
    .required("Rating is required")
    .min(1, "Minimum rating is 1")
    .max(5, "Maximum rating is 5"),

  feedback: Yup.string().max(200, "Feedback can’t exceed 200 characters"),
});
