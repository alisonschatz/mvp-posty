import React from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';

const ChatMessages = ({
  messages,
  isTyping,
  selectedTones,
  generatedContent,
  postImage,
  isEditing,
  conversationData,
  imageDescription,
  messagesEndRef,
  onUserResponse,
  onConfirmToneSelection,
  onContentChange,
  onEditToggle,
  onImageEdit,
  onImageUpload,
  onCopyContent,
  onDownloadImage,
  onRestart,
  onSuggestImages,
  onImageSelect
}) => {
  return (
    <div className="flex-1 p-6 overflow-y-auto max-h-[500px]">
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          selectedTones={selectedTones}
          generatedContent={generatedContent}
          postImage={postImage}
          isEditing={isEditing}
          conversationData={conversationData}
          imageDescription={imageDescription}
          onUserResponse={onUserResponse}
          onConfirmToneSelection={onConfirmToneSelection}
          onContentChange={onContentChange}
          onEditToggle={onEditToggle}
          onImageEdit={onImageEdit}
          onImageUpload={onImageUpload}
          onCopyContent={onCopyContent}
          onDownloadImage={onDownloadImage}
          onRestart={onRestart}
          onSuggestImages={onSuggestImages}
          onImageSelect={onImageSelect}
        />
      ))}
      
      {/* Typing indicator */}
      {isTyping && <TypingIndicator />}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;