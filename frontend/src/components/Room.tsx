import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { io, Socket } from "socket.io-client";
export const Room = ({
  name,
  localAudioTrack,
  localVideoTrack,
}: {
  name: string;
  localAudioTrack: MediaStreamTrack;
  localVideoTrack: MediaStreamTrack;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [lobby, setLobby] = useState(true);
  const [sendingPc, setSendingPc] = useState<null | RTCPeerConnection>(null);
  const [recievingPc, setRecievingPc] = useState<null | RTCPeerConnection>(
    null
  );
  const [remoteMediaTracks, setRemoteMediaTracks] =
    useState<MediaStream | null>(null);
  const [remoteVideoTrack, setRemoteVideoTrack] =
    useState<null | MediaStreamTrack>(null);

  const [remoteAuidoTrack, setRemoteAudioTrack] =
    useState<null | MediaStreamTrack>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    try {
      const socket = io("http://localhost:3000");
      socket.on("send-offer", async ({ roomId }) => {
        setLobby(false);
        const pc = new RTCPeerConnection();
        setSendingPc(pc);
        const stream = new MediaStream();
        // if (localVideoRef.current) {
        //   localVideoRef.current.srcObject = stream;
        // }
        // stream.addTrack(localAudioTrack);
        // stream.addTrack(localVideoTrack);
        pc.addTrack(localAudioTrack);
        pc.addTrack(localVideoTrack);
        pc.onicecandidate = async () => {
          const sdp = await pc.createOffer();
          socket.emit("offer", {
            sdp,
            roomId,
          });
        };
      });

      //recieve offer
      socket.on("offer", ({ roomId, offer }) => {
        setLobby(false);
        const pc = new RTCPeerConnection();
        pc.setRemoteDescription({
          type: "offer",
          sdp: offer,
        });
        const sdp = pc.createAnswer();
        const stream = new MediaStream();
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
        setRemoteMediaTracks(stream);
        setRecievingPc(pc);
        pc.ontrack = ({ track, type }) => {
          if ("audio" == type) {
            // setRemoteAudioTrack(track);
            //@ts-ignore
            remoteVideoRef.current.srcObject.addTrack(track);
          } else {
            // setRemoteVideoTrack(track);
            //@ts-ignore
            remoteVideoRef.current.srcObject.addTrack(track);
          }
          remoteVideoRef.current?.play();
        };
        socket.emit("answer", {
          roomId,
          sdp,
        });
      });

      //recieve answer
      socket.on("answer", ({ roomId, answer }) => {
        setLobby(false);
        setSendingPc((pc) => {
          pc?.setRemoteDescription({
            type: "answer",
            sdp: answer,
          });
          return pc;
        });
      });

      socket.on("lobby", () => {
        setLobby(true);
      });

      setSocket(socket);
    } catch (e) {
      console.log(e);
    }
  }, [name]);

  useEffect(() => {
    if (localVideoRef.current) {
      const stream = new MediaStream();
      stream.addTrack(localAudioTrack);
      stream.addTrack(localVideoTrack);
      localVideoRef.current.srcObject = stream;
    }
  }, [localVideoRef]);

  return (
    <div>
      <h1>Hi!, {name}</h1>
      {lobby ? <h1>Waiting for a match</h1> : null}
      <video autoPlay width={400} height={400} ref={localVideoRef}></video>
      <video autoPlay ref={remoteVideoRef} width={400} height={400}></video>
    </div>
  );
};
