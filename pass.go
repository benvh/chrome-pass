package main

import (
	"bytes"
	"errors"
	"io/ioutil"
	"os/exec"
	"path/filepath"
)

type PassService struct {
	KnownHosts []KnowHost
}

type KnowHost struct {
	Hostname  string
	Usernames []string
}

func (k *KnowHost) HasUser(username string) bool {
	hasIt := false
	for _, someName := range k.Usernames {
		if someName == username {
			hasIt = true
			break
		}
	}
	return hasIt
}

func NewPassService(passwordStoreLocation string) *PassService {
	// simply map the root password-store dir
	// top-level directories are considered "know-hosts". The name of the directory is the hostname
	// every password file within a "known-host" directory is a "user". The name of the file is the username.
	// we'll use this to query the hosts/users
	knownHosts := make([]KnowHost, 0)
	hosts, _ := ioutil.ReadDir(passwordStoreLocation)

	for _, hostFileInfo := range hosts {
		if hostFileInfo.IsDir() {
			knownHost := KnowHost{hostFileInfo.Name(), make([]string, 0)}

			users, _ := ioutil.ReadDir(filepath.Join(passwordStoreLocation, hostFileInfo.Name()))
			for _, userFileInfo := range users {
				if userFileInfo.Mode().IsRegular() {
					fileName := userFileInfo.Name()
					fileExt := filepath.Ext(userFileInfo.Name())
					knownHost.Usernames = append(knownHost.Usernames, fileName[0:len(fileName)-len(fileExt)])
				}
			}

			knownHosts = append(knownHosts, knownHost)
		}
	}

	return &PassService{knownHosts}
}

// Find a host (or nil if no matching host is found)
func (p *PassService) FetchHost(hostname string) *KnowHost {
	for _, knowHost := range p.KnownHosts {
		if knowHost.Hostname == hostname {
			return &knowHost
		}
	}
	return nil
}

// Fetch a password for a given hostname/username combination
func (p *PassService) FetchPassword(hostname string, username string) (string, error) {
	var host *KnowHost
	if host = p.FetchHost(hostname); host == nil {
		return "", errors.New("unkown host")
	}

	if !host.HasUser(username) {
		return "", errors.New("unkown user")
	}

	var passPathBuf bytes.Buffer
	passPathBuf.WriteString(hostname)
	passPathBuf.WriteString("/")
	passPathBuf.WriteString(username)

	passShowCmd := exec.Command("pass", "show", passPathBuf.String())
	passShowCmdOutput, _ := passShowCmd.Output()
	passResultBuf := bytes.NewBuffer(passShowCmdOutput)

	return passResultBuf.String(), nil
}
