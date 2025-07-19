import React, { useState, useRef } from 'react';

const MicButton = ({ isRecording, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded text-white font-semibold ${
      isRecording ? 'bg-red-500' : 'bg-green-500'
    }`}
  >
    {isRecording ? 'Stop Recording' : 'Start Talking'}
  </button>
);

export default function VoiceChat() {
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [summary, setSummary] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef(null);

  const startRecording = async () => {
    setIsRecording(true);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    const audioChunks = [];
    mediaRecorder.ondataavailable = (event) => {
      audioChunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      setLoading(true);
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });

      try {
        // Send audio to /api/transcribe
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.wav');

        const transcribeRes = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });
        const transcribeData = await transcribeRes.json();
        setTranscript(transcribeData.transcript);

        // Send transcript to /api/chat
        const chatRes = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: transcribeData.transcript }),
        });
        const chatData = await chatRes.json();
        setResponse(chatData.response);

        // Fetch summary
        const summaryRes = await fetch('/api/summary');
        const summaryData = await summaryRes.json();
        setSummary(summaryData.summary);

        // Speak the assistant response
        const utterance = new SpeechSynthesisUtterance(chatData.response);
        speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('Error calling API:', err);
      }
      setLoading(false);
    };

    mediaRecorder.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Voice Chat Assistant</h1>
      <div className="flex items-center gap-4 mb-4">
        <MicButton
          isRecording={isRecording}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={loading}
        />
        <span>{isRecording ? 'Listening...' : loading ? 'Processing...' : ''}</span>
      </div>
      <div className="mb-2">
        <strong>Transcript:</strong> <span>{transcript}</span>
      </div>
      <div className="mb-2">
        <strong>Assistant:</strong> <span>{response}</span>
      </div>
      <div className="mb-2">
        <strong>Summary:</strong> <span>{summary}</span>
      </div>
    </div>
  );
}
