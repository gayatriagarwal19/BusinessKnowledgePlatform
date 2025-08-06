
import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ReactMarkdown from 'react-markdown';
import { sendMessage, addUserMessage, stopBotStreaming } from '../redux/chatSlice';
import { logout } from '../redux/authSlice';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const dispatch = useDispatch();
  const { messages, isLoading, isBotTyping, error } = useSelector((state) => state.chat);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    // When closing, stop any ongoing streaming
    if (isOpen) {
      dispatch(stopBotStreaming());
    }
  };

  const handleSend = () => {
    if (input.trim()) {
      dispatch(addUserMessage(input));
      dispatch(sendMessage(input));
      setInput('');
    }
  };

  useEffect(() => {
      if (error === "Token is not valid") {
        console.log('entering profile error useEffect');
        toast.error("Session expired. Please log in again.");
        dispatch(logout());
        navigate('/login'); // Ensure the toast is shown only once
      }
    }, [dispatch, navigate, error]);;

  // Scroll to the bottom of the chat window
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleChatbot}
        className="bg-indigo-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-3xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        &#129302;
      </button>
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 h-96 bg-white rounded-lg shadow-lg flex flex-col">
          <div className="p-4 bg-indigo-600 text-white rounded-t-lg flex justify-between items-center">
            <h3 className="text-lg font-semibold">AI Assistant</h3>
            <button onClick={toggleChatbot} className="text-white text-xl leading-none">&times;</button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto" style={{ scrollBehavior: "smooth" }}>
            {messages.map((msg, index) => (
              <div key={index} className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`${msg.sender === 'user' ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'} rounded-lg p-3 max-w-[70%]`}>
                  <ReactMarkdown>{msg.text + (msg.streaming ? '...' : '')}</ReactMarkdown>
                </div>
              </div>
            ))}
            {error && (
              <div className="flex mb-4 justify-start">
                <div className="bg-red-200 text-red-800 rounded-lg p-3 max-w-[70%] break-words">
                  <p>Error: {error}</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
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
                disabled={isLoading || isBotTyping}
              />
              <button
                onClick={handleSend}
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={isLoading || isBotTyping}
              >
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
