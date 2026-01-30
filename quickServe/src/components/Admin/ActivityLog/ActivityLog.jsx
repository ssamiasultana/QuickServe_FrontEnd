import { Activity, Calendar, Filter, Search, User } from 'lucide-react';
import { useState } from 'react';
import Card from '../../ui/Card';

const ActivityLog = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - Replace with actual API call when backend is ready
  const activities = [
    {
      id: 1,
      user: 'Admin',
      action: 'Created',
      entity: 'Worker',
      entityName: 'John Doe',
      timestamp: new Date().toISOString(),
      details: 'Created a new worker profile',
    },
    {
      id: 2,
      user: 'Admin',
      action: 'Updated',
      entity: 'Service',
      entityName: 'Plumbing',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      details: 'Updated service category',
    },
    {
      id: 3,
      user: 'Moderator',
      action: 'Verified',
      entity: 'Worker',
      entityName: 'Jane Smith',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      details: 'Verified worker NID',
    },
  ];

  const filteredActivities = activities.filter((activity) => {
    const matchesFilter = filter === 'all' || activity.action.toLowerCase() === filter.toLowerCase();
    const matchesSearch =
      searchTerm === '' ||
      activity.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.entityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getActionColor = (action) => {
    const colors = {
      created: 'bg-green-100 text-green-700',
      updated: 'bg-blue-100 text-blue-700',
      deleted: 'bg-red-100 text-red-700',
      verified: 'bg-purple-100 text-purple-700',
      cancelled: 'bg-yellow-100 text-yellow-700',
    };
    return colors[action.toLowerCase()] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const stats = {
    total: activities.length,
    created: activities.filter((a) => a.action === 'Created').length,
    updated: activities.filter((a) => a.action === 'Updated').length,
    deleted: activities.filter((a) => a.action === 'Deleted').length,
  };

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Activity Log</h1>
        <p className='text-gray-600'>View all platform activities and changes</p>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6'>
        <Card
          title='Total Activities'
          value={stats.total}
          icon={Activity}
          iconColor='text-blue-600'
          iconBgColor='bg-blue-100'
        />
        <Card
          title='Created'
          value={stats.created}
          icon={Activity}
          iconColor='text-green-600'
          iconBgColor='bg-green-100'
        />
        <Card
          title='Updated'
          value={stats.updated}
          icon={Activity}
          iconColor='text-blue-600'
          iconBgColor='bg-blue-100'
        />
        <Card
          title='Deleted'
          value={stats.deleted}
          icon={Activity}
          iconColor='text-red-600'
          iconBgColor='bg-red-100'
        />
      </div>

      {/* Filters and Search */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6'>
        <div className='flex flex-col sm:flex-row gap-4'>
          {/* Search */}
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
            <input
              type='text'
              placeholder='Search activities...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>

          {/* Filter */}
          <div className='flex items-center gap-2'>
            <Filter className='w-5 h-5 text-gray-600' />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'>
              <option value='all'>All Actions</option>
              <option value='created'>Created</option>
              <option value='updated'>Updated</option>
              <option value='deleted'>Deleted</option>
              <option value='verified'>Verified</option>
              <option value='cancelled'>Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity List */}
      {filteredActivities.length === 0 ? (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center'>
          <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <Activity className='w-10 h-10 text-gray-400' />
          </div>
          <h3 className='text-xl font-semibold text-gray-900 mb-2'>No Activities Found</h3>
          <p className='text-gray-600'>
            {searchTerm || filter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'No activities recorded yet'}
          </p>
        </div>
      ) : (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
          <div className='divide-y divide-gray-200'>
            {filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className='p-6 hover:bg-gray-50 transition-colors'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-start gap-4 flex-1'>
                    <div className='w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0'>
                      <User className='w-5 h-5 text-blue-600' />
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-3 mb-2'>
                        <span className='font-semibold text-gray-900'>{activity.user}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(
                            activity.action
                          )}`}>
                          {activity.action}
                        </span>
                        <span className='text-gray-600'>
                          {activity.entity}: <strong>{activity.entityName}</strong>
                        </span>
                      </div>
                      <p className='text-sm text-gray-600 mb-2'>{activity.details}</p>
                      <div className='flex items-center gap-2 text-xs text-gray-500'>
                        <Calendar className='w-4 h-4' />
                        <span>{formatDate(activity.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note for future backend integration */}
      <div className='mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4'>
        <p className='text-sm text-blue-800'>
          <strong>Note:</strong> This is a frontend-only implementation. Connect to your backend API
          to display real-time activity logs. The component is ready to integrate with an activity log
          endpoint when available.
        </p>
      </div>
    </div>
  );
};

export default ActivityLog;
