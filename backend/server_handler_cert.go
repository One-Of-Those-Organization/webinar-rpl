package main

import (
    "strconv"
    "fmt"

    "webrpl/table"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// POST : api/protected/cert-register
func appHandleCertTempNew(backend *Backend, route fiber.Router) {
    route.Post("cert-register", func (c *fiber.Ctx) error {
        user := c.Locals("user").(*jwt.Token)
        if user == nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to claims JWT token.",
                "error_code": 1,
                "data": nil,
            })
        }

        claims := user.Claims.(jwt.MapClaims)
        isAdmin := claims["admin"].(float64)

        if isAdmin != 1 {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "success": false,
                "message": "Invalid credentials for this function",
                "error_code": 2,
                "data": nil,
            })
        }

        var body struct {
            EventId       int    `json:"id"`
            // CertTemplate is a html+css that will be autofilled. (this is path btw.)
            CertTemplate  string `json:"cert_temp"`
        }

        err := c.BodyParser(&body)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Invalid body request, %v", err),
                "error_code": 3,
                "data": nil,
            })
        }

        var event table.Event
        res := backend.db.Where("event_id = ?", body.EventId).First(&event)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to fetch event from db.",
                "error_code": 4,
                "data": nil,
            })
        }

        newCertTemplate := table.CertTemplate {
            EventId: body.EventId,
            CertTemplate: body.CertTemplate,
        }

        res = backend.db.Create(&newCertTemplate)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to create new event material, %v", res.Error),
                "error_code": 5,
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "New certificate template added.",
            "error_code": 0,
            "data": nil,
        })
    })
}

// GET : api/protected/cert-info-of
func appHandleCertTempInfoOf(backend *Backend, route fiber.Router) {
	route.Get("cert-info-of", func (c *fiber.Ctx) error {
        user := c.Locals("user").(*jwt.Token)
        if user == nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to claims JWT token.",
                "error_code": 1,
                "data": nil,
            })
        }

        claims := user.Claims.(jwt.MapClaims)
        email := claims["email"].(string)

        if email == "" {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid email on JWT.",
                "error_code": 2,
                "data": nil,
            })
        }

        infoOf := c.Query("id")

        if infoOf == "" {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid Query.",
                "error_code": 3,
                "data": nil,
            })
        }

        infoOfInt, err := strconv.Atoi(infoOf)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Invalid Query : %v", err),
                "error_code": 4,
                "data": nil,
            })
        }

        var certTemp table.CertTemplate
        res := backend.db.Where("id = ?", infoOfInt).First(&certTemp)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to fetch event material from db.",
                "error_code": 5,
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "Check data.",
            "error_code": 0,
            "data": certTemp,
        })
	})
}

// POST : api/protected/cert-del
func appHandleCertDel(backend *Backend, route fiber.Router) {
    route.Post("cert-del", func (c *fiber.Ctx) error {
        user := c.Locals("user").(*jwt.Token)
        if user == nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to claims JWT token.",
                "error_code": 1,
                "data": nil,
            })
        }

        claims := user.Claims.(jwt.MapClaims)
        isAdmin := claims["admin"].(float64)
        if isAdmin != 1 {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "success": false,
                "message": "Invalid credentials for this function",
                "error_code": 2,
                "data": nil,
            })
        }

        var body struct {
            CertTempID int `json:"id"`
        }

        err := c.BodyParser(&body)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Invalid body request, %v", err),
                "error_code": 3,
                "data": nil,
            })
        }

        res := backend.db.Delete(&table.CertTemplate{}, body.CertTempID)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to delete certificate template from the DB.",
                "error_code": 4,
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "Certificate Template deleted.",
            "data": nil,
            "error_code": 0,
        })
    })
}

// TODO : After done implementing webinar participant
// GET : api/protected/cert-gen
func appHandleCertGen(_ *Backend, route fiber.Router) {
    route.Get("cert-gen", func (c *fiber.Ctx) error {
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "success": false,
            "message": "WIP.",
            "error_code": 0,
            "data": nil,
        })
    })
}

// POST : api/protected/cert-edit
func appHandleCertEdit(backend *Backend, route fiber.Router) {
    route.Post("cert-edit", func (c *fiber.Ctx) error {
        user := c.Locals("user").(*jwt.Token)
        if user == nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Failed to claim JWT Token.",
                "error_code": 1,
                "data": nil,
            })
        }

        claims := user.Claims.(jwt.MapClaims)
        isAdmin := claims["admin"].(float64)

        if isAdmin != 1 {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "success": false,
                "message": "Invalid credentials for this function",
                "error_code": 2,
                "data": nil,
            })
        }

        var body struct {
            CertTempID int    `json:"id"`
            NewPath    string `json:"cert_path"`
        }

        err := c.BodyParser(&body)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Invalid body request, %v", err),
                "error_code": 3,
                "data": nil,
            })
        }

        certTemp := table.CertTemplate{}
        result := backend.db.First(&certTemp, body.CertTempID)
		if result.Error != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"message": fmt.Sprintf("Certificate Template not found with ID: %d", body.CertTempID),
				"error_code": 4,
				"data": nil,
			})
		}

        if body.NewPath == "" {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": "Empty path is not allowed.",
				"error_code": 5,
				"data": nil,
			})
        }

        certTemp.CertTemplate = body.NewPath
		result = backend.db.Save(&certTemp)
        if result.Error != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": fmt.Sprintf("Failed to update certificate template: %v", result.Error),
				"error_code": 6,
				"data": nil,
			})
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "Certificate Template edited.",
            "data": nil,
            "error_code": 0,
        })
    })
}
