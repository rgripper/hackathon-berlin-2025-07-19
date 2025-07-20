#
# Copyright (c) 2024–2025, Daily
#
# SPDX-License-Identifier: BSD 2-Clause License
#

import os

from loguru import logger

from pipecat.audio.vad.silero import SileroVADAnalyzer
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.runner import PipelineRunner
from pipecat.pipeline.task import PipelineParams, PipelineTask
from pipecat.processors.aggregators.openai_llm_context import OpenAILLMContext
from pipecat.processors.frameworks.rtvi import RTVIConfig, RTVIObserver, RTVIProcessor
from pipecat.serializers.protobuf import ProtobufFrameSerializer
from pipecat.services.openai.llm import OpenAILLMService
from pipecat.services.openai.stt import OpenAISTTService
from pipecat.services.elevenlabs.tts import ElevenLabsTTSService
from pipecat.transports.network.websocket_server import (
    WebsocketServerParams,
    WebsocketServerTransport,
)
from pipecat.transcriptions.language import Language

with open("server/instruction.txt", "r", encoding="utf-8") as file:
    instruction = file.read()


async def run_bot_websocket_server():
    ws_transport = WebsocketServerTransport(
        params=WebsocketServerParams(
            serializer=ProtobufFrameSerializer(),
            audio_in_enabled=True,
            audio_out_enabled=True,
            add_wav_header=False,
            vad_analyzer=SileroVADAnalyzer(),
            session_timeout=60 * 3,  # 3 minutes
        )
    )

    llm = OpenAILLMService(api_key=os.getenv("OPENAI_API_KEY"))
    stt = OpenAISTTService(
        api_key=os.getenv("OPENAI_API_KEY"),
        model="gpt-4o-transcribe",
    )
    tts = ElevenLabsTTSService(
        api_key=os.getenv("ELEVENLABS_API_KEY"),
        voice_id=os.getenv("ELEVENLABS_VOICE_ID"),
        model="eleven_flash_v2_5",
        params=ElevenLabsTTSService.InputParams(
            language=Language.EN,
            stability=0.7,
            similarity_boost=0.8,
            style=0.5,
            use_speaker_boost=True,
            speed=1.1,
        ),
    )

    context = OpenAILLMContext(
        [
            {
                "role": "system",
                "content": instruction,
            }
        ],
    )
    context_aggregator = llm.create_context_aggregator(context)

    # RTVI events for Pipecat client UI
    rtvi = RTVIProcessor(config=RTVIConfig(config=[]))

    pipeline = Pipeline(
        [
            ws_transport.input(),
            stt,  # STT
            context_aggregator.user(),
            rtvi,
            llm,  # LLM
            tts,
            ws_transport.output(),
            context_aggregator.assistant(),
        ]
    )

    task = PipelineTask(
        pipeline,
        params=PipelineParams(
            enable_metrics=True,
            enable_usage_metrics=True,
        ),
        observers=[RTVIObserver(rtvi)],
    )

    @rtvi.event_handler("on_client_ready")
    async def on_client_ready(rtvi):
        logger.info("Pipecat client ready.")
        await rtvi.set_bot_ready()
        # Kick off the conversation.
        await task.queue_frames([context_aggregator.user().get_context_frame()])

    @ws_transport.event_handler("on_client_connected")
    async def on_client_connected(transport, client):
        logger.info("Pipecat Client connected")

    @ws_transport.event_handler("on_client_disconnected")
    async def on_client_disconnected(transport, client):
        logger.info("Pipecat Client disconnected")
        await task.cancel()

    @ws_transport.event_handler("on_session_timeout")
    async def on_session_timeout(transport, client):
        logger.info(f"Entering in timeout for {client.remote_address}")
        await task.cancel()

    runner = PipelineRunner()

    await runner.run(task)
