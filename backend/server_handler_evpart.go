package main

import (
    "strconv"
	"fmt"
	"webrpl/table"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// NOTE : if not supplied with `email` on the json it will presume to use
//        the current active user on JWT that will participate.

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
            EventId         int     `json:"id"`
            Role            string  `json:"role"`
            CustomUserEmail *string `json:"email"`
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

        // TODO: check if the event max is full then dont allow to register.
        var eventParticipantCount int64
        res = backend.db.Model(&table.EventParticipant{}).Where("event_id = ?", body.EventId).Count(&eventParticipantCount)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to fetch event count from db.",
                "error_code": 7,
                "data": nil,
            })
        }

        if event.EventMax <= int(eventParticipantCount) + 1 {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Event is already full.",
                "error_code": 8,
                "data": nil,
            })
        }

        useThisEmail := email
        if body.CustomUserEmail != nil && *body.CustomUserEmail == "" {
            useThisEmail = *body.CustomUserEmail
        }

        var currentUser table.User
        res = backend.db.Where("email = ?", useThisEmail).First(&currentUser)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to fetch the specified user from db.",
                "error_code": 9,
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
                "error_code": 10,
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
            "message": "Check data.",
            "error_code": 0,
            "data": evPart,
        })
    })
}

// NOTE: Maybe will not be used
// POST : api/protected/event-participate-del
func appHandleEventParticipateDel(backend *Backend, route fiber.Router) {
    route.Post("event-participate-del", func (c *fiber.Ctx) error {
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
            EventID    int    `json:"event_id"`
            UserEmail  string `json:"email"`
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

        var currentUser table.User
        res := backend.db.Where("user_email = ?", body.UserEmail).First(&currentUser)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to fetch the current user from the db, %v", res.Error),
                "error_code": 4,
                "data": nil,
            })
        }

        res = backend.db.Where("user_id = ?", currentUser.ID).Where("event_id = ?", body.EventID).Delete(&table.EventParticipant{})
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to delete the event participant with that id from the db, %v", res.Error),
                "error_code": 5,
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "event participant deleted.",
            "error_code": 0,
            "data": nil,
        })
    })
}

// NOTE: Only allowed to change EventPRole only
// POST : api/protected/event-participate-edit
func appHandleEventParticipateEdit(backend *Backend, route fiber.Router) {
    route.Post("event-participate-edit", func (c *fiber.Ctx) error {
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
        email := claims["email"].(string)

        if isAdmin != 1 {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "success": false,
                "message": "Invalid credentials for this function",
                "error_code": 2,
                "data": nil,
            })
        }

        var body struct {
            EventID    int     `json:"event_id"`
            EventPRole string  `json:"event_role"`
            UserEmail  *string `json:"email"`
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

        useThisEmail := email
        if body.UserEmail != nil && *body.UserEmail != "" {
            useThisEmail = *body.UserEmail
        }

        var currentUser table.User
        res := backend.db.Where("user_email = ?", useThisEmail).First(&currentUser)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to fetch the current user from the db, %v", res.Error),
                "error_code": 4,
                "data": nil,
            })
        }

        eventPart := table.EventParticipant{}
        res = backend.db.Where("event_id = ?", body.EventID).Where("user_id = ?", currentUser.ID).First(&eventPart)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to get the event participant from the db, %v", res.Error),
                "error_code": 5,
                "data": nil,
            })
        }

        if body.EventPRole == "comittee" || body.EventPRole == "normal" {
            eventPart.EventPRole = table.UserEventRoleEnum(body.EventPRole)
        } else {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid Role.",
                "error_code": 6,
                "data": nil,
            })
        }

		res = backend.db.Save(&eventPart)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to update the event participant from the db, %v", res.Error),
                "error_code": 7,
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "Data changed.",
            "error_code": 0,
            "data": nil,
        })
    })
}

