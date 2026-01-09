import { Calendar } from 'lucide-react';
import React from 'react';
import SectionHeader from './SectionHeader';

const ScheduleSection = ({
  selectedDate,
  selectedTime,
  timeSlots,
  workerShift,
  onDateChange,
  onTimeChange,
}) => {
  return (
    <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
      <SectionHeader
        icon={Calendar}
        title='Schedule Your Time'
        iconBgColor='bg-purple-100'
        iconColor='text-purple-600'
      />
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Select Date
          </label>
          <input
            type='date'
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
          />
        </div>
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Select Time Slot
            <span className='ml-2 text-xs text-gray-500'>
              (
              {workerShift === 'night'
                ? 'Night'
                : workerShift === 'flexible'
                ? 'Flexible'
                : 'Day'}{' '}
              shift available)
            </span>
          </label>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
            {timeSlots.length > 0 ? (
              timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => onTimeChange(time)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    selectedTime === time
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                  }`}>
                  {time}
                </button>
              ))
            ) : (
              <p className='text-sm text-gray-500 col-span-full'>
                No time slots available for {workerShift} shift
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleSection;
