import React, { useState, useRef } from 'react';  
import { useNavigate } from 'react-router-dom';  
import { Sparkles, Image, Clock, Send, Loader2 } from 'lucide-react';  
import toast from 'react-hot-toast';  
import { openaiAPI, linkedinAPI } from '../utils/api';  
  
interface CreatePostProps {  
  user: any;  
}  
  
const CreatePost: React.FC<CreatePostProps> = ({ user }) => {  
  const navigate = useNavigate();  
  const [step, setStep] = useState<'generate' | 'preview' | 'schedule'>('generate');  
  const [generating, setGenerating] = useState(false);  
  const [posting, setPosting] = useState(false);  
  const [generatingImage, setGeneratingImage] = useState(false);  
  const [unsplashImages, setUnsplashImages] = useState<string[]>([]);  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);  
  const [isModalOpen, setIsModalOpen] = useState(false);  
  const [searchQuery, setSearchQuery] = useState('');  
  
  const [topic, setTopic] = useState('');  
  const [toneOfVoice, setToneOfVoice] = useState('professional');  
  const [contentType, setContentType] = useState('informative');  
  const [customPrompt, setCustomPrompt] = useState('');  
  
  const [generatedText, setGeneratedText] = useState('');  
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);  
  const [scheduleTime, setScheduleTime] = useState<string | null>(null);  
  
  const textAreaRef = useRef<HTMLTextAreaElement>(null);  
  
  const handleResizeTextArea = () => {  
    if (textAreaRef.current) {  
      textAreaRef.current.style.height = 'auto';  
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;  
    }  
  };  
  
  const fetchUnsplashImages = async (query: string) => {  
    if (!query) return;  
  
    try {  
      const response = await fetch(`https://api.unsplash.com/search/photos?query="${query}"&client_id=zM5n56VBHszJb8YLTIf-7DQeShCDF7ugaTmbwCFmrRo`);  
      const data = await response.json();  
      setUnsplashImages(data.results.map((image: any) => image.urls.regular));  
    } catch (error) {  
      console.error('Failed to fetch Unsplash images:', error);  
      toast.error('Failed to fetch images from Unsplash. Please try again.');  
    }  
  };  
  
  const handleGenerateContent = async () => {  
    if (!topic && !customPrompt) {  
      toast.error('Please provide a topic or custom prompt');  
      return;  
    }  
  
    try {  
      setGenerating(true);  
      const prompt = customPrompt || `Write an engaging LinkedIn post about ${topic}`;  
      const { text } = await openaiAPI.generateText({  
        prompt,  
        topic,  
        toneOfVoice,  
        contentType,  
      });  
  
      setGeneratedText(text.trim());  
      setStep('preview');  
    } catch (error) {  
      console.error('Failed to generate content:', error);  
      toast.error('Failed to generate content. Please try again.');  
    } finally {  
      setGenerating(false);  
    }  
  };  
  
  const handleGenerateImage = async () => {  
    try {  
      setGeneratingImage(true);  
      const prompt = `${generatedText}`;  
      const { images } = await openaiAPI.generateImage({  
        prompt,  
        n: 1,  
        size: '1024x1024',  
      });  
      if (images && images.length > 0) {  
        setGeneratedImage(images[0]);  
      }  
    } catch (error) {  
      console.error('Failed to generate image:', error);  
      toast.error('Failed to generate image. Please try again.');  
    } finally {  
      setGeneratingImage(false);  
    }  
  };  
  
  const handlePublishPost = async () => {  
    try {  
      setPosting(true);  
      const postData = {  
        userId: user.id,  
        text: generatedText,  
        imageUrl: selectedImage || generatedImage || undefined,  
        scheduleTime: scheduleTime || undefined,  
      };  
      const result = await linkedinAPI.postContent(postData);  
      console.log('LinkedIn API response:', result);  
      toast.success(scheduleTime ? 'Post scheduled successfully!' : 'Post published successfully!');  
      navigate('/create');  
    } catch (error) {  
      console.error('Failed to publish post:', error);  
      toast.error('Failed to publish post. Please try again.');  
    } finally {  
      setPosting(false);  
    }  
  };  
  
  const getTomorrowDate = () => {  
    const tomorrow = new Date();  
    tomorrow.setDate(tomorrow.getDate() + 1);  
    tomorrow.setHours(9, 0, 0, 0);  
    return tomorrow.toISOString().slice(0, 16);  
  };  
  
  const handleSearch = () => {  
    fetchUnsplashImages(searchQuery);   // Close modal after searching  
  };  
  
  return (  
    <div className="max-w-4xl mx-auto">  
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create LinkedIn Post</h1>  
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">  
        <div className="border-b border-gray-200">  
          <nav className="flex divide-x divide-gray-200">  
            <button  
              onClick={() => setStep('generate')}  
              className={`w-1/3 py-4 px-1 text-center text-sm font-medium ${  
                step === 'generate'  
                  ? 'text-[#0A66C2] border-b-2 border-[#0A66C2]'  
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'  
              }`}  
            >  
              <div className="flex items-center justify-center">  
                <Sparkles className="h-5 w-5 mr-2" />  
                <span>Generate Content</span>  
              </div>  
            </button>  
            <button  
              onClick={() => generatedText && setStep('preview')}  
              disabled={!generatedText}  
              className={`w-1/3 py-4 px-1 text-center text-sm font-medium ${  
                step === 'preview'  
                  ? 'text-[#0A66C2] border-b-2 border-[#0A66C2]'  
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 disabled:text-gray-300 disabled:hover:text-gray-300'  
              }`}  
            >  
              <div className="flex items-center justify-center">  
                <Image className="h-5 w-5 mr-2" />  
                <span>Preview & Edit</span>  
              </div>  
            </button>  
            <button  
              onClick={() => generatedText && setStep('schedule')}  
              disabled={!generatedText}  
              className={`w-1/3 py-4 px-1 text-center text-sm font-medium ${  
                step === 'schedule'  
                  ? 'text-[#0A66C2] border-b-2 border-[#0A66C2]'  
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 disabled:text-gray-300 disabled:hover:text-gray-300'  
              }`}  
            >  
              <div className="flex items-center justify-center">  
                <Clock className="h-5 w-5 mr-2" />  
                <span>Schedule & Post</span>  
              </div>  
            </button>  
          </nav>  
        </div>  
        <div className="p-6">  
          {step === 'generate' && (  
            <div className="space-y-6">  
              <div>  
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700">  
                  Topic  
                </label>  
                <input  
                  type="text"  
                  id="topic"  
                  value={topic}  
                  onChange={(e) => setTopic(e.target.value)}  
                  placeholder="e.g., AI in marketing, leadership strategies, industry trends"  
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"  
                />  
              </div>  
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">  
                <div>  
                  <label htmlFor="tone" className="block text-sm font-medium text-gray-700">  
                    Tone of Voice  
                  </label>  
                  <select  
                    id="tone"  
                    value={toneOfVoice}  
                    onChange={(e) => setToneOfVoice(e.target.value)}  
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"  
                  >  
                    <option value="professional">Professional</option>  
                    <option value="conversational">Conversational</option>  
                    <option value="enthusiastic">Enthusiastic</option>  
                    <option value="authoritative">Authoritative</option>  
                    <option value="inspirational">Inspirational</option>  
                  </select>  
                </div>  
                <div>  
                  <label htmlFor="contentType" className="block text-sm font-medium text-gray-700">  
                    Content Type  
                  </label>  
                  <select  
                    id="contentType"  
                    value={contentType}  
                    onChange={(e) => setContentType(e.target.value)}  
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"  
                  >  
                    <option value="informative">Informative</option>  
                    <option value="storytelling">Storytelling</option>  
                    <option value="opinion">Opinion</option>  
                    <option value="how-to">How-to Guide</option>  
                    <option value="industry-news">Industry News</option>  
                    <option value="career-tip">Career Tip</option>  
                  </select>  
                </div>  
              </div>  
              <div>  
                <label htmlFor="customPrompt" className="block text-sm font-medium text-gray-700">  
                  Custom Prompt (Optional)  
                </label>  
                <textarea  
                  id="customPrompt"  
                  value={customPrompt}  
                  onChange={(e) => setCustomPrompt(e.target.value)}  
                  rows={4}  
                  placeholder="Write a custom prompt to guide the AI content generation..."  
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"  
                />  
              </div>  
              <div className="pt-5">  
                <div className="flex justify-end">  
                  <button  
                    onClick={handleGenerateContent}  
                    disabled={generating || (!topic && !customPrompt)}  
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#0A66C2] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"  
                  >  
                    {generating ? (  
                      <>  
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />  
                        Generating...  
                      </>  
                    ) : (  
                      <>  
                        <Sparkles className="h-5 w-5 mr-2" />  
                        Generate Content  
                      </>  
                    )}  
                  </button>  
                </div>  
              </div>  
            </div>  
          )}  
          {step === 'preview' && (  
            <div className="space-y-6">  
              <div>  
                <label htmlFor="postContent" className="block text-sm font-medium text-gray-700">  
                  Post Content  
                </label>  
                <textarea  
                  ref={textAreaRef}  
                  id="postContent"  
                  value={generatedText}  
                  onChange={(e) => {  
                    setGeneratedText(e.target.value);  
                    handleResizeTextArea();  
                  }}  
                  rows={6}  
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"  
                />  
              </div>  
              <div>  
                <div className="flex justify-between items-center mb-2">  
                  <label className="block text-sm font-medium text-gray-700">Post Image</label>  
                  <button  
                    onClick={handleGenerateImage}  
                    disabled={generatingImage}  
                    className="inline-flex items-center text-sm text-[#0A66C2] hover:text-blue-700"  
                  >  
                    {generatingImage ? (  
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />  
                    ) : (  
                      <Sparkles className="h-4 w-4 mr-1" />  
                    )}  
                    {generatedImage ? 'Regenerate Image' : 'Generate Image'}  
                  </button>  
                </div>  
                {generatedImage ? (  
                  <div className="mt-1 relative rounded-lg border border-gray-300 overflow-hidden">  
                    <img  
                      src={generatedImage}  
                      alt="Generated for LinkedIn post"  
                      className="w-full h-auto max-h-80 object-cover"  
                    />  
                    <button  
                      onClick={() => setGeneratedImage(null)}  
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm text-gray-500 hover:text-gray-700 focus:outline-none"  
                    >  
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">  
                        <path  
                          fillRule="evenodd"  
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"  
                          clipRule="evenodd"  
                        />  
                      </svg>  
                    </button>  
                  </div>  
                ) : (  
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">  
                    <div className="space-y-1 text-center">  
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">  
                        <path  
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"  
                          strokeWidth="2"  
                          strokeLinecap="round"  
                          strokeLinejoin="round"  
                        />  
                      </svg>  
                      <p className="text-sm text-gray-500">No image generated yet</p>  
                    </div>  
                  </div>  
                )}  
              </div>  
  
              {/* Button to open Unsplash search modal */}  
              <button  
                onClick={() => setIsModalOpen(true)}  
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#0A66C2] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"  
              >  
                Search on Unsplash  
              </button>  
  
              {/* Unsplash Search Modal */}  
              {isModalOpen && (  
                <div className="">  
                  <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl mx-auto">  
                    <div className="flex justify-between items-center mb-4">  
                      <h2 className="text-lg font-bold">Search Unsplash Images</h2>  
                      <button  
                        onClick={() => setIsModalOpen(false)}  
                        className="text-3xl text-gray-500 hover:text-gray-700"  
                      >  
                        &times; {/* Cross icon */}  
                      </button>  
                    </div>  
                    {selectedImage && (  
                      <div className="mb-4 flex items-center">  
                        <img  
                          src={selectedImage}  
                          alt="Selected from Unsplash"  
                          className="w-24 h-24 rounded-md object-cover mr-2"  
                        />  
                        <button  
                          onClick={() => setSelectedImage(null)}  
                          className="text-2xl text-red-500 hover:text-red-700"  
                        >  
                          &times; {/* Cross icon for unselecting the image */}  
                        </button>  
                      </div>  
                    )}  
                    <input  
                      type="text"  
                      value={searchQuery}  
                      onChange={(e) => setSearchQuery(e.target.value)}  
                      placeholder="Type a topic..."  
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"  
                    />  
                    
                    <div className="flex justify-end mt-4">  
                      <button  
                        onClick={handleSearch}  
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#0A66C2] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"  
                      >  
                        Search  
                      </button>  
                      <button  
                        onClick={() => setIsModalOpen(false)}  
                        className="ml-2 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"  
                      >  
                        Cancel  
                      </button>  
                    </div>  
                    <div className="grid grid-cols-3 gap-4 mt-4">  
                      {unsplashImages.map((imageUrl) => (  
                        <div key={imageUrl} className="relative">  
                          <img  
                            src={imageUrl}  
                            alt="Unsplash"  
                            className={`w-full h-auto rounded-md cursor-pointer ${selectedImage === imageUrl ? 'border-2 border-blue-500' : ''}`}  
                            onClick={() => setSelectedImage(imageUrl)}  
                          />  
                          {selectedImage === imageUrl && (  
                            <button  
                              onClick={() => setSelectedImage(null)}  
                              className="absolute top-1 right-1 text-2xl text-red-500 hover:text-red-700"  
                            >  
                              &times; {/* Cross icon to unselect */}  
                            </button>  
                          )}  
                        </div>  
                      ))}  
                    </div>  
                  </div>  
                </div>  
              )}  
              <div className="pt-5 flex justify-between">  
                <button  
                  onClick={() => setStep('generate')}  
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"  
                >  
                  Back  
                </button>  
                <button  
                  onClick={() => setStep('schedule')}  
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#0A66C2] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"  
                >  
                  Next: Schedule  
                </button>  
              </div>  
            </div>  
          )}  
          {step === 'schedule' && (  
            <div className="space-y-6">  
              <div className="bg-gray-50 p-4 rounded-lg">  
                <h3 className="text-lg font-medium text-gray-900 mb-2">Post Preview</h3>  
                <div className="bg-white rounded-lg shadow p-4 border border-gray-200">  
                  <div className="flex items-center mb-4">  
                    <img  
                      className="h-10 w-10 rounded-full mr-2"  
                      src={user.picture || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100'}  
                      alt={user.name}  
                    />  
                    <div>  
                      <div className="font-medium text-gray-900">{user.name}</div>  
                      <div className="text-sm text-gray-500">Just now</div>  
                    </div>  
                  </div>  
                  <p className="text-gray-800 whitespace-pre-line">{generatedText}</p>  
                  {generatedImage && (  
                    <div className="mt-3">  
                      <img  
                        src={generatedImage}  
                        alt="Post"  
                        className="w-full h-auto rounded-lg"  
                      />  
                    </div>  
                  )}  
                  {selectedImage && (  
                    <div className="mt-3">  
                      <img  
                        src={selectedImage}  
                        alt="Selected from Unsplash"  
                        className="w-full h-auto rounded-lg"  
                      />  
                    </div>  
                  )}  
                </div>  
              </div>  
              <div>  
                <div className="flex items-center mb-2">  
                  <input  
                    id="schedulePost"  
                    name="schedulePost"  
                    type="checkbox"  
                    checked={!!scheduleTime}  
                    onChange={(e) => {  
                      setScheduleTime(e.target.checked ? getTomorrowDate() : null);  
                    }}  
                    className="h-4 w-4 text-[#0A66C2] focus:ring-blue-500 border-gray-300 rounded"  
                  />  
                  <label htmlFor="schedulePost" className="ml-2 block text-sm text-gray-700">  
                    Schedule for later  
                  </label>  
                </div>  
                {scheduleTime && (  
                  <div>  
                    <label htmlFor="scheduleTime" className="block text-sm font-medium text-gray-700">  
                      Date and Time  
                    </label>  
                    <input  
                      type="datetime-local"  
                      id="scheduleTime"  
                      name="scheduleTime"  
                      min={new Date().toISOString().slice(0, 16)}  
                      value={scheduleTime}  
                      onChange={(e) => setScheduleTime(e.target.value)}  
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"  
                    />  
                  </div>  
                )}  
              </div>  
              <div className="pt-5 flex justify-between">  
                <button  
                  onClick={() => setStep('preview')}  
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"  
                >  
                  Back  
                </button>  
                <button  
                  onClick={handlePublishPost}  
                  disabled={posting}  
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#0A66C2] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"  
                >  
                  {posting ? (  
                    <>  
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />  
                      {scheduleTime ? 'Scheduling...' : 'Publishing...'}  
                    </>  
                  ) : (  
                    <>  
                      <Send className="h-5 w-5 mr-2" />  
                      {scheduleTime ? 'Schedule Post' : 'Publish Now'}  
                    </>  
                  )}  
                </button>  
              </div>  
            </div>  
          )}  
        </div>  
      </div>  
    </div>  
  );  
};  
  
export default CreatePost;  