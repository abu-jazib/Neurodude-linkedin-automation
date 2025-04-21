import axios from 'axios';

export const registerImageUpload = async (accessToken, userId) => {
  const response = await axios.post(
    'https://api.linkedin.com/v2/assets?action=registerUpload',
    {
      registerUploadRequest: {
        owner: `urn:li:person:${userId}`,
        recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
        serviceRelationships: [{
          relationshipType: 'OWNER',
          identifier: 'urn:li:userGeneratedContent'
        }],
        supportedUploadMechanism: ['SYNCHRONOUS_UPLOAD']
      }
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const uploadUrl = response.data.value.uploadMechanism['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'].uploadUrl;
  const asset = response.data.value.asset;
  return { uploadUrl, asset };
};

export const fetchImageAsBuffer = async (imageUrl) => {
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  return Buffer.from(response.data);
};

export const uploadImage = async (uploadUrl, imageBuffer) => {
  await axios.put(uploadUrl, imageBuffer, {
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Length': imageBuffer.length
    }
  });
};
