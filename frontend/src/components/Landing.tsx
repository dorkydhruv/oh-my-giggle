import { useEffect, useRef, useState } from "react";
import { Room } from "./Room";
export const Landing = () => {
  const [name, setName] = useState("");
  const [joined, setJoined] = useState(false);
  const [localVideoTrack, setLocalVideoTrack] =
    useState<null | MediaStreamTrack>(null);
  const [localAudioTrack, setLocalAudioTrack] =
    useState<null | MediaStreamTrack>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const getCam = async () => {
    const stream = await window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setLocalVideoTrack(stream.getVideoTracks()[0]);
    setLocalAudioTrack(stream.getAudioTracks()[0]);
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
    videoRef.current.play();
  };

  useEffect(() => {
    if (videoRef.current && videoRef) {
      getCam();
    }
  }, [videoRef]);
  if (!joined) {
    return (
      <div>
        <video autoPlay ref={videoRef}></video>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={() => {
            //create a room
            setJoined(true);
          }}
        >
          Join
        </button>
      </div>
    );
  }
  return (
    <Room
      name={name}
      // @ts-ignore
      localAudioTrack={localAudioTrack}
      // @ts-ignore
      localVideoTrack={localVideoTrack}
    />
  );
};
