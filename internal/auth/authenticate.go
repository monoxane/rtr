package auth

import (
	"fmt"

	"github.com/monoxane/rtr/internal/graph/model"
	usersRepository "github.com/monoxane/rtr/internal/repository/users"
)

type LoginResponse struct {
	model.User
	Token string `json:"token"`
}

func Authenticate(username, password string) (*model.User, string, error) {
	user, err := usersRepository.GetByUsername(username)
	if err != nil {
		return nil, "", fmt.Errorf("user not found")
	}

	match, err := comparePasswordAndHash(password, user.Hash)
	if err != nil {
		return nil, "", fmt.Errorf("unable to process login request")
	}

	if !match {
		return nil, "", fmt.Errorf("invalid password")
	}

	token, err := createToken(username, user.Role)
	if err != nil {
		return nil, "", fmt.Errorf("unable to process login request")
	}

	err = usersRepository.RecordLogin(user.ID)
	if err != nil {
		return nil, "", fmt.Errorf("unable to process login event")
	}

	return &user, token, nil
}
