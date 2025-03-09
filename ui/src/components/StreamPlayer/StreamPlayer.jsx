import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import JSMpeg from '@cycjimmy/jsmpeg-player';
import {
  Button,
  Tooltip,
} from '@carbon/react';
import {
  Minimize,
  FitToScreen,
} from '@carbon/icons-react';
import { useSubscription, gql } from '@apollo/client';

import './umd.scss';

import imgs from '../../common/imgs';

const STREAM_SUBSCRIPTION = gql`subscription streamUpdates($slug: String) {
  stream(slug: $slug) {
    isActive
    label
    destination {
      id
      label
      routedSource {
        id
        label
        tallyRed
        tallyGreen
      }
    }
  }
}`;

function StreamPlayer({ slug, showUMD }) {
  const videoRef = useRef(null);
  const player = useRef(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [stream, setStream] = useState({});

  const { data, loading } = useSubscription(
    STREAM_SUBSCRIPTION,
    { variables: { slug } },
  );

  useEffect(() => {
    if (loading) { return; }
    if (data && (stream !== data.stream)) {
      setStream(data.stream);
    }
  }, [data, loading]);

  useEffect(() => {
    if (stream?.isActive) {
      player.current?.destroy();
      const p = new JSMpeg.VideoElement(
        videoRef.current,
        `ws://${document.location.hostname}:${document.location.port}/v1/streams/client/${slug}`,
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
  }, [stream, slug]);

  useEffect(() => () => {
    player.current?.destroy();
  }, []);

  return (
    <div className={fullscreen ? 'probeFullscreen' : 'probe'}>
      <div className="probeFullscreenButton">
        <Button
          hasIconOnly
          renderIcon={fullscreen ? Minimize : FitToScreen}
          kind="ghost"
          iconDescription={fullscreen ? 'Exit Fullscreen ' : 'Fullscreen'}
          align="right"
          onClick={() => {
            setFullscreen(!fullscreen);
          }}
        />
      </div>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        onClick={() => {
          if (player?.player?.isPlaying) {
            player?.player?.pause();
          } else {
            player?.player?.play();
          }
        }}
        className={stream?.isActive ? 'probePlayer' : 'probeSlate'}
        ref={videoRef}
      />
      {showUMD
      && (
        <div className="umd">
          <div
            className={`leftLamp ${stream.destination?.routedSource?.tallyGreen && 'green'}`}
          >
            &nbsp;
          </div>
          <Tooltip
            className="label"
            label={(
              <>
                Stream:
                {' '}
                {stream.label?.toUpperCase() || slug || 'Unknown'}
                <br />
                Destination:
                {' '}
                {stream.destination?.label || 'None'}
                <br />
                Source:
                {' '}
                {stream.destination?.routedSource?.label || 'None'}
              </>
          )}
          >
            <p className="label">
              {stream.destination?.routedSource?.label || stream.destination?.label || stream.label?.toUpperCase() || slug}
            </p>
          </Tooltip>
          <div
            className={`rightLamp ${stream.destination?.routedSource?.tallyRed && 'red'}`}
          >
            &nbsp;
          </div>
        </div>
      )}
    </div>
  );
}

StreamPlayer.propTypes = {
  slug: PropTypes.string.isRequired,
  showUMD: PropTypes.bool,
};

StreamPlayer.defaultProps = {
  showUMD: false,
};

export default StreamPlayer;
