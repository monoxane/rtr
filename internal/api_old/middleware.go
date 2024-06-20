package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func ZerologMiddleware() gin.HandlerFunc {
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

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token")
		c.Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Cache-Control, Content-Language, Content-Type")
		c.Header("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}
