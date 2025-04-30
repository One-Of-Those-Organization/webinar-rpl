package main

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/session"
	"github.com/gofiber/storage/sqlite3"
	"gorm.io/gorm"
)

type Backend struct {
    app   *fiber.App
    store *session.Store
    db    *gorm.DB
}

func appCreateNewServer(dbFile string, db *gorm.DB) *Backend {
    app := fiber.New(fiber.Config{
        AppName: "Webinar-RPL Backend",
    })
    storage := sqlite3.New(sqlite3.Config{
        Database: dbFile,
    })
    store := session.New(session.Config{
        Storage:        storage,
        Expiration:     24 * time.Hour,
        CookieHTTPOnly: true,
        CookieSecure:   false,
        CookiePath:     "/",
    })

    return &Backend{
        app:   app,
        store: store,
        db:    db,
    }
}

func appMakeRouteHandler(backend *Backend) {
    app := backend.app
    api_route := app.Group("/api")

    appHandleRegister(backend, api_route)
    appHandleLogin(backend, api_route)
    appHandleLogout(backend, api_route)
    appHandleGetUserInfo(backend, api_route)

    app.Get("/", func(c *fiber.Ctx) error {
        return c.SendString("Server is running.")
    })
}