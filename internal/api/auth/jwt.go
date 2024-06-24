package auth

import (
	"fmt"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	jwt "github.com/golang-jwt/jwt/v5"
	"github.com/monoxane/rtr/internal/env"
)

var (
	issuer string = "rtr"

	PUBLIC        string = "ANY"
	ROLE_ADMIN    string = "ADMIN"
	ROLE_OPERATOR string = "OPERATOR"

	ROLES []string = []string{ROLE_ADMIN, ROLE_OPERATOR}

	ROLE_MAP map[string]int = map[string]int{
		PUBLIC:        0,
		ROLE_OPERATOR: 1,
		ROLE_ADMIN:    2,
	}
)

func createToken(username, role string) (string, error) {
	// Create a new JWT token with claims
	claims := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": username,                                                          // Subject (user identifier)
		"iss": issuer,                                                            // Issuer
		"aud": role,                                                              // Audience (user role)
		"exp": time.Now().Add(time.Hour * time.Duration(env.JWTLifespan)).Unix(), // Expiration time
		"iat": time.Now().Unix(),                                                 // Issued at
	})

	// Print information about the created token
	fmt.Printf("Token claims added: %+v\n", claims)

	tokenString, err := claims.SignedString([]byte(env.JWTSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func VerifyToken(token string) (username string, role string, err error) {
	parsed, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(env.JWTSecret), nil
	})

	if err != nil {
		return "", "", err
	}

	sub, err := parsed.Claims.GetSubject()
	if err != nil {
		return "", "", err
	}

	aud, err := parsed.Claims.GetSubject()
	if err != nil {
		return "", "", err
	}

	return sub, aud, nil
}

// Extract the JWT Token from the Gin Context
func GetToken(c *gin.Context) string {
	token := c.Query("token")
	if token != "" {
		return token
	}

	bearerToken := c.Request.Header.Get("Authorization")
	if len(strings.Split(bearerToken, " ")) == 2 {
		return strings.Split(bearerToken, " ")[1]
	}

	// No token? the client should feel bad and go away
	return ""
}
