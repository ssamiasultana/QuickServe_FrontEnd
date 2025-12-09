import { useGetAllCustomers } from '../../../hooks/useCustomer';
import CustomerTable from './CustomerTable';

const CustomerList = () => {
  const { data, isLoading, isError, error } = useGetAllCustomers();

  if (isLoading) {
    return (
      <div className='p-6'>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold text-gray-900'>Customers</h1>
        </div>
        <div className='flex justify-center items-center py-12'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
          <span className='ml-3 text-gray-600'>Loading Customers...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='p-6'>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold text-gray-900'>Customers</h1>
        </div>
        <div className='flex flex-col items-center justify-center py-12 text-red-600'>
          <p className='font-semibold'>Failed to load customers.</p>
          <p className='text-sm text-red-500'>
            {error?.message || 'Something went wrong. Please try again.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Customers</h1>
      </div>
      <CustomerTable customerData={data} />
    </div>
  );
};

export default CustomerList;
