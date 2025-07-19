import { usePipecatClient } from "@pipecat-ai/client-react";

export function Controls() {
    const client = usePipecatClient();
    return <button onClick={() => {
        client?.connect({
            endpoint: 'http://localhost:7860/connect',
        });
    }}>OK Computer</button>;
}