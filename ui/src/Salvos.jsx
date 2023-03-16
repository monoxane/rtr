import React, { useState, useEffect } from 'react';
import useAxios from 'axios-hooks';
import axios from 'axios';

import useMatrix from './useMatrix'

import { 
  Button,
  ButtonSet,
  Column,
  ComboBox,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableContainer,
  TableHeader,
  TableBody,
  TableCell,
  TableToolbar,
  TableToolbarContent,
  IconButton,
  Modal
} from '@carbon/react';

import { 
  TrashCan,
  Add,
  Redo,
  QueryQueue
} from '@carbon/icons-react';

const Salvos = function Salvos() {
  const {matrix, loading: matrixLoading, error: matrixError, route} = useMatrix()
  const [{ data: config, loading: configLoading, error: configError }, refresh] = useAxios(
    '/v1/config'
  )

  const [currentSalvo, setCurrentSalvo] = useState({})
  const [newSalvoName, setNewSalvoName] = useState()

  useEffect(() => {
    console.log("Current Salvo", currentSalvo)
  }, [currentSalvo])

  const headers = ['Destination', 'Saved Source', 'Current Source', "Actions"];

  const recallCurrentSalvo = () => {
    currentSalvo.destinations.map((destination, index) => {
      setTimeout(
        () => route(destination.id, destination.source.id),
        100 * index
      )
    })
  }

  const saveCurrentSalvo = () => {
    const salvo = {...currentSalvo}
    salvo.destinations.map(destination => destination = matrix.destinations[destination.id - 1])
    console.log(salvo)
    axios.post('/v1/salvos', salvo)
      .then(() => {
        refresh()
      })
      .catch((err) => {
        console.log("unable to save salvo", err)
      });
  }

  return (
    <Grid>
      {configLoading && "Loading..."}
      {configError && "Error"}
      {!configLoading && !configError && 
        <Column sm={4} lg={16}>
          <TableToolbar>
            <TableToolbarContent>
              <strong style={{marginTop: "1em", marginRight: "1em", minWidth: "50px"}}>Selected Salvo:</strong>
              <ComboBox 
                items={[newSalvoName && {label:`${newSalvoName} (New)`}, ...config.salvos].filter(Boolean)}
                selectedItem={currentSalvo}
                itemToString={(item) => (item ? item.label : '')} 
                placeholder="Type to Filter..."
                onChange={(event) => {
                  if (event.selectedItem == null) {return}
                  if (event.selectedItem.destinations == undefined) {
                    if(newSalvoName != "") {
                      setCurrentSalvo({ label: newSalvoName, destinations: []})
                    }
                  } else {
                    setCurrentSalvo(event.selectedItem)
                  }
                }}
                onInputChange={(event) => setNewSalvoName(event)}
              />
              <Button 
                style={{marginLeft:"0.6em"}}
                disabled={!currentSalvo.label} 
                onClick={() => saveCurrentSalvo()}
              >
                Save
              </Button>
              <Button 
                disabled={!currentSalvo.label} 
                kind="danger" 
                onClick={() => recallCurrentSalvo()}
              >
                Recall
              </Button>
            </TableToolbarContent>
          </TableToolbar>
          {currentSalvo.label && 
            <>
              <Table size="lg" useZebraStyles={false} style={{height: "80%", overflow: "scroll"}}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader id={header.key} key={header}>
                        {header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentSalvo.destinations?.map((row) => row != null && (
                    <TableRow key={row.id}>
                      <TableCell>{row.label}</TableCell>
                      <TableCell>{row.source.label}</TableCell>
                      <TableCell>{matrix.destinations[row.id-1].source.label}</TableCell>
                      <TableCell>
                        <IconButton
                          kind='ghost'
                          label="Recall this Destination"
                          size="sm"
                          onClick={() => { route(row.id, row.source.id)}}
                        >
                          <Redo />
                        </IconButton>
                        <IconButton
                          kind='ghost'
                          label="Remove from Salvo"
                          size="sm"
                          onClick={() => setCurrentSalvo({...currentSalvo, destinations: [...currentSalvo.destinations.filter(savedDestination => savedDestination.id != row.id)]})}
                        >
                          <TrashCan />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ComboBox 
                items={matrix.destinations?.filter((destination) => !currentSalvo.destinations.find(({ id }) => destination.id === id))}
                itemToString={(item) => (item ? `${item.label} <= ${item.source.label}` : '')} 
                placeholder="Type to Filter..."
                helperText="Add Destination to Salvo"
                direction={currentSalvo.destinations.length > 10 ? "top" : "bottom"}
                onChange={
                  (event) => {
                    if (event.selectedItem) setCurrentSalvo({...currentSalvo, destinations: [...currentSalvo.destinations, event.selectedItem].sort((a, b) => (a.id - b.id))})
                  }
                }
              />
            </>
          }
        </Column>
      }
    </Grid>
  )
}

export default Salvos
