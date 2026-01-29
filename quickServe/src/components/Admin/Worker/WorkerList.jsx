import { useState } from 'react';
import { usePaginatedWorkers } from '../../../hooks/useWorker';
import WorkerTable from './WorkerTable';

const WorkerList = () => {
  const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50];
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const {
    data: response,
    isLoading,
    error,
    isFetching,
  } = usePaginatedWorkers(currentPage, itemsPerPage);

  // Extract data and pagination from response
  const workers = response?.data || [];
  const pagination = response?.pagination || {};

  const totalItems = pagination.total || 0;
  const totalPages = pagination.last_page || 1;

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setItemsPerPage(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Workers Management</h1>
        <p className='text-gray-600'>Manage all registered workers</p>
      </div>

      {isLoading && (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-12'>
          <div className='flex justify-center items-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
            <span className='ml-3 text-gray-600'>Loading workers...</span>
          </div>
        </div>
      )}

      {error && (
        <div className='bg-white rounded-lg shadow-sm border border-red-200 p-12'>
          <div className='text-center text-red-600'>
            <p className='font-semibold mb-2'>Error loading workers</p>
            <p className='text-sm text-red-500'>{error.message || 'Something went wrong. Please try again.'}</p>
          </div>
        </div>
      )}

      {!isLoading && !error && (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
          <WorkerTable
            paginatedWorkers={workers}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            totalPages={totalPages}
            itemsPerPageOptions={ITEMS_PER_PAGE_OPTIONS}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}
    </div>
  );
};

export default WorkerList;
