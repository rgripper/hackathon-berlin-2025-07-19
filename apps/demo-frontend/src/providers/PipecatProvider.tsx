import { type PropsWithChildren } from 'react';
import { PipecatClient, PipecatClientOptions } from '@pipecat-ai/client-js';
import { PipecatClientProvider } from '@pipecat-ai/client-react';
import { WebSocketTransport } from "@pipecat-ai/websocket-transport";

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

export function PipecatProvider({ children }: PropsWithChildren) {
  return (
    <PipecatClientProvider client={client}>{children}</PipecatClientProvider>
  );
}
