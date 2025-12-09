import { Briefcase, Star, User } from 'lucide-react';
import { calculateAverageRating, getShiftColor } from '../../utils/util';
import Card from '../ui/Card';
import colors from '../ui/color';

function SingleWorkerCard({ workerData }) {
  const parseServiceType = (serviceType) => {
    try {
      return JSON.parse(serviceType);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 bg-gray-50'>
      {workerData?.map((worker) => {
        const services = parseServiceType(worker.service_type);
        const averageRating = calculateAverageRating(
          worker.expertise_of_service
        );
        const shiftColors = getShiftColor(worker.shift);

        return (
          <Card key={worker.id} className='hover:shadow-md transition-shadow'>
            <div className='space-y-2.5'>
              {/* Header with name and rating */}
              <div className='flex items-start justify-between gap-2'>
                <div className='flex items-start gap-2 flex-1 min-w-0'>
                  <div className='w-9 h-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden bg-blue-100'>
                    {worker.image ? (
                      <img
                        src={worker.image}
                        alt={worker.name}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <User size={18} className='text-blue-600' />
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <h3 className='text-sm font-bold text-gray-900 truncate'>
                      {worker.name}
                    </h3>
                    <div
                      className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-xs font-medium mt-0.5'
                      style={{
                        backgroundColor: shiftColors.background,
                        color: shiftColors.text,
                      }}>
                      <Briefcase size={10} />
                      <span className='text-xs'>{worker.shift}</span>
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-0.5 text-green-500 shrink-0'>
                  <Star size={12} fill='currentColor' />
                  <span className='font-bold text-xs'>{averageRating}</span>
                </div>
              </div>

              {/* Services */}
              <div>
                <div className='flex flex-wrap gap-1'>
                  {services.length > 0 ? (
                    services.map((service, index) => (
                      <span
                        key={index}
                        className='px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700'>
                        {service}
                      </span>
                    ))
                  ) : (
                    <span className='text-xs text-gray-500'>
                      No services listed
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex gap-1 pt-0.5'>
                <button
                  className='flex-1 py-0.5 px-1.5 rounded text-xs font-medium transition-colors'
                  style={{
                    backgroundColor: colors.primary[100],
                    color: colors.primary[700],
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = colors.primary[800];
                    e.target.style.color = colors.primary[100];
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = colors.primary[100];
                    e.target.style.color = colors.primary[700];
                  }}>
                  Hire
                </button>
                <button
                  className='flex-1 py-0.5 px-1.5 rounded text-xs font-medium  transition-colors'
                  style={{
                    backgroundColor: colors.primary[100],
                    color: colors.primary[700],
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = colors.primary[800];
                    e.target.style.color = colors.primary[100];
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = colors.primary[100];
                    e.target.style.color = colors.primary[700];
                  }}>
                  Profile
                </button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default SingleWorkerCard;
