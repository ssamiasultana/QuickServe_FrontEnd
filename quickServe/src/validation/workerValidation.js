import * as Yup from 'yup';

export const workerValidationSchema = Yup.object({
  name: Yup.string()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters'),

  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),

  phone: Yup.string()
    .matches(/^\d{10,15}$/, 'Phone number must be 11 digits')
    .required('Phone number is required'),

  age: Yup.number()
    .required('Age is required')
    .positive('Age must be positive')
    .integer('Age must be an integer'),

  service_ids: Yup.array()
    .of(Yup.number().required('Service ID is required'))
    .min(1, 'At least one service is required'),
  expertise_of_service: Yup.array()
    .of(
      Yup.number()
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating must be at most 5')
    )
    .min(1, 'At least one expertise rating is required'),

  shift: Yup.string().required('Select shift'),

  feedback: Yup.string().max(200, 'Feedback can’t exceed 200 characters'),
});
