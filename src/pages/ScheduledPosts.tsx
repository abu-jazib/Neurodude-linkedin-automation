import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, PlusCircle, Trash2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { linkedinAPI } from '../utils/api';

interface ScheduledPostsProps {
  user: any;
}

interface Post {
  id: string;
  text: string;
  imageUrl?: string;
  scheduleTime: string;
}

const ScheduledPosts: React.FC<ScheduledPostsProps> = ({ user }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchScheduledPosts();
  }, [user.id]);

  const fetchScheduledPosts = async () => {
    try {
      setLoading(true);
      const data = await linkedinAPI.getScheduledPosts(user.id);
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Failed to fetch scheduled posts:', error);
      toast.error('Failed to load scheduled posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPost = async (postId: string) => {
    try {
      setDeleting(postId);
      await linkedinAPI.cancelScheduledPost(postId, user.id);
      setPosts(posts.filter(post => post.id !== postId));
      toast.success('Post canceled successfully');
    } catch (error) {
      console.error('Failed to cancel post:', error);
      toast.error('Failed to cancel scheduled post');
    } finally {
      setDeleting(null);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Scheduled Posts</h1>
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
      ) : posts.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-10">
          <div className="text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No scheduled posts</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new post.</p>
            <div className="mt-6">
              <Link
                to="/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#0A66C2] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusCircle className="-ml-1 mr-2 h-5 w-5" />
                Create New Post
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {posts.map((post) => (
              <li key={post.id} className="p-4 sm:p-6">
                <div className="flex items-center justify-between flex-wrap sm:flex-nowrap">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {post.text.substring(0, 140)}...
                    </p>
                    <p className="mt-1 flex items-center text-sm text-gray-500">
                      <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      Scheduled for {formatDate(post.scheduleTime)}
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0 flex-shrink-0 flex items-center">
                    <button
                      onClick={() => handleCancelPost(post.id)}
                      disabled={deleting === post.id}
                      className="ml-3 inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      {deleting === post.id ? (
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-1 text-red-500" />
                      )}
                      Cancel
                    </button>
                  </div>
                </div>
                {post.imageUrl && (
                  <div className="mt-4">
                    <img 
                      src={post.imageUrl} 
                      alt="Post" 
                      className="h-48 w-full object-cover sm:object-contain rounded-md"
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ScheduledPosts;