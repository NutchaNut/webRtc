import React, { useState, useEffect } from 'react';
import Videostream from 'components/videostream';
// import fb, { sendMessage, yourId } from 'services/firebase';
import { sendMessage } from 'services/firebase';
import pc from '../../services/WebRTCConnection';

function Homepage() {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const readMessage = async data => {
    // const msg = JSON.parse(data.val().message);
    console.log('Message' + data);

    // const sender = { ...data.val() };
    // if (sender !== yourId) {
    //   if (msg.ice) pc.addIceCandidate(new RTCIceCandidate(msg.ice));
    //   else if (msg.sdp.type === 'offer') {
    //     await pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    //     const answer = await pc.createAnswer();
    //     await pc.setLocalDescription(new RTCSessionDescription(answer));
    //     sendMessage({ sdp: pc.localDescription });
    //   } else if (msg.sdp.type === 'answer') {
    //     pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    //   }
    // }
  };

  // pc.onicecandidate = event => {
  //   if (event.candidate) Fire.shared.sendMessage({ ice: event.candidate });
  //   else console.log('Sent all ice');
  // };

  pc.ontrack = event => {
    if (event.streams && event.streams[0]) {
      setRemoteStream(event.streams[0]);
    } else {
      let inboundStream = null;
      if (!remoteStream) {
        inboundStream = new MediaStream();
        inboundStream.addTrack(event.track);
      } else {
        inboundStream = { ...remoteStream };
        inboundStream.addTrack(event.track);
      }
      setRemoteStream(inboundStream);
    }
  };

  useEffect(() => {
    const showMyFace = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      for (const track of stream.getTracks()) {
        pc.addTrack(track, stream);
      }
      setLocalStream(stream);
    };

    showMyFace();

    //Fire.on('child_added', readMessage);
  }, []);

  const showFriendsFace = async () => {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendMessage({ sdp: pc.localDescription });
  };

  return (
    <section className="homepage">
      <div className="stream">
        <Videostream src={localStream} autoplay muted />
        <Videostream src={remoteStream} autoplay />
      </div>
      <button type="button" onClick={showFriendsFace}>
        Start your call!
      </button>
    </section>
  );
}

export default Homepage;
