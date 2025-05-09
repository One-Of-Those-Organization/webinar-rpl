package main

import (
    jwtware "github.com/gofiber/contrib/jwt"
    "github.com/gofiber/fiber/v2"
    "gorm.io/gorm"
)

type Backend struct {
    app   *fiber.App
    db    *gorm.DB
    pass  string
}

func appCreateNewServer(db *gorm.DB, secret string) *Backend {
    app := fiber.New(fiber.Config{
        AppName: "Webinar-RPL Backend",
    })

    return &Backend{
        app:   app,
        db:    db,
        pass: secret,
    }
}

func appMakeRouteHandler(backend *Backend) {
    app := backend.app
    api := app.Group("/api")

    protected := api.Group("/protected", jwtware.New(jwtware.Config{
        SigningKey: jwtware.SigningKey{Key: []byte(backend.pass)},
    }))

    appHandleLogin(backend, api)
    appHandleRegister(backend, api)

    appHandleUserInfo(backend, protected)
    appHandleUserInfoAll(backend, protected)
    appHandleUserInfoOf(backend, protected)
    appHandleUserEdit(backend, protected)

    appHandleNewEvent(backend, protected)

    app.Get("/", func(c *fiber.Ctx) error {
        return c.SendString("Server is running.")
    })
}

