package main

import (
    "fmt"
    "time"
    "github.com/golang-jwt/jwt/v5"
    "github.com/gofiber/fiber/v2"
    "webrpl/table"
)


func appHandleLogin(backend *Backend, route fiber.Router) {
    route.Post("login", func (c *fiber.Ctx) error {
        var body struct {
            UserPassword  string `json:"pass"`
            UserEmail     string `json:"email"`
        }

        err := c.BodyParser(&body)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Invalid request body, %v", err),
                "data": nil,
            })
        }

        if len(body.UserEmail) <= 0 || len(body.UserPassword) <= 0 {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Invalid email and password, %v", err),
                "data": nil,
            })
        }

        var user table.User;
        res := backend.db.Where("user_email = ?", body.UserEmail).First(&user)

        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("There is a problem in the db, %v", res.Error),
                "data": nil,
            })
        }

        validPass := CheckPassword(user.UserPassword, body.UserPassword)
        if !validPass {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Wrong password",
                "data": nil,
            })
        }

        claims := jwt.MapClaims{
            "email":  user.UserEmail,
            "admin": user.UserRole,
            "exp":   time.Now().Add(time.Hour * 72).Unix(),
        }

        token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

        t, err := token.SignedString([]byte(backend.pass))
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to generate JWT, %v", err),
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "successfully logged in.",
            "data": nil,
            "token": t,
        })
    })

}

func appHandleUserInfo(backend *Backend, route fiber.Router) {
    route.Get("user-info", func (c *fiber.Ctx) error {

        user := c.Locals("user").(*jwt.Token)
        if user != nil {
            claims := user.Claims.(jwt.MapClaims)
            email := claims["email"].(string)

            var userData table.User

            res := backend.db.Where("user_email = ?", email).First(&userData)
            if res.Error != nil {
                return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                    "success": false,
                    "message": "Failed to fetch user data from db.",
                    "data": nil,
                })
            }

            return c.Status(fiber.StatusOK).JSON(fiber.Map{
                "success": true,
                "message": "Success",
                "data": userData,
            })
        } else {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Failed to claims JWT token.",
                "data": nil,
            })
        }
    })
}
