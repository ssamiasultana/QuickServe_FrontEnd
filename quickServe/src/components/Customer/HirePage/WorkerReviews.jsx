import { Star, MessageSquare, Calendar } from 'lucide-react';
import { useGetWorkerReviews } from '../../../hooks/useReview';
import SectionHeader from './SectionHeader';

const WorkerReviews = ({ workerId }) => {
  const {
    data: reviewsData,
    isLoading,
    isError,
  } = useGetWorkerReviews(workerId);

  const reviews = reviewsData?.reviews || [];
  const averageRating = reviewsData?.average_rating || 0;
  const totalReviews = reviewsData?.total_reviews || 0;

  if (isLoading) {
    return (
      <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
        <SectionHeader
          icon={MessageSquare}
          title='Customer Reviews'
          iconBgColor='bg-blue-100'
          iconColor='text-blue-600'
        />
        <div className='flex justify-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
        <SectionHeader
          icon={MessageSquare}
          title='Customer Reviews'
          iconBgColor='bg-blue-100'
          iconColor='text-blue-600'
        />
        <p className='text-sm text-gray-500 text-center py-4'>
          Failed to load reviews
        </p>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
      <SectionHeader
        icon={MessageSquare}
        title='Customer Reviews'
        iconBgColor='bg-blue-100'
        iconColor='text-blue-600'
      />

      {/* Summary */}
      <div className='mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-1'>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  className={
                    star <= Math.round(averageRating)
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }
                />
              ))}
            </div>
            <div>
              <p className='text-lg font-semibold text-gray-900'>
                {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
              </p>
              <p className='text-sm text-gray-600'>
                Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className='text-center py-8'>
          <MessageSquare className='w-12 h-12 text-gray-300 mx-auto mb-3' />
          <p className='text-gray-500 font-medium'>No reviews yet</p>
          <p className='text-sm text-gray-400 mt-1'>
            Be the first to review this worker after your service
          </p>
        </div>
      ) : (
        <div className='space-y-4'>
          {reviews.map((review) => (
            <div
              key={review.id}
              className='p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors'>
              <div className='flex items-start justify-between mb-2'>
                <div className='flex items-center gap-2'>
                  <div className='flex items-center gap-1'>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={
                          star <= review.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }
                      />
                    ))}
                  </div>
                  <span className='text-sm font-medium text-gray-700'>
                    {review.rating}/5
                  </span>
                </div>
                {review.created_at && (
                  <div className='flex items-center gap-1 text-xs text-gray-500'>
                    <Calendar className='w-3 h-3' />
                    <span>
                      {new Date(review.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                )}
              </div>

              {review.review && (
                <p className='text-sm text-gray-700 mt-2 leading-relaxed'>
                  {review.review}
                </p>
              )}

              {review.customer && (
                <p className='text-xs text-gray-500 mt-2'>
                  — {review.customer.name || 'Anonymous Customer'}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkerReviews;
