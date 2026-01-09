import React from 'react';

const SectionHeader = ({
  icon: Icon,
  title,
  iconBgColor = 'bg-purple-100',
  iconColor = 'text-purple-600',
}) => {
  return (
    <div className='flex items-center gap-3 mb-4'>
      <div
        className={`w-10 h-10 ${iconBgColor} rounded-lg flex items-center justify-center`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <h2 className='text-xl font-semibold text-gray-900'>{title}</h2>
    </div>
  );
};

export default SectionHeader;
