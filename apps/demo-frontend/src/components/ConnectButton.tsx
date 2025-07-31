import {
  usePipecatClient,
  usePipecatClientTransportState,
} from '@pipecat-ai/client-react';

export function ConnectButton() {
  const client = usePipecatClient();
  const transportState = usePipecatClientTransportState();
  const isConnected = ['connected', 'ready'].includes(transportState);

  const handleClick = async () => {
    if (!client) {
      console.error('Pipecat client is not initialized');
      return;
    }

    try {
      if (isConnected) {
        await client.disconnect();
      } else {
        const mics = await client.getAllMics(); // Ensure speakers are loaded before connecting
        console.log(mics);
        if (mics.length === 0) {
          console.warn('No microphones available');
          return;
        }
        client.updateMic(mics.find(x => x.label.includes('Realtek'))?.deviceId ?? mics[0]?.deviceId); // Select the first mic if available
        // Connect to the Pipecat server
        await client.connect({ endpoint: 'http://localhost:7860/connect' });
      }
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  return (
    <div className="controls">
      <button
        className={isConnected ? 'disconnect-btn' : 'connect-btn'}
        onClick={handleClick}
        disabled={
          !client || ['connecting', 'disconnecting'].includes(transportState)
        }>
        {isConnected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  );
}
