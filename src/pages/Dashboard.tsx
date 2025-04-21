import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Calendar, BarChart, RefreshCw } from 'lucide-react';
import { linkedinAPI } from '../utils/api'; // Adjust the import path as necessary

interface DashboardProps {
  user: any;
}

interface Post {
  id: string;
  status: string;
  text: string;
  imageUrl?: string;
  scheduleTime?: string;
  postedAt?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [scheduledPosts, setScheduledPosts] = useState<Post[]>([]);
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const scheduledData = await linkedinAPI.getScheduledPosts(user.id);
        setScheduledPosts(scheduledData.posts || []);
        
        // For demo, we'll simulate recent posts
        setRecentPosts([
          {
            id: 'post_1',
            status: 'posted',
            text: 'Excited to share my thoughts on the latest AI developments in content creation!',
            postedAt: '2025-04-10T10:30:00Z'
          },
          {
            id: 'post_2',
            status: 'posted',
            text: 'Here are 5 tips to optimize your LinkedIn profile for better engagement and networking opportunities.',
            imageUrl: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=800',
            postedAt: '2025-04-05T14:15:00Z'
          }
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [user.id]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#0A66C2] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New Post
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <RefreshCw className="h-8 w-8 text-[#0A66C2] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Scheduled Posts</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">{scheduledPosts.length} posts scheduled</p>
              </div>
              <Link to="/scheduled" className="text-sm text-[#0A66C2] hover:text-blue-700">
                View all
              </Link>
            </div>
            <div className="border-t border-gray-200">
              {scheduledPosts.length === 0 ? (
                <div className="p-6 flex flex-col items-center justify-center text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-gray-500">No scheduled posts</p>
                  <Link
                    to="/create"
                    className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-[#0A66C2] bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create your first post
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {scheduledPosts.slice(0, 3).map((post) => (
                    <li key={post.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {post.text.substring(0, 80)}...
                        </p>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {formatDate(post.scheduleTime || '')}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>


          <div className="bg-white overflow-hidden shadow rounded-lg lg:col-span-2">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Engagement Analytics</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Performance of your recent posts</p>
            </div>
            <div className="border-t border-gray-200 p-6 flex flex-col items-center justify-center h-64 text-center">
              <BarChart className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-500">Analytics will appear here after you've published posts</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;