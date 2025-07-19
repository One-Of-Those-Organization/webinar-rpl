package main

// NOTE: Maybe need to change it to not check the jwt so not logged in people can get the webinar?

import (
	"encoding/base64"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
	"webrpl/table"

	"github.com/gofiber/fiber/v2"
)

// POST : api/protected/event-register
func appHandleEventNew(backend *Backend, route fiber.Router) {
    route.Post("event-register", func (c *fiber.Ctx) error {

        claims, err := GetJWT(c)
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Invalid JWT token.",
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

        err = c.BodyParser(&body)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Invalid body request, %v", err),
                "error_code": 3,
                "data": nil,
            })
        }

        var Event table.Event
        res := backend.db.Where("event_name = ? ", body.Name).First(&Event)
        if res.RowsAffected > 0 {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Event with that name is already exist",
                "error_code": 4,
                "data": nil,
            })
        }

        now := time.Now()
        if body.DStart.Before(now) || body.DEnd.Before(body.DStart) {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Failed to edit event because invalid date.",
				"error_code": 8,
				"data": nil,
			})
        }

        if body.Max <= 0 {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Event with max of <= 0 is not possible",
                "error_code": 7,
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
            EventLink: body.Link,
        }

        if newEvent.EventDesc == "" || newEvent.EventName == "" || newEvent.EventSpeaker == "" {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Empty desc, name, speaker field is not allowed.",
                "error_code": 5,
                "data": nil,
            })
        }

        res = backend.db.Create(&newEvent)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to create new event, %v", res.Error),
                "error_code": 6,
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

// NOTE: Will not auto join and give you the foreign obj.
//       if need the count please call event-participate-of-event-count
// GET : api/protected/event-info-all
func appHandleEventInfoAll(backend *Backend, route fiber.Router) {
    route.Get("event-info-all", func (c *fiber.Ctx) error {
        claims, err := GetJWT(c)
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Invalid JWT token.",
                "error_code": 1,
                "data": nil,
            })
        }

        email := claims["email"].(string)
        if email == "" {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "success": false,
                "message": "Not logged in.",
                "error_code": 2,
                "data": nil,
            })
        }

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
        res := backend.db.Offset(offset).Limit(limit).Order("event_dstart DESC").Order("event_name ASC").Find(&eventData)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to fetch user data from db.",
                "error_code": 3,
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

// NOTE: Will not auto join and give you the foreign obj.
// GET : api/protected/event-info-of
func appHandleEventInfoOf(backend *Backend, route fiber.Router) {
    route.Get("event-info-of", func (c *fiber.Ctx) error {
        claims, err := GetJWT(c)
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Invalid JWT token.",
                "error_code": 1,
                "data": nil,
            })
        }

        email := claims["email"].(string)
        if email == "" {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "success": false,
                "message": "Invalid email on JWT.",
                "error_code": 2,
                "data": nil,
            })
        }

        infoOf := c.Query("id")

        infoOfInt, err := strconv.Atoi(infoOf)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Invalid Query : %v", err),
                "error_code": 3,
                "data": nil,
            })
        }

        var event table.Event
        res := backend.db.Where("id = ?", infoOfInt).First(&event)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to fetch event data from db.",
                "error_code": 4,
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

// POST : api/protected/event-del
func appHandleEventDel(backend *Backend, route fiber.Router) {
    route.Post("event-del", func (c *fiber.Ctx) error {
        claims, err := GetJWT(c)
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Invalid JWT token.",
                "error_code": 1,
                "data": nil,
            })
        }
        admin := claims["admin"].(float64)
        if admin != 1 {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "success": false,
                "message": "Invalid credentials to acces this api.",
                "error_code": 2,
                "data": nil,
            })
        }

        var body struct {
            EventId int `json:"id"`
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
        res := backend.db.Delete(&table.Event{}, body.EventId)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to delete event from the DB.",
                "error_code": 4,
                "data": nil,
            })
        }
        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "Check data.",
            "error_code": 0,
            "data": nil,
        })
    })
}

// POST : api/protected/event-edit
func appHandleEventEdit(backend *Backend, route fiber.Router) {
	route.Post("event-edit", func (c *fiber.Ctx) error {
        claims, err := GetJWT(c)
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Invalid JWT token.",
                "error_code": 1,
                "data": nil,
            })
        }

        isAdmin := claims["admin"].(float64)
		email := claims["email"].(string)

        var body struct {
			EventId       int       `json:"id"`
            Desc          *string    `json:"desc"`
            Name          *string    `json:"name"`
            DStart        *time.Time `json:"dstart"`
            DEnd          *time.Time `json:"dend"`
            Link          *string    `json:"link"`
            Speaker       *string    `json:"speaker"`
            Att           *string    `json:"att"`
            Img           *string    `json:"img"`
            Max           *int       `json:"max"`
            EventMat      *int       `json:"event_mat_id"`
            CertTemplate  *int       `json:"cert_template_id"`
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

		event := table.Event{}
		result := backend.db.First(&event, body.EventId)
		if result.Error != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": fmt.Sprintf("Event not found with ID: %d", body.EventId),
				"error_code": 4,
				"data": nil,
			})
		}

        if isAdmin != 1 {
			var selUser table.User
			res := backend.db.Where("user_email = ?", email).First(&selUser)
			if res.Error != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"success": false,
					"message": "Failed to fetch the event participant of this user.",
					"error_code": 8,
					"data": nil,
				})
			}

			var evPart table.EventParticipant
			res = backend.db.Where("event_id = ? AND user_id = ?", body.EventId, selUser.ID).First(&evPart)
			if res.Error != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"success": false,
					"message": "Failed to fetch the event participant of this user.",
					"error_code": 9,
					"data": nil,
				})
			}
			if evPart.EventPRole != "committee" {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"success": false,
					"message": "Invalid credentials for this function",
					"error_code": 2,
					"data": nil,
				})
			}
        }

		if body.Desc != nil {
			event.EventDesc = *body.Desc
		}
		if body.Name != nil {
			event.EventName = *body.Name
		}
		if body.DStart != nil {
			event.EventDStart = *body.DStart
		}
		if body.DEnd != nil {
			event.EventDEnd = *body.DEnd
		}
		if body.Link != nil {
			event.EventLink = *body.Link
		}
		if body.Speaker != nil {
			event.EventSpeaker = *body.Speaker
		}
		if body.Att != nil {
			event.EventAtt = table.AttTypeEnum(*body.Att)
		}
		if body.Img != nil {
			event.EventImg = *body.Img
		}
		if body.Max != nil {
			event.EventMax = *body.Max
		}
        if body.CertTemplate != nil {
            var cert_temp table.CertTemplate
            res := backend.db.Where("id = ?", *body.CertTemplate).First(&cert_temp)
            if res.Error != nil {
                return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                    "success": false,
                    "message": fmt.Sprintf("Failed to fetch cert template with that id : %v", res.Error),
                    "error_code": 5,
                    "data": nil,
                })
            }
            event.CertTemplates = make([]table.CertTemplate, 1)
            event.CertTemplates = append(event.CertTemplates, cert_temp)
        }
        if body.EventMat != nil {
            var mat table.EventMaterial
            res := backend.db.Where("eventm_id = ?", *body.EventMat).First(&mat)
            if res.Error != nil {
                return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                    "success": false,
                    "message": fmt.Sprintf("Failed to fetch event material with that id : %v", res.Error),
                    "error_code": 6,
                    "data": nil,
                })
            }
            event.EventMaterials = make([]table.EventMaterial, 1)
            event.EventMaterials = append(event.EventMaterials, mat)
        }

        now := time.Now()
        if body.DStart.Before(now) || body.DEnd.Before(*body.DStart) {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Failed to edit event because invalid date.",
				"error_code": 8,
				"data": nil,
			})
        }

		result = backend.db.Save(&event)
		if result.Error != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": fmt.Sprintf("Failed to update event: %v", result.Error),
				"error_code": 7,
				"data": nil,
			})
		}

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "Event edited successfully.",
            "error_code": 0,
            "data": nil,
        })
	})
}

// POST: api/protected/event-upload-image
func appHandleEventUploadImage(backend *Backend, route fiber.Router) {
    route.Post("event-upload-image", func(c *fiber.Ctx) error {
        var body struct {
            Data    string `json:"data"`
        }

        claims, err := GetJWT(c)
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Invalid JWT token.",
                "error_code": 1,
                "data": nil,
            })
        }

        admin := claims["admin"].(float64)

        if admin != 1 {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid credentials for this function",
                "error_code": 2,
                "data": nil,
            })
        }

        err = c.BodyParser(&body)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid Body Request",
                "error_code": 3,
                "data": nil,
            })
        }

        if body.Data == "" {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "No image data provided",
                "error_code": 4,
                "data": nil,
            })
        }

        imgDir := "static"
        if err := os.MkdirAll(imgDir, 0755); err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to create image directory",
                "error_code": 5,
                "data": nil,
            })
        }

        // Check if the string contains the base64 prefix and remove if present
        base64Data := body.Data
        if i := strings.Index(base64Data, ","); i != -1 {
            base64Data = base64Data[i+1:]
        }

        imageData, err := base64.StdEncoding.DecodeString(base64Data)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid base64 image data",
                "error_code": 6,
                "data": nil,
            })
        }

        var fileExt string
        if strings.Contains(body.Data, "image/png") {
            fileExt = ".png"
        } else if strings.Contains(body.Data, "image/gif") {
            fileExt = ".gif"
        } else if strings.Contains(body.Data, "image/jpg") {
            fileExt = ".jpg"
        } else if strings.Contains(body.Data, "image/webp") {
            fileExt = ".webp"
        }

        filename := fmt.Sprintf("%s/%d%s", imgDir, time.Now().Unix(), fileExt)

        err = os.WriteFile(filename, imageData, 0644)
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to save image",
                "error_code": 7,
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "Image uploaded successfully",
            "error_code": 0,
            "data": fiber.Map{
                "filename": fmt.Sprintf("%s://%s/%s", backend.mode, backend.address, filename),
            },
        })
    })
}

// GET : api/protected/event-count
func appHandleEventCount(backend *Backend, route fiber.Router) {
    route.Get("event-count", func (c *fiber.Ctx) error {
        claims, err := GetJWT(c)
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Invalid JWT token.",
                "error_code": 1,
                "data": nil,
            })
        }

        email := claims["email"].(string)
        if email == "" {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "success": false,
                "message": "Not logged in.",
                "error_code": 2,
                "data": nil,
            })
        }

        var count int64
        res := backend.db.Model(&table.Event{}).Count(&count)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to count events from db.",
                "error_code": 3,
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "Event count fetched successfully.",
            "error_code": 0,
            "data": count,
        })
    })
}
