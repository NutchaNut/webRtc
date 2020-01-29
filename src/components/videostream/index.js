import React, { useRef, useEffect } from 'react';

const layout = {
  height: '300px',
  width: '300px',
};

function Videostream({ src, autoplay, muted }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (src) videoRef.current.srcObject = src;
  }, [src]);

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video {...layout} ref={videoRef} autoPlay={autoplay} muted={muted} />
  );
}

export default Videostream;
