import { useFormik } from 'formik';
import { useState } from 'react';
import Card from '../ui/Card';
import { workerValidationSchema } from '../../validation/workerValidation';
const AddWorker =()=> {
  const [preview, setPreview] = useState(null);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      image: '',
      age: '',
      nid: '',
      serviceType: [],
      expertise: '',
      shift: '',
      rating: '',
    },
    validationSchema: workerValidationSchema,
    onSubmit: (values) => {
      console.log('✅ Form Submitted:', values);
      alert('Form submitted successfully!');
    },
  });

  const handleImageChange = (event) => {
    const file = event.currentTarget.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleServiceTypeChange = (type) => {
    const currentTypes = formik.values.serviceType;
    const updatedTypes = currentTypes.includes(type)
      ? currentTypes.filter((t) => t !== type)
      : [...currentTypes, type];

    formik.setFieldValue('serviceType', updatedTypes);
  };

  return (
    <div className='w-full max-w-4xl mx-auto p-4'>
      <h2 className='text-2xl font-bold text-center mb-6 text-gray-900'>
        Worker Profile Registration
      </h2>

      <Card
        title=''
        className='mb-6'
        bgColor='bg-gradient-to-br from-blue-25 to-white'
        borderColor='border-blue-100'
        >
        <form onSubmit={formik.handleSubmit}>
          <div className='mb-8'>
            <h3 className='text-lg font-semibold text-slate-800 mb-6 pb-2 border-b border-blue-100'>
              Personal Information
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm mb-2 text-gray-600 font-semibold'>
                    Full Name *
                  </label>
                  <input
                    type='text'
                    name='name'
                    placeholder='Full Name'
                    {...formik.getFieldProps('name')}
                    className='w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors'
                  />
                  {formik.touched.name && formik.errors.name && (
                    <p className='text-sm mt-1 text-red-500'>
                      {formik.errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm mb-2 text-gray-600 font-semibold'>
                    Email Address *
                  </label>
                  <input
                    type='email'
                    name='email'
                    placeholder='Email Address'
                    {...formik.getFieldProps('email')}
                    className='w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors'
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className='text-sm mt-1 text-red-500'>
                      {formik.errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm mb-2 text-gray-600 font-semibold'>
                    Age *
                  </label>
                  <input
                    type='number'
                    name='age'
                    placeholder='Age'
                    {...formik.getFieldProps('age')}
                    className='w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors'
                  />
                  {formik.touched.age && formik.errors.age && (
                    <p className='text-sm mt-1 text-red-500'>
                      {formik.errors.age}
                    </p>
                  )}
                </div>
              </div>

              {/* Column 2 */}
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm mb-2 text-gray-600 font-semibold'>
                    Phone Number *
                  </label>
                  <input
                    type='text'
                    name='phone'
                    placeholder='Phone Number'
                    {...formik.getFieldProps('phone')}
                    className='w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors'
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <p className='text-sm mt-1 text-red-500'>
                      {formik.errors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm mb-2 text-gray-600 font-semibold'>
                    NID Number *
                  </label>
                  <input
                    type='text'
                    name='nid'
                    placeholder='NID Number'
                    {...formik.getFieldProps('nid')}
                    className='w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors'
                  />
                  {formik.touched.nid && formik.errors.nid && (
                    <p className='text-sm mt-1 text-red-500'>
                      {formik.errors.nid}
                    </p>
                  )}
                </div>

                <div>
                  <label className='block text-sm mb-2 text-gray-600 font-semibold'>
                    Profile Image
                  </label>
                  <input
                    type='file'
                    name='image'
                    accept='image/*'
                    onChange={handleImageChange}
                    className='w-full border border-gray-300 p-3 rounded-lg bg-white text-gray-700 focus:outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                  />
                  {preview && (
                    <div className='mt-3'>
                      <img
                        src={preview}
                        alt='Preview'
                        className='w-20 h-20 object-cover rounded-lg border border-gray-200'
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Service Information Section */}
          <div className='mb-6'>
            <h3 className='text-lg font-semibold text-slate-800 mb-6 pb-2 border-b border-green-100'>
              Service Information
            </h3>

            {/* Service Type - Full Width */}
            <div className='mb-6'>
              <label className='block text-sm mb-3 text-gray-600 font-semibold'>
                Service Type *
              </label>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                {['Cleaning', 'Plumbing', 'Electrician', 'Cooking'].map(
                  (type) => (
                    <label
                      key={type}
                      className='flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer bg-white'>
                      <input
                        type='checkbox'
                        value={type}
                        checked={formik.values.serviceType.includes(type)}
                        onChange={() => handleServiceTypeChange(type)}
                        className='w-4 h-4 text-blue-600 focus:ring-blue-500'
                      />
                      <span className='text-sm font-medium text-gray-700'>
                        {type}
                      </span>
                    </label>
                  )
                )}
              </div>
              {formik.touched.serviceType && formik.errors.serviceType && (
                <p className='text-sm mt-2 text-red-500'>
                  {formik.errors.serviceType}
                </p>
              )}
            </div>

            {/* Other Service Fields - 3 Columns */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div>
                <label className='block text-sm mb-2 text-gray-600 font-semibold'>
                  Expertise Level (1-10) *
                </label>
                <input
                  type='number'
                  name='expertise'
                  placeholder='Enter 1-10'
                  min='1'
                  max='10'
                  {...formik.getFieldProps('expertise')}
                  className='w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors'
                />
                {formik.touched.expertise && formik.errors.expertise && (
                  <p className='text-sm mt-1 text-red-500'>
                    {formik.errors.expertise}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm mb-2 text-gray-600 font-semibold'>
                  Preferred Shift *
                </label>
                <select
                  name='shift'
                  {...formik.getFieldProps('shift')}
                  className='w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors bg-white'>
                  <option value=''>Select Shift</option>
                  <option value='Day'>Day Shift</option>
                  <option value='Night'>Night Shift</option>
                  <option value='Flexible'>Flexible</option>
                </select>
                {formik.touched.shift && formik.errors.shift && (
                  <p className='text-sm mt-1 text-red-500'>
                    {formik.errors.shift}
                  </p>
                )}
              </div>

              <div>
                <label className='block text-sm mb-2 text-gray-600 font-semibold'>
                  Self Rating (1-5) *
                </label>
                <input
                  type='number'
                  name='rating'
                  placeholder='Enter 1-5'
                  min='1'
                  max='5'
                  {...formik.getFieldProps('rating')}
                  className='w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors'
                />
                {formik.touched.rating && formik.errors.rating && (
                  <p className='text-sm mt-1 text-red-500'>
                    {formik.errors.rating}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className='flex justify-center pt-6 border-t border-gray-100'>
            <button
              type='submit'
              className='px-8 py-3 rounded-lg text-white font-semibold transition-all duration-200 hover:shadow-lg cursor-pointer bg-blue-600 hover:bg-blue-700 min-w-48'>
              Register Worker
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default AddWorker;