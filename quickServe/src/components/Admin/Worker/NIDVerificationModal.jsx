import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { verifyWorkerNID } from '../../../utils/workerAction';
import Modal from '../../ui/Modal';

const NIDVerificationModal = ({ isOpen, onClose, worker }) => {
  const [verified, setVerified] = useState(worker?.nid_verified ?? false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  if (!worker) return null;

  const handleVerify = async (shouldVerify) => {
    setIsSubmitting(true);
    try {
      const result = await verifyWorkerNID(worker.id, shouldVerify, notes);

      if (result.success) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ['workers', 'paginated'] });
        queryClient.invalidateQueries({ queryKey: ['worker', worker.id] });
        setVerified(shouldVerify);
        onClose();
      } else {
        toast.error(result.message || 'Failed to verify NID');
      }
    } catch (error) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='NID Verification'
      icon={worker.nid_verified ? CheckCircle : AlertCircle}
      iconBgColor={worker.nid_verified ? 'bg-green-100' : 'bg-yellow-100'}
      iconColor={worker.nid_verified ? 'text-green-600' : 'text-yellow-600'}
      size='2xl'>
      <div className='space-y-4 max-h-[70vh] overflow-y-auto'>
        {/* Worker Info */}
        <div className='bg-gray-50 p-4 rounded-lg'>
          <h3 className='font-semibold text-gray-900 mb-3'>
            Worker Information
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-sm'>
            <div>
              <span className='text-gray-600'>Name:</span>
              <span className='ml-2 font-medium text-gray-900'>
                {worker.name}
              </span>
            </div>
            <div>
              <span className='text-gray-600'>Age:</span>
              <span className='ml-2 font-medium text-gray-900'>
                {worker.age || 'N/A'}
              </span>
            </div>
            <div>
              <span className='text-gray-600'>Email:</span>
              <span className='ml-2 font-medium text-gray-900 break-all'>
                {worker.email}
              </span>
            </div>
            <div>
              <span className='text-gray-600'>Phone:</span>
              <span className='ml-2 font-medium text-gray-900'>
                {worker.phone || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* NID Number and Verification Status */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {/* NID Number */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              NID Number
            </label>
            <div className='p-3 bg-gray-50 rounded-lg border border-gray-200'>
              <p className='text-lg font-mono font-semibold text-gray-900'>
                {worker.nid || 'Not provided'}
              </p>
            </div>
          </div>

          {/* Verification Status */}
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              Current Status
            </label>
            <div
              className={`p-3 rounded-lg ${
                worker.nid_verified
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-yellow-50 border border-yellow-200'
              }`}>
              <div className='flex items-center gap-2'>
                {worker.nid_verified ? (
                  <>
                    <CheckCircle className='w-5 h-5 text-green-600' />
                    <span className='font-medium text-green-800'>
                      Verified
                      {worker.nid_verified_at && (
                        <span className='ml-2 text-sm text-green-600'>
                          on{' '}
                          {new Date(
                            worker.nid_verified_at
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className='w-5 h-5 text-yellow-600' />
                    <span className='font-medium text-yellow-800'>
                      Pending Verification
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* NID Images */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              NID Front Image
            </label>
            {worker.nid_front_image ? (
              <div className='border border-gray-200 rounded-lg overflow-hidden bg-gray-50'>
                <img
                  src={worker.nid_front_image}
                  alt='NID Front'
                  className='w-full h-40 object-contain'
                />
              </div>
            ) : (
              <div className='border border-gray-200 rounded-lg h-40 flex items-center justify-center bg-gray-50'>
                <p className='text-sm text-gray-500'>No image provided</p>
              </div>
            )}
          </div>

          <div>
            <label className='block text-sm font-semibold text-gray-700 mb-2'>
              NID Back Image
            </label>
            {worker.nid_back_image ? (
              <div className='border border-gray-200 rounded-lg overflow-hidden bg-gray-50'>
                <img
                  src={worker.nid_back_image}
                  alt='NID Back'
                  className='w-full h-40 object-contain'
                />
              </div>
            ) : (
              <div className='border border-gray-200 rounded-lg h-40 flex items-center justify-center bg-gray-50'>
                <p className='text-sm text-gray-500'>No image provided</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className='block text-sm font-semibold text-gray-700 mb-2'>
            Verification Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder='Add any notes about the verification process...'
            className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none'
            rows={2}
          />
        </div>

        {/* Action Buttons */}
        <div className='flex gap-3 pt-4 border-t border-gray-200'>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className='flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50'>
            Cancel
          </button>
          {worker.nid_verified ? (
            <button
              onClick={() => handleVerify(false)}
              disabled={isSubmitting}
              className='flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2'>
              <XCircle className='w-4 h-4' />
              Revoke Verification
            </button>
          ) : (
            <>
              <button
                onClick={() => handleVerify(false)}
                disabled={isSubmitting}
                className='flex-1 px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2'>
                <XCircle className='w-4 h-4' />
                Reject
              </button>
              <button
                onClick={() => handleVerify(true)}
                disabled={isSubmitting}
                className='flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2'>
                <CheckCircle className='w-4 h-4' />
                {isSubmitting ? 'Verifying...' : 'Verify NID'}
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default NIDVerificationModal;
