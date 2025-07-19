package main

import (
	"math/rand"
	"time"

	jwtware "github.com/gofiber/contrib/jwt"
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type Backend struct {
    app       *fiber.App
    db        *gorm.DB
    pass      string
    rand      *rand.Rand
    engine    *DynamicEngine
    address   string
    email     string
    mode      string
    emailpass string
}

func appCreateNewServer(db *gorm.DB, sec SecretHolder, address string) *Backend {
    secret := sec.Password
    rand_t := rand.New(rand.NewSource(time.Now().UnixNano()))
    engine := NewDynamicEngine([]string{
        "./static-hidden/",
        "./static/",
}, ".html")
    app := fiber.New(fiber.Config{
        AppName: "Webinar-RPL Backend",
        Views: engine,
    })

    return &Backend{
        app:   app,
        db:    db,
        pass: secret,
        rand: rand_t,
        engine: engine,
        address: address,
        mode: "http",
        email: sec.Email,
        emailpass: sec.EmailAppPassword,
    }
}

func appMakeRouteHandler(backend *Backend) {
    app := backend.app
    api := app.Group("/api")

    protected := api.Group("/protected", jwtware.New(jwtware.Config{
        SigningKey: jwtware.SigningKey{Key: []byte(backend.pass)},
    }))

    cookieJWT := api.Group("/c", jwtware.New(jwtware.Config{
        SigningKey:  jwtware.SigningKey{Key: []byte(backend.pass)},
        TokenLookup: "cookie:jwt",
        ContextKey:  "user",
    }))

    app.Static("/static", "./static")

    // USER STUFF
    appHandleLogin(backend, api)
    appHandleRegister(backend, api)
    appHandleUserResetPass(backend, api)
    appHandleUserRegistered(backend, api)

    appHandleUserInfo(backend, protected)
    appHandleUserInfoAll(backend, protected)
    appHandleUserInfoOf(backend, protected)
    appHandleUserEdit(backend, protected)
    appHandleUserEditAdmin(backend, protected)
    appHandleUserDelAdmin(backend, protected)
    appHandleUserUploadImage(backend, protected)
    appHandleUserCount(backend, protected)
    appHandleRegisterAdmin(backend, protected)
    appHandleUserLogOut(backend, protected)
    appHandleUserLogOut(backend, cookieJWT)

    // EVENT STUFF
    appHandleEventInfoAll(backend, protected)
    appHandleEventInfoOf(backend, protected)
    appHandleEventNew(backend, protected)
    appHandleEventDel(backend, protected)
    appHandleEventEdit(backend, protected)
    appHandleEventUploadImage(backend, protected)
    appHandleEventCount(backend, protected)

    // MATERIAL STUFF
    appHandleMaterialNew(backend, protected)
    appHandleMaterialInfoOf(backend, protected)
    appHandleMaterialDel(backend, protected)
    appHandleMaterialEdit(backend, protected)

    // CERTIFICATE TEMPLATE STUFF
    appHandleCertificateRoom(backend, api)
    appHandleCertTempNew(backend, protected)
    appHandleCertTempInfoOf(backend, protected)
    appHandleCertDel(backend, protected)
    appHandleCertEdit(backend, protected)
    appHandleCertUploadTemplate(backend, protected)

    appHandleCertNewDumb(backend, protected)

    appHandleCertEditor(backend, cookieJWT)
    appHandleCertEditorUploadImage(backend, cookieJWT)
    appHandleCertEditorUploadHtml(backend , cookieJWT)

    appHandleCertEditor(backend, protected)
    appHandleCertEditorUploadImage(backend, protected)
    appHandleCertEditorUploadHtml(backend , protected)

    // EVENT PARTICIPANT STUFF
    appHandleEventParticipateRegister(backend, protected)
    appHandleEventParticipateInfoOf(backend, protected)
    appHandleEventParticipateEdit(backend, protected)
    appHandleEventParticipateDel(backend, protected)
    appHandleEventParticipateOfEvent(backend, protected)
    appHandleEventParticipateOfUser(backend, protected)
    appHandleEventParticipateAbsence(backend, protected)
    appHandleEventParticipateOfEventCount(backend, protected)
    appHandleEventParticipateAbsenceBulk(backend, protected)
    appHandleEventParticipateAbsenceItself(backend, protected)

    // OTP STUFF
    appHandleGenOTP(backend, api)
    appHandleCleanupOTP(backend, protected)

    app.Get("/", func(c *fiber.Ctx) error {
        return c.SendString("Server is running.")
    })
}
