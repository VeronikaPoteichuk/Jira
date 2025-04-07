import pytest
from channels.testing import WebsocketCommunicator
from jira.websocket import websocket_application


@pytest.mark.asyncio
async def test_websocket_connect():
    communicator = WebsocketCommunicator(websocket_application, "/ws/echo/")
    connected, subprotocol = await communicator.connect()

    assert connected is True

    await communicator.disconnect()


@pytest.mark.asyncio
async def test_websocket_ping_pong():
    communicator = WebsocketCommunicator(websocket_application, "/ws/echo/")
    connected, _ = await communicator.connect()
    assert connected

    await communicator.send_to(text_data="ping")
    response = await communicator.receive_from()
    assert response == "pong!"

    await communicator.disconnect()
