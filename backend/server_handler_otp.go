package main

import (
    "fmt"
    "errors"
	"webrpl/table"
    "regexp"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// NOTE: Gen otp for the inserted email
// GET : api/gen-otp-for-register
func appHandleGenOTP(backend *Backend, route fiber.Router) {
    route.Get("gen-otp-for-register", func (c *fiber.Ctx) error {
        email := c.Query("email")
        emailRegex := `^[a-zA-Z0-9.!#$%&'*+/=?^_` + "`" + `{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$`
        re := regexp.MustCompile(emailRegex)

        if email == "" || !re.MatchString(email) {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid email.",
                "error_code": 1,
                "data": nil,
            })
        }

        // Check if the user with that email exist
        sqlError := backend.db.Where("user_email = ?", email).First(&table.User{}).Error
        if sqlError != nil {
            if !errors.Is(sqlError, gorm.ErrRecordNotFound) {
                return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                    "success": false,
                    "message": fmt.Sprintf("Something wrong when trying to fetch from the db, %v", sqlError),
                    "error_code": 2,
                    "data": nil,
                })
            }
        }

        newOTP, err := createOTPCode(backend, 4, email)
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to create the OTP code, %v", err),
                "error_code": 3,
                "data": nil,
            })
        }

        fmt.Printf(" -###- The Generated OTP code are : %s -###-\n", newOTP.OtpCode)
        if !sendEmailTo(backend, newOTP.UserEmail, "OTP code for webrpl", fmt.Sprintf("Your OTP code are : %s\n(Working for 5 mins)", newOTP.OtpCode)) {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Failed to send email.",
                "error_code": 4,
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "Generated the OTP please check console or email.",
            "error_code": 0,
            "data": nil,
        })
    })
}

// POST : api/protected/cleanup-otp-code
func appHandleCleanupOTP(backend *Backend, route fiber.Router) {
    route.Post("cleanup-otp-code", func (c *fiber.Ctx) error {
        claims, err := GetJWT(c)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid JWT Token.",
                "error_code": 1,
                "data": nil,
            })
        }

        admin := claims["admin"].(float64)
        if admin != 1 {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid Credentials.",
                "error_code": 2,
                "data": nil,
            })
        }

        CleanupOTPTable(backend)
        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "Unused OTP code cleaned up.",
            "error_code": 0,
            "data": nil,
        })
    })
}
