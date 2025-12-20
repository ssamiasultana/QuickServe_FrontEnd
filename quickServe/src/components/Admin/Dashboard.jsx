import {
  CalendarCheck,
  CircleCheck,
  Clock,
  Shield,
  UserCheck,
  Users,
} from 'lucide-react';
import { useWorkers } from '../../hooks/useWorker';
import Card from '../ui/Card';
function Dashboard() {
  const { data: workersData, isLoading } = useWorkers();
  const totalWorkers = Array.isArray(workersData)
    ? workersData.length
    : workersData?.data?.length || 0;
  return (
    <div className='p-4 md:p-6 bg-neutral-50 min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-6'>
          <h1 className='text-2xl md:text-3xl font-bold text-slate-900 mb-1'>
            Dashboard Overview
          </h1>
          <p className='text-neutral-600 text-sm'>
            Track your business metrics and performance
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 mb-6'>
          <Card
            title='Total Workers'
            value={totalWorkers}
            icon={Users}
            iconColor='text-blue-600'
            iconBgColor='bg-blue-50'
            bgColor='bg-gradient-to-br from-blue-25 to-white'
            borderColor='border-blue-100'
          />

          <Card
            title='Total Moderators'
            value='0'
            icon={Shield}
            iconColor='text-purple-600'
            iconBgColor='bg-purple-50'
            bgColor='bg-gradient-to-br from-purple-25 to-white'
            borderColor='border-purple-100'
          />

          <Card
            title='Total Customers'
            value='1,200'
            icon={UserCheck}
            iconColor='text-emerald-600'
            iconBgColor='bg-emerald-50'
            bgColor='bg-gradient-to-br from-emerald-25 to-white'
            borderColor='border-emerald-100'
          />

          <Card
            title='Complete Bookings'
            value='0'
            icon={CalendarCheck}
            iconColor='text-green-600'
            iconBgColor='bg-green-50'
            bgColor='bg-gradient-to-br from-green-25 to-white'
            borderColor='border-green-100'>
            <div className='flex items-center gap-2 mt-1'>
              <CircleCheck
                className='w-3 h-3 text-green-600'
                strokeWidth={2.5}
              />
              <span className='text-xs text-neutral-600 font-medium'>
                All verified
              </span>
            </div>
          </Card>

          <Card
            title='Pending Bookings'
            value='0'
            icon={Clock}
            iconColor='text-amber-600'
            iconBgColor='bg-amber-50'
            bgColor='bg-gradient-to-br from-amber-25 to-white'
            borderColor='border-amber-100'>
            <div className='flex items-center gap-2 mt-1'>
              <div className='flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-amber-500 rounded-full'
                  style={{ width: '0%' }}></div>
              </div>
              <span className='text-xs text-neutral-600 font-medium'>0%</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
