import React, { useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface SettingsProps {
  user: any;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    apiKey: '',
    apiEndpoint: '',
    deploymentName: '',
    defaultScheduleTime: '09:00',
    notificationsEnabled: true,
    preferredContentTypes: ['informative', 'how-to'],
  });

  const contentTypes = [
    { id: 'informative', label: 'Informative' },
    { id: 'storytelling', label: 'Storytelling' },
    { id: 'opinion', label: 'Opinion' },
    { id: 'how-to', label: 'How-to Guide' },
    { id: 'industry-news', label: 'Industry News' },
    { id: 'career-tip', label: 'Career Tip' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      setSettings({
        ...settings,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setSettings({
        ...settings,
        [name]: value,
      });
    }
  };

  const handleContentTypeChange = (contentType: string) => {
    const updatedTypes = settings.preferredContentTypes.includes(contentType)
      ? settings.preferredContentTypes.filter(type => type !== contentType)
      : [...settings.preferredContentTypes, contentType];
    
    setSettings({
      ...settings,
      preferredContentTypes: updatedTypes,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium leading-6 text-gray-900">App Configuration</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Configure your Azure OpenAI and LinkedIn automation preferences.
          </p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Azure OpenAI Configuration</h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                    API Key
                  </label>
                  <input
                    type="password"
                    name="apiKey"
                    id="apiKey"
                    value={settings.apiKey}
                    onChange={handleChange}
                    placeholder="Enter your Azure OpenAI API key"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="apiEndpoint" className="block text-sm font-medium text-gray-700">
                    API Endpoint
                  </label>
                  <input
                    type="text"
                    name="apiEndpoint"
                    id="apiEndpoint"
                    value={settings.apiEndpoint}
                    onChange={handleChange}
                    placeholder="https://your-resource.openai.azure.com/"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                
                <div>
                  <label htmlFor="deploymentName" className="block text-sm font-medium text-gray-700">
                    Deployment Name
                  </label>
                  <input
                    type="text"
                    name="deploymentName"
                    id="deploymentName"
                    value={settings.deploymentName}
                    onChange={handleChange}
                    placeholder="Enter your deployment name"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
            
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Post Preferences</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="defaultScheduleTime" className="block text-sm font-medium text-gray-700">
                    Default Posting Time
                  </label>
                  <input
                    type="time"
                    name="defaultScheduleTime"
                    id="defaultScheduleTime"
                    value={settings.defaultScheduleTime}
                    onChange={handleChange}
                    className="mt-1 block w-full sm:w-auto border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    This will be the default time used when scheduling posts.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Content Types
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {contentTypes.map((type) => (
                      <div key={type.id} className="flex items-center">
                        <input
                          id={`content-type-${type.id}`}
                          name="preferredContentTypes"
                          type="checkbox"
                          checked={settings.preferredContentTypes.includes(type.id)}
                          onChange={() => handleContentTypeChange(type.id)}
                          className="h-4 w-4 text-[#0A66C2] focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`content-type-${type.id}`}
                          className="ml-2 block text-sm text-gray-700"
                        >
                          {type.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    These will be suggested when creating new posts.
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Notifications</h3>
              
              <div className="flex items-center">
                <input
                  id="notificationsEnabled"
                  name="notificationsEnabled"
                  type="checkbox"
                  checked={settings.notificationsEnabled}
                  onChange={handleChange}
                  className="h-4 w-4 text-[#0A66C2] focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="notificationsEnabled" className="ml-2 block text-sm text-gray-700">
                  Enable email notifications for post performance
                </label>
              </div>
            </div>
            
            <div className="pt-5">
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#0A66C2] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" />
                      Save Settings
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;