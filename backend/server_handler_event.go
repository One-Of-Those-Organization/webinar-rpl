package main

import (
    "strconv"
	"fmt"
	"time"
	"webrpl/table"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// POST : api/protected/event-register
func appHandleNewEvent(backend *Backend, route fiber.Router) {
    route.Post("event-register", func (c *fiber.Ctx) error {

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
            Desc          string    `json:"desc"`
            Name          string    `json:"name"`
            DStart        time.Time `json:"dstart"`
            DEnd          time.Time `json:"dend"`
            Link          string    `json:"link"`
            Speaker       string    `json:"speaker"`
            Att           string    `json:"att"`
            Img           string    `json:"img"`
            Max           int       `json:"max"`
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

        var Event table.Event
        res := backend.db.Where("event_dstart = ? ",body.DStart).First(&Event)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to fetch new event from db.",
                "error_code": 8,
                "data": nil,
            })
        }

        if res.RowsAffected > 0 {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Event with that Date is already exist",
                "error_code": 9,
                "data": nil,
            })
        }

        res = backend.db.Where("event_name = ? ", body.Name).First(&Event)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to fetch new event from db.",
                "error_code": 10,
                "data": nil,
            })
        }

        if res.RowsAffected > 0 {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Event with that name is already exist",
                "error_code": 11,
                "data": nil,
            })
        }

        newEvent := table.Event {
            EventDesc: body.Desc,
            EventName: body.Name,
            EventDStart: body.DStart,
            EventDEnd: body.DEnd,
            EventSpeaker: body.Speaker,
            EventAtt: table.AttTypeEnum(body.Att),
            EventImg: body.Img,
            EventMax: body.Max,
        }

        res = backend.db.Create(newEvent)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to create new event, %v", res.Error),
                "error_code": 12,
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "Successfully added the event",
            "error_code": 0,
            "data": nil,
        })
    })
}

// GET : api/event-info-all
func appHandleEventInfoAll(backend *Backend, route fiber.Router) {
    route.Get("event-info-all", func (c *fiber.Ctx) error {
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

        offsetQuery := c.Query("offset")
        if offsetQuery == "" {
            offsetQuery = "0";
        }

        limitQuery := c.Query("limit")
        if limitQuery == "" {
            limitQuery = "10000"
        }

        offset, err := strconv.Atoi(offsetQuery)
        if err != nil {
            offset = 0
        }
        limit, err := strconv.Atoi(limitQuery)
        if err != nil {
            limit = 10000
        }

        var eventData []table.Event
        res := backend.db.Offset(offset).Limit(limit).Find(&eventData)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to fetch user data from db.",
                "error_code": 2,
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "Check data.",
            "error_code": 0,
            "data": eventData,
        })
    })
}

// GET : api/event-info-of
func appHandleEventInfoOf(backend *Backend, route fiber.Router) {
    route.Get("event-info-of", func (c *fiber.Ctx) error {
        infoOf := c.Query("id")
        var event table.Event
        res := backend.db.Where("event_id = ?", infoOf).First(&event)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to fetch event data from db.",
                "error_code": 1,
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "Check data.",
            "error_code": 0,
            "data": event,
        })
    })
}
