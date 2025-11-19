import {useEffect, useState } from 'react';
import WorkerService from '../../services/workerService';
import WorkerTable from './workertable.jsx';

const WorkerList = () => {
 const [workers, setWorkers] = useState([]);
   const [loading, setLoading] = useState(true);
   
 
   useEffect(() => {
  
     const fetchWorkers = async () => {
       try {
         setLoading(true);
         const data = await WorkerService.getAllWorkers();
         
         setWorkers(data);
       } catch (err) {
         setError(err.message);
       } finally {
         setLoading(false);
       }
     };
 
     fetchWorkers();
   }, []);
 
 if (loading) {
     return (
       <div className='p-6'>
         <div className='flex justify-center items-center py-12'>
           <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
           <span className='ml-3 text-gray-600'>Loading workers...</span>
         </div>
       </div>
     );
   }

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Workers Management</h1>
        <p className='text-gray-600'>Manage all registered workers</p>
      </div>
      
        <WorkerTable workers={workers} />
   
    </div>
  );
};

export default WorkerList;
