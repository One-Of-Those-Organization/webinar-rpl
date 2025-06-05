package main

import (
    "strconv"
	"fmt"
	"webrpl/table"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// POST : api/protected/event-participate-register
func appHandleEventParticipateRegister(backend *Backend, route fiber.Router) {
    route.Post("event-participate-register", func (c *fiber.Ctx) error {
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
        admin := claims["admin"].(float64)
        email := claims["email"].(string)

        if email == "" {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid email on JWT.",
                "error_code": 2,
                "data": nil,
            })
        }

        var body struct {
            EventId int    `json:"id"`
            Role    string `json:"role"`
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

        if admin != 1 && body.Role == "comittee" {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "success": false,
                "message": "Invalid Credentials.",
                "error_code": 4,
                "data": nil,
            })
        }

        if body.Role != "normal" && body.Role != "comittee" {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "success": false,
                "message": "Invalid Role, the only valid strings are : `normal` and `comittee`",
                "error_code": 5,
                "data": nil,
            })
        }

        var event table.Event
        res := backend.db.Where("id = ?", body.EventId).First(&event)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to fetch event from db.",
                "error_code": 6,
                "data": nil,
            })
        }

        var currentUser table.User
        res = backend.db.Where("email = ?", email).First(&currentUser)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to fetch the specified user from db.",
                "error_code": 7,
                "data": nil,
            })
        }

        random_strings := RandStringBytes(10, backend.rand)

        NewEventParticipate := table.EventParticipant{
            EventId: body.EventId,
            UserId: currentUser.ID,
            EventPRole: table.UserEventRoleEnum(body.Role),
            EventPCome: false,
            EventPCode: random_strings,
        }

        res = backend.db.Create(&NewEventParticipate)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to create new event participant, %v", res.Error),
                "error_code": 8,
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "New Event EventParticipant created.",
            "error_code": 0,
            "data": nil,
        })
    })
}

// WIP
// GET : api/protected/event-participate-info-of
func appHandleEventParticipateInfoOf(backend *Backend, route fiber.Router) {
    route.Get("event-participate-info-of", func (c *fiber.Ctx) error {
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
        email := claims["email"].(string)

        if email == "" {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid email on JWT.",
                "error_code": 2,
                "data": nil,
            })
        }

        idQuery := c.Query("event_id")
        if idQuery == "" {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid event id supplied.",
                "error_code": 3,
                "data": nil,
            })
        }
        idQueryInt, err := strconv.Atoi(idQuery)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid event id supplied.",
                "error_code": 3,
                "data": nil,
            })
        }

        var currentUser table.User
        res := backend.db.Where("email = ?", email).First(&currentUser)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Should be unreachable but here we are, %v", res.Error),
                "error_code": 4,
                "data": nil,
            })
        }

        var evPart table.EventParticipant
        res = backend.db.Where(&table.EventParticipant{
            EventId: idQueryInt,
            UserId: currentUser.ID,
        }).First(&evPart)

        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to fetch the event participant with that id, %v", res.Error),
                "error_code": 5,
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "WIP",
            "error_code": 0,
            "data": evPart,
        })
    })
}
