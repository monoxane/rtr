import React, { useState, useEffect, useRef } from 'react';

import JSMpeg from '@cycjimmy/jsmpeg-player';

import imgs from './imgs'

const JSmpegPlayer = ({ url, active }) => {
  const videoRef = useRef(null)
  const [player, setPlayer] = useState(null)

  useEffect(() => {
    if (active) {
      player?.destroy()
      const p = new JSMpeg.VideoElement(
        videoRef.current,
        url,
        {
          autoplay: false,
          poster: imgs.probe_slate
        },
        {}
      )
      setPlayer(p);
    } else {
      player?.destroy()
      setPlayer(null)
    }
  }, [active, url]);

  return (
    <div
      onClick={() => {
        player.player.isPlaying ? player.player.pause() : player.player.play()
      }}
      className="probePlayer"
      ref={videoRef}>
    </div>
  );
};

export default JSmpegPlayer;