import SingleWorkerCard from './SingleWorkerCard';
function WorkersCard({ workerData, isSearching, searchTerm }) {
  const hasWorkers = Array.isArray(workerData) && workerData.length > 0;

  if (!hasWorkers) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-gray-600'>
        <p className='font-semibold'>
          {isSearching
            ? `No workers found for "${searchTerm}"`
            : 'No workers available at the moment.'}
        </p>
        <p className='text-sm text-gray-500 mt-2'>
          {isSearching
            ? 'Try different search terms or browse all workers'
            : 'Please check back later.'}
        </p>
      </div>
    );
  }

  return (
    <div>
      {isSearching && (
        <div className='mb-4 text-sm text-gray-600'>
          Found {workerData.length} worker(s) for "{searchTerm}"
        </div>
      )}
      <SingleWorkerCard workerData={workerData} />
    </div>
  );
}
export default WorkersCard;
