import React from 'react';
import InstagramPreview from './InstagramPreview';
import FacebookPreview from './FacebookPreview';
import LinkedInPreview from './LinkedInPreview';
import TwitterPreview from './TwitterPreview';

const PostPreview = ({ platform, content, image, isEditing, onContentChange, onImageEdit, onImageUpload }) => {
  const props = {
    content,
    image,
    isEditing,
    onContentChange,
    onImageEdit,
    onImageUpload
  };

  switch(platform) {
    case '📸 Instagram':
      return <InstagramPreview {...props} />;
    case '👥 Facebook':
      return <FacebookPreview {...props} />;
    case '💼 LinkedIn':
      return <LinkedInPreview {...props} />;
    case '🐦 Twitter':
      return <TwitterPreview {...props} />;
    default:
      return <InstagramPreview {...props} />;
  }
};

export default PostPreview;