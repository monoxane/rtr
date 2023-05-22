import React, { useState, useEffect, useRef } from 'react';

import JSMpeg from '@cycjimmy/jsmpeg-player';

import imgs from './imgs';

function JSmpegPlayer({ url, active }) {
  const videoRef = useRef(null);
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    if (active) {
      player?.destroy();
      const p = new JSMpeg.VideoElement(
        videoRef.current,
        url,
        {
          autoplay: false,
          poster: imgs.probe_slate,
        },
        {},
      );
      setPlayer(p);
    } else {
      player?.destroy();
      setPlayer(null);
    }
  }, [active, url]);

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      onClick={() => {
        if (player?.player.isPlaying) {
          player?.player.pause();
        } else {
          player?.player.play();
        }
      }}
      className={active ? 'probePlayer' : 'probeSlate'}
      ref={videoRef}
    />
  );
}

export default JSmpegPlayer;
