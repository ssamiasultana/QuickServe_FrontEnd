import { useCheckWorkerProfile } from '../../hooks/useWorker';

export default function WorkerPortal() {
  const { data, isLoading, isError } = useCheckWorkerProfile();

  if (isLoading) {
    return (
      <div className='flex justify-center items-center py-12'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        <span className='ml-3 text-gray-600'>Checking profile...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='text-center py-12'>
        <p className='text-red-600'>Failed to load profile information</p>
      </div>
    );
  }

  return (
    <div>{!data?.isComplete ? <h1>{data?.message}</h1> : <h2>Jobs</h2>}</div>
  );
}
