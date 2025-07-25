
import { PipecatClient, type PipecatClientOptions } from "@pipecat-ai/client-js";
import { PipecatClientAudio, PipecatClientProvider, PipecatClientVideo, usePipecatClientTransportState, } from "@pipecat-ai/client-react";
import { WebSocketTransport } from "@pipecat-ai/websocket-transport";
import { Controls } from "./Controls";

function BotVideo() {
  const transportState = usePipecatClientTransportState();
  const isConnected = transportState !== 'disconnected';

  return (
    <div className="bot-container">
      <div className="video-container">
        video
        {isConnected && <PipecatClientVideo participant="bot" fit="cover" />}
      </div>
    </div>
  );
}

const config: PipecatClientOptions = {
  transport: new WebSocketTransport(),
  enableMic: true,
  enableCam: false,

  callbacks: {
    onConnected: () => {
      console.log('Client connected');
    },

    // onDisconnected: () => {
    //   this.updateStatus('Disconnected');
    //   if (this.connectBtn) this.connectBtn.disabled = false;
    //   if (this.disconnectBtn) this.disconnectBtn.disabled = true;
    //   this.log('Client disconnected');
    // },
    onBotReady: (data) => {
      console.log(`Bot ready: ${JSON.stringify(data)}`);
    },
    onUserTranscript: (data) => {
      if (data.final) {
        console.log(`User: ${data.text}`);
      }
    },
    onBotTranscript: (data) => console.log(`Bot: ${data.text}`),
    onMessageError: (error) => console.error('Message error:', error),
    onError: (error) => console.error('Error:', error),
  },
};

const client = new PipecatClient(config);

function App() {
  return (
    <div>
      <PipecatClientProvider client={client}>
        <Controls />
        <BotVideo />

        <PipecatClientAudio />
      </PipecatClientProvider>
    </div>

  );
}

export default App
