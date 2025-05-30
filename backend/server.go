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

    app.Static("/static", "./img")

    // USER STUFF
    appHandleLogin(backend, api)
    appHandleRegister(backend, api)

    appHandleUserInfo(backend, protected)
    appHandleUserInfoAll(backend, protected)
    appHandleUserInfoOf(backend, protected)
    appHandleUserEdit(backend, protected)
    appHandleUserEditAdmin(backend, protected)
    appHandleUserDelAdmin(backend, protected)
    appHandleUserUploadImage(backend, protected)
    appHandleUserCount(backend, protected)
    appHandleRegisterAdmin(backend, protected)

    // EVENT STUFF
    appHandleEventInfoAll(backend, protected)
    appHandleEventInfoOf(backend, protected)
    appHandleEventNew(backend, protected)
    appHandleEventDel(backend, protected)
    appHandleEventEdit(backend, protected)
    appHandleEventUploadImage(backend, protected)

    // MATERIAL STUFF
    appHandleMaterialNew(backend, protected)
    appHandleMaterialInfoOf(backend, protected)
    appHandleEventDel(backend, protected)
    appHandleEventEdit(backend, protected)

    app.Get("/", func(c *fiber.Ctx) error {
        return c.SendString("Server is running.")
    })
}

