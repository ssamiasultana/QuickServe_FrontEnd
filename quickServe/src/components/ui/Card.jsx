

const Card = ({
  title,  
  children,
  className = '',
  bgColor = 'bg-white',
  borderColor = 'border-neutral-200',
 
}) => {
 

  
  return (
    <div
      className={`${bgColor} rounded-xl p-4 shadow-xs border ${borderColor} hover:shadow-sm transition-all duration-200 group ${className}`}>
      <div className='flex items-center justify-between mb-3'>
        <h3 className='text-sm font-medium text-neutral-600 uppercase tracking-wide'>
          {title}
        </h3>
       </div>
      
      {children}
    </div>
  );
};

export default Card;
