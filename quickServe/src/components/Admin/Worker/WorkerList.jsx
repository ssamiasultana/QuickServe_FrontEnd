import { useState } from 'react';
import { usePaginatedWorkers } from '../../../hooks/useWorker';
import WorkerTable from './WorkerTable';

const WorkerList = () => {
  const ITEMS_PER_PAGE_OPTIONS = [10, 20];
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const {
    data: paginatedWorkers,
    isLoading,
    error,
  } = usePaginatedWorkers(currentPage, itemsPerPage);
  console.log('paginated data', paginatedWorkers);

  const totalItems = paginatedWorkers?.total || 0;
  const totalPages =
    paginatedWorkers?.totalPages || Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newPageSize) => {
    setItemsPerPage(newPageSize);
    setCurrentPage(1);
  };

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Workers Management</h1>
        <p className='text-gray-600'>Manage all registered workers</p>
      </div>

      {isLoading && (
        <div className='flex justify-center items-center py-12'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
          <span className='ml-3 text-gray-600'>Loading workers...</span>
        </div>
      )}

      {error && (
        <div className='text-center py-12 text-red-500'>
          Error loading workers: {error.message}
        </div>
      )}

      {!isLoading && !error && (
        <WorkerTable
          paginatedWorkers={paginatedWorkers}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          totalPages={totalPages}
          itemsPerPageOptions={ITEMS_PER_PAGE_OPTIONS}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
};

export default WorkerList;
