package main

import (
	"os/user"
	"path/filepath"
)

type ActionRequestMessage struct {
	Action    string                 `json:"action"`
	Arguments map[string]interface{} `json:"arguments"`
}

type ActionResponseMessage struct {
	Kind    string                 `json:"kind"`
	Message string                 `json:"message"`
	Data    map[string]interface{} `json:"data"`
}

func main() {
	usr, _ := user.Current()
	pass := NewPassService(filepath.Join(usr.HomeDir, ".password-store"))
	actionMessage := ReadNativeActionRequestMessage()

	if actionMessage.Action == "list_host_usernames" {
		if knownHost := pass.FetchHost(actionMessage.Arguments["hostname"].(string)); knownHost != nil {
			payload := make(map[string]interface{})
			payload["hostname"] = actionMessage.Arguments["hostname"]
			payload["usernames"] = knownHost.Usernames
			WriteNativeMessage(ActionResponseMessage{Kind: "host_username_list", Data: payload, Message: "success"})

		} else {
			WriteNativeMessage(ActionResponseMessage{Kind: "error", Message: "unkown_host"})
		}

	} else if actionMessage.Action == "fetch_user_password" {
		hostname := actionMessage.Arguments["hostname"].(string)
		username := actionMessage.Arguments["username"].(string)

		if password, err := pass.FetchPassword(hostname, username); err == nil {
			payload := make(map[string]interface{})
			payload["password"] = password
			WriteNativeMessage(ActionResponseMessage{Kind: "user_password", Data: payload, Message: "success"})
		} else {
			WriteNativeMessage(ActionResponseMessage{Kind: "error", Message: "fatal"})
		}

	} else {
		WriteNativeMessage(ActionResponseMessage{Kind: "error", Message: "fatal"})
	}
}
