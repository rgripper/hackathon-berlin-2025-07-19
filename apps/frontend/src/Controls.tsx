import { usePipecatClient } from "@pipecat-ai/client-react";

export function Controls() {
    const client = usePipecatClient();
    return <div><button onClick={async () => {
        if (!client) return;
        const speakers = await client.getAllSpeakers();
        console.log(speakers)
        client.updateSpeaker(speakers[2].deviceId)

        console.log(client.selectedSpeaker)

        await client.connect({

            endpoint: 'http://localhost:7860/connect',
        });
    }}>OK Computer</button><button onClick={async () => {
        if (!client) return;

        await client.disconnect();
    }}>Stop</button></div>;
}