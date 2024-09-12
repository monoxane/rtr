package tbus

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"io"
	"log"
	"net"
	"time"

	"github.com/pkg/errors"
)

var (
	NK2_KEEPALIVE        = []byte("HI")
	NK2_CONNECT_REQ      = []byte{0x50, 0x48, 0x4f, 0x45, 0x4e, 0x49, 0x58, 0x2d, 0x44, 0x42, 0x20, 0x4e, 0x0a}
	NK2_CONNECT_RESP     = []byte{0x57, 0x65, 0x6c, 0x63, 0x6f, 0x6d, 0x65, 0x0a}
	NK2_HEADER           = []byte{0x4e, 0x4b, 0x32}
	NK_STATUS_RESP       = []byte{0x05, 0x0B}
	NK_MULTI_STATUS_REQ  = []byte{0x50, 0x41, 0x53, 0x32, 0x00, 0x11, 0x4e, 0x4b, 0x32, 0x00, 0xfe, 0x02, 0x08, 0x00, 0x00, 0x00, 0x47, 0xff, 0xff, 0xff, 0xff, 0xc7, 0x08}
	NK_MULTI_STATUS_RESP = []byte{0x03, 0xe1}
)

type RouteUpdate struct {
	Destination int `json:"destination"`
	Source      int `json:"source"`
	Level       int `json:"level"`
}

type StatusUpdate struct {
	Connected bool   `json:"connected"`
	Reason    string `json:"reason"`
}

// A IPS is an implementation of the protocol interface with the NK Routing system via an NK-NET or NK-IPS
type TBusGateway struct {
	IP            net.IP
	conn          net.Conn
	onRouteUpdate func(RouteUpdate)
	onConnect     func(StatusUpdate)
	onDisconnect  func(StatusUpdate)
}

func NewGateway(ip net.IP, onRouteUpdate func(RouteUpdate), onStatusUpdate func(StatusUpdate)) *TBusGateway {
	return &TBusGateway{
		IP:            ip,
		onRouteUpdate: onRouteUpdate,
		onConnect:     onStatusUpdate,
		onDisconnect:  onStatusUpdate,
	}
}

func (tbus *TBusGateway) Connect() error {
	conn, err := net.Dial("tcp", tbus.IP.String()+":5000")
	if err != nil {
		log.Fatalln(err)
	}
	tbus.conn = conn
	defer tbus.conn.Close()

	if _, err = tbus.conn.Write(NK2_CONNECT_REQ); err != nil {
		log.Printf("failed to send the client request: %v\n", err)
	}

	tbus.onConnect(StatusUpdate{
		Connected: true,
		Reason:    "Connected to TBus Gateway",
	})

	go func() {
		for range time.Tick(10 * time.Second) {
			if _, err := tbus.conn.Write([]byte("HI")); err != nil {
				tbus.onDisconnect(StatusUpdate{
					Connected: false,
					Reason:    fmt.Sprintf("Keepalive failed: %s", err),
				})
			}
		}
	}()

	for {
		buf := make([]byte, 2048)
		len, err := tbus.conn.Read(buf)
		switch err {
		case nil:
			tbus.processNKMessage(buf, len)
		case io.EOF:
			return errors.New("remote connection closed")
		default:
			return errors.Wrap(err, "unhandled server error")
		}
	}
}

func (tbus *TBusGateway) Disconnect() {
	tbus.conn.Close()
}

func (tbus *TBusGateway) processNKMessage(buffer []byte, length int) {
	msg := buffer[:length]
	log.Printf("Processing message of len %d: %x", length, msg)

	if length == len(NK2_CONNECT_RESP) && bytes.Equal(msg, NK2_CONNECT_RESP) {
		log.Printf("Successfully Connected")
		tbus.conn.Write(NK_MULTI_STATUS_REQ)
	}

	if length > 3 && bytes.Equal(msg[:3], NK2_HEADER) {
		log.Printf("NK Command or Response, CMD: %x", msg[5:7])
		if bytes.Equal(msg[5:7], NK_STATUS_RESP) {
			tbus.parseSingleUpdateMessage(msg)
		}

		if bytes.Equal(msg[5:7], NK_MULTI_STATUS_RESP) {
			tbus.parseMultiUpdateMessage(msg)
		}
	}
}

func (tbus *TBusGateway) parseSingleUpdateMessage(msg []byte) {
	dst := binary.BigEndian.Uint16(msg[8:10]) + 1
	src := binary.BigEndian.Uint16(msg[10:12]) + 1
	lvl := binary.BigEndian.Uint32(msg[12:16])

	tbus.onRouteUpdate(RouteUpdate{
		Destination: int(dst),
		Source:      int(src),
		Level:       int(lvl),
	})
}

func (tbus *TBusGateway) parseMultiUpdateMessage(msg []byte) {
	table := msg[15 : len(msg)-2]

	currentCrosspointByte := 1
	for {
		if currentCrosspointByte >= len(table) {
			break
		}

		dst := uint16(currentCrosspointByte/3) + 1
		src := binary.BigEndian.Uint16(table[currentCrosspointByte:currentCrosspointByte+2]) + 1
		lvl := uint32(1)

		tbus.onRouteUpdate(RouteUpdate{
			Destination: int(dst),
			Source:      int(src),
			Level:       int(lvl),
		})

		currentCrosspointByte++
		currentCrosspointByte++
		currentCrosspointByte++
	}
}

func (tbus *TBusGateway) Route(address TBusAddress, level Level, destination uint16, source uint16) error {
	xptreq := CrosspointRequest{
		Source:      source,
		Destination: destination,
		Level:       level,
		Address:     address,
	}

	packet, err := xptreq.Packet()
	if err != nil {
		return errors.Wrap(err, "unable to generate crosspoint route request")
	}

	_, err = tbus.conn.Write(packet)
	if err != nil {
		return errors.Wrap(err, "unable to send route request to router")
	}

	return nil
}
