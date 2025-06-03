package main

import (
    "time"
    "math/rand"

    jwtware "github.com/gofiber/contrib/jwt"
    "github.com/gofiber/fiber/v2"
    "gorm.io/gorm"
)

type Backend struct {
    app   *fiber.App
    db    *gorm.DB
    pass  string
    rand  *rand.Rand
}

func appCreateNewServer(db *gorm.DB, secret string) *Backend {
    rand_t := rand.New(rand.NewSource(time.Now().UnixNano()))
    app := fiber.New(fiber.Config{
        AppName: "Webinar-RPL Backend",
    })

    return &Backend{
        app:   app,
        db:    db,
        pass: secret,
        rand: rand_t,
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
    appHandleMaterialDel(backend, protected)
    appHandleMaterialEdit(backend, protected)

    // CERTIFICATE TEMPLATE STUFF
    appHandleCertTempNew(backend, protected)
    appHandleCertTempInfoOf(backend, protected)
    appHandleCertDel(backend, protected)
    appHandleCertGen(backend, protected) // WIP

    // EVENT PARTICIPANT STUFF
    appHandleEventParticipate(backend, protected) // WIP

    app.Get("/", func(c *fiber.Ctx) error {
        return c.SendString("Server is running.")
    })
}

