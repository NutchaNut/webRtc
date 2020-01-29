import React, { useState, useEffect } from 'react';
import Videostream from 'components/videostream';
// import fb, { sendMessage, yourId } from 'services/firebase';
import { sendMessage, onlineWeb, sendIce, dbRef, getFriendData } from 'services/firebase';
import pc from '../../services/WebRTCConnection';

function Homepage() {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const readMessage = async data => {
    //const msg = JSON.parse(data.val().message);
    let friendData = {};
    //console.log('Message', data.val());
    if (data.val().message) {
      console.log('ok');
      friendData = await getFriendData(data.val().message);
      console.log('friendData', friendData.candidate);
      //if (friendData.candidate) pc.addIceCandidate(new RTCIceCandidate(friendData.candidate));
      //pc.setRemoteDescription(new RTCSessionDescription(friendData.sdp));
    }
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

  pc.onicecandidate = event => {
    if (event.candidate) sendIce(event.candidate);
    else console.log('Sent all ice');
  };

  pc.ontrack = event => {
    console.log('ontrack');
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
      onlineWeb();
      setLocalStream(stream);
    };

    showMyFace();

    dbRef.on('child_added', readMessage);
  }, []);

  const showFriendsFace = async () => {
    console.log('senddd');
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendMessage(pc.localDescription);
    console.log(pc.localDescription);
  };

  return (
    <section className="homepage">
      <div className="stream">
        <Videostream src={localStream} autoplay mute />
        <Videostream src={remoteStream} autoplay />
      </div>
      <button type="button" onClick={showFriendsFace}>
        Start your call!
      </button>
    </section>
  );
}

export default Homepage;
