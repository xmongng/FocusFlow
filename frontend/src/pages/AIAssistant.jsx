import React from 'react';
import AssistantPanel from '../components/assistant/AssistantPanel';

const AIAssistant = () => {
  return (
    <div className="-mx-4 -my-4 lg:-mx-8 lg:-my-8 h-[calc(100vh-4rem)] animate-in fade-in duration-500 overflow-hidden">
      <AssistantPanel />
    </div>
  );
};

export default AIAssistant;
