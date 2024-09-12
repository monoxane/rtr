package tbus

type TBusAddress = uint8
type Level = uint32
type Source = uint16
type Destination = uint16
type TBusCRC = uint16

// TBUS Protocol Packets
type nkRoutePacketPayload struct {
	NK2Header   uint32
	RTRAddress  TBusAddress
	UNKNB       uint16
	Destination Destination
	Source      Source
	LevelMask   Level
	UNKNC       uint8
}

type nkRoutePacket struct {
	HeaderA uint32
	HeaderB uint16
	Payload nkRoutePacketPayload
	CRC     TBusCRC
}
