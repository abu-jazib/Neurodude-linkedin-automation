import React, { useState } from 'react';
import { BarChart2, ThumbsUp, MessageSquare, Repeat, Eye, RefreshCw } from 'lucide-react';

interface PostHistoryProps {
  user: any;
}

interface PostStats {
  likes: number;
  comments: number;
  shares: number;
  views: number;
}

interface Post {
  id: string;
  text: string;
  imageUrl?: string;
  postedAt: string;
  stats: PostStats;
}

const PostHistory: React.FC<PostHistoryProps> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  
  // Mock data for demo purposes
  const [posts] = useState<Post[]>([
    {
      id: 'post_1',
      text: 'Excited to share my thoughts on the latest AI developments in content creation! The potential for businesses to scale their content marketing efforts while maintaining quality is unprecedented. What are your thoughts on AI-generated content?',
      postedAt: '2025-04-10T10:30:00Z',
      stats: {
        likes: 45,
        comments: 12,
        shares: 8,
        views: 1250
      }
    },
    {
      id: 'post_2',
      text: 'Here are 5 tips to optimize your LinkedIn profile for better engagement and networking opportunities:\n\n1. Use a professional photo\n2. Write a compelling headline\n3. Craft a story-driven summary\n4. Showcase your achievements with metrics\n5. Request recommendations from colleagues\n\nWhich of these do you need to work on?',
      imageUrl: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=800',
      postedAt: '2025-04-05T14:15:00Z',
      stats: {
        likes: 87,
        comments: 23,
        shares: 15,
        views: 2430
      }
    }
  ]);

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
  
  // Calculate time since post
  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) {
      return Math.floor(interval) + ' years ago';
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + ' months ago';
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + ' days ago';
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + ' hours ago';
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + ' minutes ago';
    }
    return Math.floor(seconds) + ' seconds ago';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Post History</h1>
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <RefreshCw className="h-8 w-8 text-[#0A66C2] animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg p-10">
          <div className="text-center">
            <BarChart2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No posts yet</h3>
            <p className="mt-1 text-sm text-gray-500">Your published posts will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    className="h-10 w-10 rounded-full mr-2"
                    src={user.picture || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'}
                    alt={user.name}
                  />
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      {getTimeSince(post.postedAt)}
                      <span className="mx-1">•</span>
                      {formatDate(post.postedAt)}
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-800 whitespace-pre-line mb-4">{post.text}</p>
                
                {post.imageUrl && (
                  <div className="mt-2 mb-4">
                    <img
                      src={post.imageUrl}
                      alt="Post"
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Performance</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <ThumbsUp className="h-5 w-5 text-[#0A66C2] mr-2" />
                        <span className="text-sm font-medium">{post.stats.likes} Likes</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <MessageSquare className="h-5 w-5 text-[#0A66C2] mr-2" />
                        <span className="text-sm font-medium">{post.stats.comments} Comments</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <Repeat className="h-5 w-5 text-[#0A66C2] mr-2" />
                        <span className="text-sm font-medium">{post.stats.shares} Shares</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center">
                        <Eye className="h-5 w-5 text-[#0A66C2] mr-2" />
                        <span className="text-sm font-medium">{post.stats.views} Views</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostHistory;