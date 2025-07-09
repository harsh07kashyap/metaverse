import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../context/Peer";
import { useSocket } from "../context/Socket";

const Room = () => {
  const socket = useSocket();
  console.log("Socket in room", socket);
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [isInitiator, setIsInitiator] = useState(false);
  const [micEnabled, setMicEnabled] = useState(true);
  const [micStream, setMicStream] = useState(null);
  const [volume, setVolume] = useState(0.8);
const [muted, setMuted] = useState(false);


  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      setMicStream(stream);
    });
  }, []);

  const toggleMic = () => {
    if (micStream) {
      micStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setMicEnabled(!micEnabled);
    }
  };

  const handleUserJoined = useCallback(({ userId, id }) => {
    console.log(`User ${userId} joined room with id ${id}`);
    setRemoteSocketId(id);
    setIsInitiator(true);
  }, []);

  const handleCallUser = useCallback(async () => {
    if (!socket || !remoteSocketId) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      setIsInitiator(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      console.log("Call accepted from", from, "with answer", ans);
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      console.log("Negotiation needed from", from, "with offer", offer);
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    console.log("inside negoneed final");
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  return (
    <div className="room_container">
      {/* <h1>Room Page</h1> */}
      <h4>
        {remoteSocketId ? "Other users also in room" : "No other user in room"}
      </h4>
      <p>
        {remoteSocketId
          ? "(Click CALL to join via video-call)"
          : "(When someone joins, you will be able to vdeo call them)"}
      </p>
      {!isInitiator && myStream && (
        <button onClick={sendStreams}>Send Stream</button>
      )}
      {remoteSocketId && isInitiator && (
        <button onClick={handleCallUser}>CALL</button>
      )}
      <div className="room_container_video">
        {myStream && (
          <>
            <div className="room_container_video_myStream">
              <ReactPlayer
                playing
                muted
                height="150px"
                width="300px"
                url={myStream}
              />
              <button onClick={toggleMic}>
                {micEnabled ? 'Mute Mic' : 'Unmute Mic'}
              </button>

              <div className="">
                <h4>You</h4>
              </div>
            </div>
          </>
        )}
        {remoteStream && (
          <>
            <div className="room_container_video_myStream">
              <ReactPlayer
                playing
                muted={muted}
                volume={volume}
                height="150px"
                width="300px"
                url={remoteStream}
              />
              <button onClick={() => setMuted(!muted)}>
                {muted ? 'Unmute' : 'Mute'}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
              />

              <div>
                <h4>Remote Stream</h4>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Room;
