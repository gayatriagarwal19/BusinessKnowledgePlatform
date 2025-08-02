
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessage, addUserMessage } from '../redux/chatSlice';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const dispatch = useDispatch();
  const { messages, isLoading } = useSelector((state) => state.chat);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
  };

  const handleSend = () => {
    if (input.trim()) {
      dispatch(addUserMessage(input));
      dispatch(sendMessage(input));
      setInput('');
    }
  };

  return (
    <div className="fixed bottom-4 right-4">
      <button
        onClick={toggleChatbot}
        className="bg-indigo-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-3xl"
      >
        &#129302;
      </button>
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 h-96 bg-white rounded-lg shadow-lg flex flex-col">
          <div className="p-4 bg-indigo-600 text-white rounded-t-lg">
            <h3 className="text-lg font-semibold">AI Assistant</h3>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-start mb-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                <div className={`${msg.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200'} rounded-lg p-3`}>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && <p>Thinking...</p>}
          </div>
          <div className="p-4 border-t">
            <div className="flex">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button onClick={handleSend} className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
