package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"
)

func Zerolog(log zerolog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		switch c.Writer.Status() {
		case http.StatusBadRequest, http.StatusUnauthorized, http.StatusForbidden, http.StatusNotFound, http.StatusConflict:
			log.Warn().
				Str("method", c.Request.Method).
				Str("path", c.Request.URL.Path).
				Int("status", c.Writer.Status()).
				Str("remote", c.ClientIP()).
				Strs("errors", c.Errors.Errors()).
				Str("user-agent", c.Request.UserAgent()).
				Send()
		case 500:
			log.Error().
				Str("method", c.Request.Method).
				Str("path", c.Request.URL.Path).
				Int("status", c.Writer.Status()).
				Str("remote", c.ClientIP()).
				Strs("errors", c.Errors.Errors()).
				Str("user-agent", c.Request.UserAgent()).
				Send()
		default:
			log.Info().
				Str("method", c.Request.Method).
				Str("path", c.Request.URL.Path).
				Int("status", c.Writer.Status()).
				Str("remote", c.ClientIP()).
				Str("user-agent", c.Request.UserAgent()).
				Send()
		}
	}
}
