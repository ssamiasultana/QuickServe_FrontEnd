import colors from '../../ui/color';
import Table from '../../ui/table';

const CustomerTable = ({ customerData }) => {
  const CustomerColumn = [
    { header: 'Id', accessor: 'id' },
    {
      header: 'Customer',
      accessor: (item) => (
        <div className='flex items-center gap-3'>
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className='w-9 h-9 rounded-full object-cover'
              style={{ border: `1px solid ${colors.neutral[200]}` }}
            />
          ) : (
            <div
              className='w-9 h-9 rounded-full flex items-center justify-center'
              style={{
                backgroundColor: colors.accent[500],
                border: `1px solid ${colors.neutral[200]}`,
              }}>
              <span
                className='font-medium text-sm'
                style={{ color: colors.white }}>
                {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
              </span>
            </div>
          )}
          <div>
            <div
              className='font-medium text-sm'
              style={{ color: colors.neutral[900] }}>
              {item.name}
            </div>
            <div
              className='text-xs mt-0.5'
              style={{ color: colors.neutral[500] }}>
              {item.email}
            </div>
          </div>
        </div>
      ),
    },

    { header: 'Phone', accessor: 'phone' },
  ];

  return (
    <div className='space-y-5'>
      <Table
        title='Workers List'
        data={customerData}
        columns={CustomerColumn}
      />
    </div>
  );
};

export default CustomerTable;
