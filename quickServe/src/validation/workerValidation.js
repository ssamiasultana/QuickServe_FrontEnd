import * as Yup from 'yup';

// NID Pattern constants
const OLD_NID_PATTERN = /^\d{10}$/; // Old 10-digit NID
const NEW_NID_PATTERN = /^\d{13}$|^\d{17}$/; // New 13 or 17-digit NID

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
  nid: Yup.string()
    .required('NID is required')
    .test('valid-nid-format', 'NID must be 10, 13, or 17 digits', (value) => {
      if (!value) return false;
      const cleaned = value.replace(/\s+/g, '');
      return OLD_NID_PATTERN.test(cleaned) || NEW_NID_PATTERN.test(cleaned);
    })
    .test('nid-digits-only', 'NID must contain only digits', (value) => {
      if (!value) return false;
      const cleaned = value.replace(/\s+/g, '');
      return /^\d+$/.test(cleaned);
    }),
  nid_front_image: Yup.string().nullable().url('Invalid NID front image URL'),
  nid_back_image: Yup.string().nullable().url('Invalid NID back image URL'),
});

export const validateNIDFormat = (nid) => {
  if (!nid) {
    return { valid: false, message: 'NID is required' };
  }

  const cleaned = nid.replace(/\s+/g, '');

  if (!/^\d+$/.test(cleaned)) {
    return { valid: false, message: 'NID must contain only digits' };
  }

  const length = cleaned.length;

  if (![10, 13, 17].includes(length)) {
    return {
      valid: false,
      message: 'NID must be 10, 13, or 17 digits long',
    };
  }

  return {
    valid: true,
    message: 'Valid NID format',
    type: length === 10 ? 'old' : 'new',
    length,
  };
};

// Helper to extract birth year from new NID format
export const extractBirthYearFromNID = (nid) => {
  const cleaned = nid.replace(/\s+/g, '');
  const length = cleaned.length;

  if (length === 13 || length === 17) {
    return parseInt(cleaned.substring(0, 4), 10);
  }

  return null;
};

// Helper to validate age consistency with NID
export const validateAgeConsistency = (nid, age) => {
  const birthYear = extractBirthYearFromNID(nid);

  if (!birthYear) {
    return {
      valid: true,
      message: 'Cannot extract birth year from old NID format',
    };
  }

  const currentYear = new Date().getFullYear();
  const calculatedAge = currentYear - birthYear;

  // Account for whether birthday has passed this year
  // NID birth year doesn't include month/day, so we allow a range
  const tolerance = 3;
  // Minimum age (if birthday hasn't happened yet this year) - subtract tolerance
  const minAge = calculatedAge - 1 - tolerance;
  // Maximum age (if birthday already happened this year) - add tolerance
  const maxAge = calculatedAge + tolerance;

  // Check if provided age falls within the valid range
  const isValid = age >= minAge && age <= maxAge;

  if (!isValid) {
    return {
      valid: false,
      message: `Age mismatch: NID (birth year ${birthYear}) suggests age between ${minAge}-${maxAge} years, but ${age} was provided`,
    };
  }

  return {
    valid: true,
    message: 'Age is consistent with NID',
  };
};
