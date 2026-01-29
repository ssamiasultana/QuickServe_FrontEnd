import { UserCircle } from 'lucide-react';
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

  // Normalize customer data
  const customers = Array.isArray(data) ? data : data?.data || [];

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Customers</h1>
        <p className='text-gray-600'>Manage all registered customers</p>
      </div>
      {customers.length === 0 ? (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center'>
          <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <UserCircle className='w-10 h-10 text-gray-400' />
          </div>
          <h3 className='text-xl font-semibold text-gray-900 mb-2'>No Customers Found</h3>
          <p className='text-gray-600'>There are no customers in the system yet</p>
        </div>
      ) : (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
          <CustomerTable customerData={customers} />
        </div>
      )}
    </div>
  );
};

export default CustomerList;
