const servers = {
  iceServers: [
    {
      urls: ["stun:stun.services.mozilla.com", "stun:stun2.l.google.com:19302"]
    }
  ],
};

const pc = new RTCPeerConnection(servers);

export default pc;
