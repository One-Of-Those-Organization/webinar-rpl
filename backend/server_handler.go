package main

import (
	"errors"
	"fmt"
	"log"
	"time"

	"webrpl/table"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

func appHandleRegister(backend *Backend, route fiber.Router) {
    route.Post("register", func(c *fiber.Ctx) error {
        var body struct {
            UserFullName  string `json:"name"`
            UserPassword  string `json:"pass"`
            UserEmail     string `json:"email"`
            UserInstance  string `json:"instance"`
            UserRole      int    `json:"role"`
            UserPicture   string `json:"picture"`
        }

        if err := c.BodyParser(&body); err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid request body.",
            })
        }

        if body.UserFullName == "" || body.UserPassword == "" || body.UserEmail == "" {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Name, password and email are required.",
            })
        }

        var existingUser table.User
        result := backend.db.Where("user_email = ?", body.UserEmail).First(&existingUser)
        if result.RowsAffected > 0 {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "User with this email already exists.",
            })
        }

        if result.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Cannot open DB.",
            })
        }

        hashedPassword, err := HashPassword(body.UserPassword)
        if err != nil {
            log.Printf("Password hashing error: %v", err)
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to process password.",
            })
        }

        newUser := table.User{
            UserFullName:   body.UserFullName,
            UserPassword:   hashedPassword,
            UserEmail:      body.UserEmail,
            UserInstance:   body.UserInstance,
            UserRole:       body.UserRole,
            UserPicture:    body.UserPicture,
            UserCreatedAt:  time.Now(),
        }

        if err := backend.db.Create(&newUser).Error; err != nil {
            log.Printf("Database error: %v", err)
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to create user.",
            })
        }

        sess, err := backend.store.Get(c)
        if err != nil {
            log.Printf("Session error: %v", err)
        } else {
            // Stuff that saved on the session
            sess.Set("userId", newUser.UserId)
            sess.Set("userEmail", newUser.UserEmail)
            sess.Set("userRole", newUser.UserRole)
            if err := sess.Save(); err != nil {
                log.Printf("Session save error: %v", err)
            }
        }

        return c.Status(fiber.StatusCreated).JSON(fiber.Map{
            "success":   true,
            "message":   "User registered successfully.",
            // "timestamp": time.Now().UTC().Format("2006-01-02 15:04:05"),
            "data":      newUser,
        })
    })
}

func appHandleLogin(backend *Backend, route fiber.Router) {
    route.Post("login", func(c *fiber.Ctx) error {
        var body struct {
            UserPassword  string `json:"pass"`
            UserEmail     string `json:"email"`
        }

        sess, err := backend.store.Get(c)
        if err == nil {
            if sess.Get("userId") != nil {
                return c.Status(fiber.StatusOK).JSON(fiber.Map{
                    "success": false,
                    "message": "Already logged in.",
                })
            }
        }

        if err := c.BodyParser(&body); err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid request body.",
            })
        }

        if body.UserPassword == "" || body.UserEmail == "" {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Password and email are required.",
            })
        }

        var existingUser table.User
        result := backend.db.Where("user_email = ?", body.UserEmail).First(&existingUser)
        if result.Error != nil {
            if errors.Is(result.Error, gorm.ErrRecordNotFound) {
                return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                    "success": false,
                    "message": "User doesn't exist.",
                })
            }
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Database error occurred.",
            })
        }

        validPass := CheckPassword(existingUser.UserPassword, body.UserPassword)
        if !validPass {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Error password incorrect.",
            })
        }

        if err != nil {
            log.Printf("Session error: %v", err)
        } else {
            // Session store all of this stuff
            sess.Set("userId", existingUser.UserId)
            sess.Set("userEmail", existingUser.UserEmail)
            sess.Set("userRole", existingUser.UserRole)
            if err := sess.Save(); err != nil {
                log.Printf("Session save error: %v", err)
            }
        }
        
        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "userId": existingUser.ID,
            "success": true,
            "message": fmt.Sprintf("%s", existingUser.UserFullName),
        })

    })
}

func appHandleLogout(backend *Backend, route fiber.Router) {
    route.Post("logout", func(c *fiber.Ctx) error {
        sess, err := backend.store.Get(c)
        if err != nil {
            return c.Status(fiber.StatusOK).JSON(fiber.Map{
                "success": false,
                "message": "Session error, Failed to logout.",
            })
        }

        userId := sess.Get("userId")
        if userId == nil {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "success": false,
                "message": "Not logged in.",
            })
        }

        error := sess.Destroy()
        if error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to destroy session.",
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "Successfully logged out.",
        })

    })
}

func appHandleGetUserInfo(backend *Backend, route fiber.Router) {
    route.Get("user", func(c *fiber.Ctx) error {
        sess, err := backend.store.Get(c)
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Session error.",
            })
        }

        userId := sess.Get("userId")
        if userId == nil {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "success": false,
                "message": "Not logged in.",
            })
        }

        var user table.User
        result := backend.db.First(&user, userId)
        if result.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Database error.",
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "data": user,
        })
    })
}

// TODO: Finish this
func appHandleCreateWebinar(backend *Backend, route fiber.Router) {
    route.Post("create-webinar", func (c *fiber.Ctx) error {
        sess, err := backend.store.Get(c)
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Session error.",
            })
        }
        userType := sess.Get("userRole")
        if userType != 1 {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "success": false,
                "message": "Not Authorized.",
            })
        }
        // Take the request body
        var body struct {
            EventDesc     string            `json:"desc"`
            EventName     string            `json:"name"`
            EventDStart   string            `json:"dstart"`
            EventDEnd     string            `json:"dend"`
            EventLink     string            `json:"link"`
            EventSpeaker  string            `json:"speaker"`
            EventAtt      table.AttTypeEnum `json:"att"`
            EventMat      []int             `json:"mat_id"`
            EventCertTemp int               `json:"certtemp_id"`
        }
        layout := "2006-01-02 15:04:05"
        realDateTime, err := time.Parse(layout, body.EventDStart)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Date time format not valid. Please use `2006-01-02 15:04:05`",
            })
        }
        realDateTime2, err := time.Parse(layout, body.EventDEnd)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Date time format not valid. Please use `2006-01-02 15:04:05`",
            })
        }
        var allEventMat []table.EventMaterial
        for _, id := range body.EventMat {
            var elm table.EventMaterial
            result := backend.db.Where("eventm_id = ?", id).First(elm)
            if result.Error != nil {
                if errors.Is(result.Error, gorm.ErrRecordNotFound) {
                    return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                        "success": false,
                        "message": "Event Material doesn't exist.",
                    })
                }
                return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                    "success": false,
                    "message": "Database error occurred.",
                })
            }
            allEventMat = append(allEventMat, elm)
        }

        var ElmCertTemplate []table.CertTemplate
        var elm table.CertTemplate
        result := backend.db.Where("cert_id = ?", body.EventCertTemp).First(elm)
        if result.Error != nil {
            if errors.Is(result.Error, gorm.ErrRecordNotFound) {
                return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                    "success": false,
                    "message": "Event Material doesn't exist.",
                })
            }
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Database error occurred.",
            })
        }
        ElmCertTemplate = append(ElmCertTemplate, elm)

        newEvent := table.Event {
            EventName: body.EventName,
            EventDesc: body.EventDesc,
            EventDStart: realDateTime,
            EventDEnd: realDateTime2,
            EventLink: body.EventLink,
            EventSpeaker: body.EventSpeaker,
            EventAtt: body.EventAtt,
            EventMaterials: allEventMat,
            CertTemplates: ElmCertTemplate,
        }

        // Acccess DB
        if err:= backend.db.Create(&newEvent).Error; err != nil {
            log.Printf("Database error: %v", err)
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to create event.",
            })
        }
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "success": true,
            "message": "Successfully created the event.",
        })
    })
}
