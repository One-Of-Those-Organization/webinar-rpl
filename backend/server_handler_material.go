package main

import (
    "fmt"
    "strconv"
    "webrpl/table"

    "github.com/gofiber/fiber/v2"
)

// POST : api/protected/material-register
func appHandleMaterialNew(backend *Backend, route fiber.Router) {
    route.Post("material-register", func (c *fiber.Ctx) error {
        claims, err := GetJWT(c)
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Invalid JWT Token.",
                "error_code": 1,
                "data": nil,
            })
        }

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
            EventId      int    `json:"id"`
            EventAttach  string `json:"event_attach"`
        }

        err = c.BodyParser(&body)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Invalid body request, %v", err),
                "error_code": 3,
                "data": nil,
            })
        }

        var event table.Event
        res := backend.db.Where("id = ?", body.EventId).First(&event)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to fetch event from db.",
                "error_code": 4,
                "data": nil,
            })
        }

        newMaterial := table.EventMaterial {
            EventId: body.EventId,
            EventMatAttachment: body.EventAttach,
        }

        res = backend.db.Create(&newMaterial)
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
            "message": "New material added.",
            "error_code": 0,
            "data": nil,
        })
    })
}

// GET : api/protected/material-info-of
func appHandleMaterialInfoOf(backend *Backend, route fiber.Router) {
    route.Get("material-info-of", func (c *fiber.Ctx) error {
        claims, err := GetJWT(c)
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Invalid JWT Token.",
                "error_code": 1,
                "data": nil,
            })
        }

        email := claims["email"].(string)

        if email == "" {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid email on JWT.",
                "error_code": 2,
                "data": nil,
            })
        }

        infoOf := c.Query("event_id")
        var infoOfInt int

        if infoOf == "" {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid Query.",
                "error_code": 3,
                "data": nil,
            })
        }

        infoOfInt, err = strconv.Atoi(infoOf)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Invalid Query : %v", err),
                "error_code": 4,
                "data": nil,
            })
        }

        var eventMat table.EventMaterial
        res := backend.db.Where("event_id = ?", infoOfInt).First(&eventMat)
        if res.Error != nil {
            return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
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
            "data": eventMat,
        })
    })
}

// POST : api/protected/material-del
func appHandleMaterialDel(backend *Backend, route fiber.Router) {
    route.Post("material-del", func (c *fiber.Ctx) error {
        claims, err := GetJWT(c)
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Invalid JWT Token.",
                "error_code": 1,
                "data": nil,
            })
        }

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
            EventMatId int `json:"id"`
        }

        err = c.BodyParser(&body)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Invalid body request, %v", err),
                "error_code": 3,
                "data": nil,
            })
        }

        res := backend.db.Delete(&table.EventMaterial{}, body.EventMatId)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to delete event material from the DB.",
                "error_code": 4,
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "Event Material deleted.",
            "error_code": 0,
            "data": nil,
        })
    })
}

// POST : api/protected/material-edit
func appHandleMaterialEdit(backend *Backend, route fiber.Router) {
    route.Post("material-edit", func (c *fiber.Ctx) error {
        claims, err := GetJWT(c)
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Invalid JWT Token.",
                "error_code": 1,
                "data": nil,
            })
        }

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
            Id           int     `json:"id"`
            EventId      *int    `json:"event_id"`
            EventAttach  *string `json:"event_attach"`
        }

        err = c.BodyParser(&body)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Invalid body request, %v", err),
                "error_code": 3,
                "data": nil,
            })
        }

        eventMaterial := table.EventMaterial{}
        result := backend.db.First(&eventMaterial, body.Id)
        if result.Error != nil {
            return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Event Material not found with ID: %d", body.EventId),
                "error_code": 4,
                "data": nil,
            })
        }
        if body.EventId != nil {
            eventMaterial.EventId = *body.EventId
        }

        if body.EventAttach != nil {
            eventMaterial.EventMatAttachment = *body.EventAttach
        }

        result = backend.db.Save(&eventMaterial)
        if result.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to update event: %v", result.Error),
                "error_code": 5,
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "Event Material Data saved.",
            "error_code": 0,
            "data": nil,
        })
    })
}
