import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import JSMpeg from '@cycjimmy/jsmpeg-player';

import imgs from './imgs';

function JSmpegPlayer({ url, active }) {
  const videoRef = useRef(null);
  const player = useRef(null);

  useEffect(() => {
    if (active) {
      player.current?.destroy();
      const p = new JSMpeg.VideoElement(
        videoRef.current,
        url,
        {
          autoplay: false,
          poster: imgs.probe_slate,
        },
        {},
      );
      player.current = p;
    } else if (player.current) {
      player.current.destroy();
      player.current = null;
    }
  }, [active, url]);

  useEffect(() => () => {
    player.current?.destroy();
  }, []);

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

JSmpegPlayer.propTypes = {
  url: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
};

export default JSmpegPlayer;
