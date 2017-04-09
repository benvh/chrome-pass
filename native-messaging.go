package main

import (
	"bufio"
	"bytes"
	"encoding/binary"
	"encoding/json"
	_ "fmt"
	"os"
)

func WriteNativeMessage(msgValue interface{}) {
	msgBytes, _ := json.Marshal(msgValue)
	msgBuffer := bytes.NewBuffer(msgBytes)
	binary.Write(os.Stdout, binary.LittleEndian, uint32(len(msgBytes)))
	msgBuffer.WriteTo(os.Stdout)
}

func ReadNativeActionRequestMessage() ActionRequestMessage {
	reader := bufio.NewReader(os.Stdin)

	lenBuf := make([]byte, 4)
	reader.Read(lenBuf)
	len := binary.LittleEndian.Uint32(lenBuf)

	msgBuf := make([]byte, len)
	reader.Read(msgBuf)

	var requestMessage ActionRequestMessage
	json.Unmarshal(msgBuf, &requestMessage)

	return requestMessage
}
