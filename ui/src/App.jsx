// General Imports
import React, {useState, useEffect} from 'react';
import useAxios from 'axios-hooks'
import Favicon from 'react-favicon';
import axios from 'axios'

import { black, white, gray, blue, purple } from '@carbon/colors';
import { IconButton, Modal, ButtonSet, Button, Content, Grid, Column, Row } from '@carbon/react';
import { Maximize, PortOutput, PortInput} from '@carbon/icons-react';

import Header from './Header.jsx';

import useMatrix from './useMatrix'

import JSmpegPlayer from './JSmpegPlayer.jsx'

const favicon = 'data:image/png;base64,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L3d3dy5naW1wLm9yZy94bXAvIgogICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iCiAgIHhtcE1NOkRvY3VtZW50SUQ9ImdpbXA6ZG9jaWQ6Z2ltcDo1MDUzNmY1OC04OWE5LTRiZTMtOGRjZC04N2ZkMDY0N2JiZWMiCiAgIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6YWI2NmU0ZDYtZTdjNi00MjRjLWJkZjMtYjBlNjIxZmJlZmRjIgogICB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6YjMwZTNmNTYtMzgwMi00NDNlLWE2ZDAtNmFiYzExOTczM2MzIgogICBkYzpGb3JtYXQ9ImltYWdlL3BuZyIKICAgR0lNUDpBUEk9IjIuMCIKICAgR0lNUDpQbGF0Zm9ybT0iTWFjIE9TIgogICBHSU1QOlRpbWVTdGFtcD0iMTY3ODI0NzgxNjc3MTYwNCIKICAgR0lNUDpWZXJzaW9uPSIyLjEwLjMwIgogICB0aWZmOk9yaWVudGF0aW9uPSIxIgogICB4bXA6Q3JlYXRvclRvb2w9IkdJTVAgMi4xMCI+CiAgIDx4bXBNTTpIaXN0b3J5PgogICAgPHJkZjpTZXE+CiAgICAgPHJkZjpsaQogICAgICBzdEV2dDphY3Rpb249InNhdmVkIgogICAgICBzdEV2dDpjaGFuZ2VkPSIvIgogICAgICBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjg5ZTVlYWM2LWMwMDQtNDRiZi04YjcwLTdlYWE0ZTA0NTI3NiIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iR2ltcCAyLjEwIChNYWMgT1MpIgogICAgICBzdEV2dDp3aGVuPSIyMDIzLTAzLTA4VDE0OjU2OjU2KzExOjAwIi8+CiAgICA8L3JkZjpTZXE+CiAgIDwveG1wTU06SGlzdG9yeT4KICA8L3JkZjpEZXNjcmlwdGlvbj4KIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAKPD94cGFja2V0IGVuZD0idyI/Pu1KhL0AAAAGYktHRAD/AP8A/6C9p5MAAAAJcEhZcwAA7DgAAOw4AXEryjgAAAAHdElNRQfnAwgDODh4WmmZAAAcYElEQVR42u3de7xWdYHv8e8a9bwsFTAx76WVllrexWjMTHudibgIbtPU1Bm0vMRFbtY5ZzrVaeZMCYggKCp4wby3VUCky2iEF1K8ZIqaZs2MNlk5J8ea8iWXdf7YbG+RsuHZ+3nWXu/3Xyiw93qtn3t/P8/aGyz6jlxTBgColb9yCwBAAAAAAgAAEAAAgAAAAAQAACAAAAABAAAIAABAAAAAAgAAEAAAgAAAAAQAACAAAAABAAAIAABAAACAAAAABAAAIAAAAAEAAAgAAEAAAAACAAAQAACAAAAABAAAIAAAAAEAAAgAAEAAAOup/bQiC84o3AioqU3dAqjn+B85sOPHC1Jk2OzSTQFPAIC6jH+SHHZwPAkAAQDUafxFAAgAoKbjLwJAAAA1HX8RAAIAqOn4iwAQAEBNx18EgAAAajr+IgAEAFDT8RcBIACAmo6/CAABANR0/EUACACgpuMvAkAAADUdfxEAAgCo6fiLABAAQE3HXwSAAABqOv4iAAQAUNPxFwEgAICajr8IAAEA1HT8RQAIAKCm4y8CQAAANR1/EQACAKjp+IsAEABATcdfBIAAAGo6/iIABABQ0/EXASAAgJqOvwgAAQDUdPxFAAgAoKbjLwJAAAA1HX8RAAIAqOn4iwAQAEBNx18EgAAA41/T8RcBIADA+NecCAABAMZfBAACAIy/CAAEABh/EQAIADD+IgAQAGD8RQAgAMD4iwBAAIDxFwGAAADjLwIAAQDGXwSAAACMvwgAAQAYfxEAAgAw/iIABABg/EUACAAw/ogAEABg/BEBIADA+CMCQACA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';

const App = function App() {
  const [{ data: config, loading: configLoading, error: configError }] = useAxios(
    '/v1/config'
  )

  const {matrix, loading: matrixLoading, error: matrixError, route} = useMatrix()
  const [selectedDestination, setSelectedDestination] = useState(1)
  const [ProbeSOTRouting, setProbeSODRouting] = useState(false)
  const [probeFullscreen, setProbeFullscreen] = useState(false)

  useEffect(() => {
    if (config?.probe.enabled && ProbeSOTRouting) {
      route(config.probe.router_destination, matrix.destinations[selectedDestination - 1].source.id)
    }
    if (config?.probe.enabled && selectedDestination == config.probe.router_destination && ProbeSOTRouting) {
      setProbeSODRouting(false)
    }
  }, [selectedDestination]);

  useEffect(() => {
    if (config?.probe.enabled && ProbeSOTRouting) {
      if (matrix.destinations[selectedDestination - 1].source.id != matrix.destinations[config.probe.router_destination - 1].source.id) {
        route(config.probe.router_destination, matrix.destinations[selectedDestination - 1].source.id)
      }
    }
  }, [matrix]);

  useEffect(() => {
    if (config?.probe.enabled && ProbeSOTRouting) {
      if (matrix.destinations[selectedDestination - 1].source.id != matrix.destinations[config.probe.router_destination - 1].source.id) {
        route(config.probe.router_destination, matrix.destinations[selectedDestination - 1].source.id)
      }
    }
  }, [ProbeSOTRouting]);

  return (
    <>
      <Favicon url={favicon} />
      <>
        <Header />
        <Content style={{
              overflow: 'clip',
              background: gray[80],
            }}>
          {(matrixLoading || configLoading) && "Loading"}
          {(matrixError || configError) && JSON.stringify({matrixError: matrixError, configError: configError})}
          {config && matrix && 
          <>
            {config.probe.enabled &&
              <Modal
                open={probeFullscreen}
                modalHeading={<><strong>Probe: </strong> {matrix.destinations?.[config.probe.router_destination - 1]?.source?.label}</>}
                passiveModal
                onRequestClose={()=> setProbeFullscreen(false)}
                className="fullscreenProbe"
              >
                <JSmpegPlayer url={'ws://'+document.location.hostname+':'+document.location.port+'/v1/ws/probe'} active={probeFullscreen}/>
              </Modal>
            }
            <Grid>
              <Column sm={4} lg={6} className="destinations">
                <Grid condensed>
                  <Column sm={4}>
                    <h1>Destinations</h1>
                  </Column>
                </Grid>
                <Grid 
                  condensed 
                  className="iolist"
                >
                  { matrix.destinations && matrix.destinations.map((button, buttonIndex) => {
                    return (
                      <Column sm={2} lg={2} key={buttonIndex}>
                        <Button
                          onClick={() => { setSelectedDestination(button.id) }}
                          key={buttonIndex}
                          style={{
                            minWidth: '10px',
                            padding: '10px',
                            width: '100%',
                            height: '4em',
                            display: 'table',
                            marginBottom: '1px',
                            background: button.id == selectedDestination ? blue[60] : gray[70],
                            outline: button.id == selectedDestination ? '1px white solid' : '',
                          }}
                        >
                          <>
                            <strong>{button.label}</strong>
                            <br/>
                            {button.source?.label}
                          </>
                        </Button>
                      </Column>
                    )
                  })}
                </Grid>
              </Column>
              <Column sm={4} lg={4}>
                <Grid>
                  <Column sm={4} g={4}>
                    <h1>Status</h1>
                  </Column>
                </Grid>
                <Grid  
                  style={{
                    height: '80vh',
                  }}
                >
                  <Column sm={4} g={4}>
                    <br/>
                    <h4><strong>DST:</strong> {matrix.destinations?.[selectedDestination-1]?.label} </h4>
                    <h4><strong>SRC:</strong> {matrix.destinations?.[selectedDestination-1]?.source?.label}</h4>
                    { config.probe.enabled && 
                    <>
                      <Row style={{
                        height: '19.5vh',
                      }}>
                        <JSmpegPlayer url={'ws://'+document.location.hostname+':'+document.location.port+'/v1/ws/probe'} active={!probeFullscreen}/>
                        <br/>
                        {ProbeSOTRouting && <>
                          <strong>Probe Follow:</strong> {matrix.destinations?.[selectedDestination - 1]?.label}
                          <br/>
                        </>}
                        <strong>Probe Source:</strong> {matrix.destinations?.[config.probe.router_destination - 1]?.source?.label}
                      </Row>
                      <br/><br/><br/>
                      <Row>
                        <h3>Probe Mode:</h3>
                          <Button
                              onClick={() => {
                                setProbeSODRouting(!ProbeSOTRouting)
                              }}
                              renderIcon={PortOutput}
                              style={{
                                minWidth: '10px',
                                display: 'table',
                                marginBottom: "1px",
                                width: '100%',
                                background: ProbeSOTRouting ? purple[60] : gray[60],
                              }}
                            >
                            <>
                              <strong>Follow{ProbeSOTRouting && "ing"} Destination</strong>
                            </>
                          </Button>
                          <Button
                              onClick={() => {
                                setSelectedDestination(config.probe.router_destination)
                              }}
                              renderIcon={PortInput}
                              style={{
                                minWidth: '10px',
                                display: 'table',
                                marginBottom: "1px",
                                width: '100%',
                                background: selectedDestination == config.probe.router_destination ? blue[60] : gray[60],
                              }}
                            >
                            <>
                              <strong>Standalone Probe</strong>
                            </>
                          </Button>
                          <Button 
                            label="Maximise Probe"
                            onClick={()=> setProbeFullscreen(true)}
                            renderIcon={Maximize}
                            kind='secondary'
                            style={{
                              minWidth: '10px',
                              display: 'table',
                              marginBottom: "1px",
                              width: '100%',
                            }}
                          >
                            Maximize Probe View
                          </Button>
                      </Row>
                    </>
                    }
                  </Column>
                </Grid>
              </Column>
              <Column sm={4} lg={6} className="sources">
                <Grid condensed>
                  <Column sm={4}>
                    <h1>Sources</h1>
                  </Column>
                </Grid>
                <Grid 
                  condensed 
                  className="iolist"
                >
                  { matrix.sources && matrix.sources.map((button, buttonIndex) => {
                    return (
                      <Column sm={2} lg={2} key={buttonIndex}>
                        <Button
                          onClick={() => {  route(selectedDestination, button.id) }}
                          key={buttonIndex}
                          style={{
                            minWidth: '10px',
                            padding: '10px',
                            width: '100%',
                            height: '4em',
                            display: 'table',
                            marginBottom: '1px',
                            background: button.id == matrix.destinations[selectedDestination-1]?.source?.id ? purple[60] : gray[70],
                            outline: button.id == matrix.destinations[selectedDestination-1]?.source?.id ? '1px white solid' : ''
                          }}
                        >
                          <>
                            <strong>{button.label}</strong>
                            <br/>
                            {button.source?.label}
                          </>
                        </Button>
                      </Column>
                    )
                  })}
                </Grid>
              </Column>
            </Grid>
            </>
          }
        </Content>
      </>
    </>
  );
};

export default App;