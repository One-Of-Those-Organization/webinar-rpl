package main

import (
    "fmt"
    "errors"
	"webrpl/table"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// NOTE: Gen otp for the inserted email
// GET : api/gen-otp-for-register
func appHandleGenOTP(backend *Backend, route fiber.Router) {
    route.Get("gen-otp-for-register", func (c *fiber.Ctx) error {
        email := c.Query("email")
        if email == "" {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid email.",
                "error_code": 1,
                "data": nil,
            })
        }

        // Check if the user with that email exist
        var userObj table.User
        res := backend.db.Where("user_email = ?", email).First(&userObj)
        if res.Error != nil {
            if !errors.Is(res.Error, gorm.ErrRecordNotFound) {
                return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                    "success": false,
                    "message": fmt.Sprintf("Something wrong when trying to fetch from the db, %v", res.Error),
                    "error_code": 2,
                    "data": nil,
                })
            }
        }

        newOTP, err := createOTPCode(backend, 4, userObj.ID)
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to create the OTP code, %v", err),
                "error_code": 3,
                "data": nil,
            })
        }

        fmt.Printf(" -###- The Generated OTP code are : %s -###-\n", newOTP.OtpCode)

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "Generated the OTP please check console or email.",
            "error_code": 0,
            "data": nil,
        })
    })
}
