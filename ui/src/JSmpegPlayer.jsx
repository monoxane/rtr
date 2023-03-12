import React, { useState, useEffect, useRef } from 'react';

import JSMpeg from '@cycjimmy/jsmpeg-player';

const JSmpegPlayer = ({ url, active }) => {
  const videoRef = useRef(null)
  const [player, setPlayer] = useState(null)

  useEffect(() => {
    console.log(player, active)
    if (active && !player) {
      setPlayer(new JSMpeg.VideoElement(
        videoRef.current,
        url,
        {
          autoplay: false
        },
        {}
      ));
    } else {
      player?.destroy()
      setPlayer(null)
    }
  }, [active]);

  return (
    <div
      className="probePlayer"
      ref={videoRef}>
    </div>
  );
};

export default JSmpegPlayer;