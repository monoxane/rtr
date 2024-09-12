package crc

// Simple 2 byte CRC for XPT payload
func CRC16(buffer []byte) uint16 {
	var crc = 0xFFFF
	var odd = 0x0000

	for i := 0; i < len(buffer); i++ {
		crc = crc ^ int(buffer[i])

		for j := 0; j < 8; j++ {
			odd = crc & 0x0001
			crc = crc >> 1
			if odd == 1 {
				crc = crc ^ 0xA001
			}
		}
	}

	crc = ((crc & 0xFF) << 8) | ((crc & 0xFF00) >> 8)
	return uint16(crc)
}
