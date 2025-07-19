package main

import (
    "strconv"
    "fmt"
    "webrpl/table"
    "errors"

    "gorm.io/gorm"
    "github.com/gofiber/fiber/v2"
)

// NOTE : if not supplied with `email` on the json it will presume to use
//        the current active user on JWT that will participate.

// POST : api/protected/event-participate-register
func appHandleEventParticipateRegister(backend *Backend, route fiber.Router) {
    route.Post("event-participate-register", func (c *fiber.Ctx) error {
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

        err = c.BodyParser(&body)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Invalid body request, %v", err),
                "error_code": 3,
                "data": nil,
            })
        }

        if admin != 1 && body.Role == "committee" {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "success": false,
                "message": "Invalid Credentials.",
                "error_code": 4,
                "data": nil,
            })
        }

        if body.Role != "normal" && body.Role != "committee" {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "success": false,
                "message": "Invalid Role, the only valid strings are : `normal` and `committee`",
                "error_code": 5,
                "data": nil,
            })
        }

        var event table.Event
        res := backend.db.Where("id = ?", body.EventId).First(&event)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to fetch event from db, %v", res.Error),
                "error_code": 6,
                "data": nil,
            })
        }

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
        if admin == 1 && body.CustomUserEmail != nil && *body.CustomUserEmail != "" {
            useThisEmail = *body.CustomUserEmail
        }

        var currentUser table.User
        res = backend.db.Where("user_email = ?", useThisEmail).First(&currentUser)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to fetch the specified user from db, %v", res.Error),
                "error_code": 9,
                "data": nil,
            })
        }

        var exists bool
        err = backend.db.Model(&table.EventParticipant{}).
        Select("count(*) > 0").
        Where("user_id = ? AND event_id = ?", currentUser.ID, body.EventId).
        Find(&exists).
        Error
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Event participant with the event_id : %d, and user_id : %d doesnt exist, %v", body.EventId, currentUser.ID, res.Error),
                "error_code": 11,
                "data": nil,
            })
        }
        if exists {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Failed to register this user again.",
                "error_code": 12,
                "data": nil,
            })
        }

        var Absence = false
        if body.Role == "committee" {
            Absence = true
        }
        random_strings := RandStringBytes(backend, fmt.Sprintf("%s-%d-%d-%d", currentUser.UserEmail, body.EventId, backend.rand.Int(), backend.rand.Int()))

        NewEventParticipate := table.EventParticipant{
            EventId: body.EventId,
            UserId: currentUser.ID,
            EventPRole: table.UserEventRoleEnum(body.Role),
            EventPCome: Absence,
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
        claims, err := GetJWT(c)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid JWT Token.",
                "error_code": 1,
                "data": nil,
            })
        }
        email := claims["email"].(string)
        admin := claims["admin"].(float64)

        if email == "" {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid email on JWT.",
                "error_code": 2,
                "data": nil,
            })
        }

        emailQuery := c.Query("email")
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

        useThisEmail := email
        if admin == 1 && emailQuery != "" {
            useThisEmail = emailQuery
        }

        var currentUser table.User
        res := backend.db.Where("user_email = ?", useThisEmail).First(&currentUser)
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
        claims, err := GetJWT(c)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid JWT Token.",
                "error_code": 1,
                "data": nil,
            })
        }

        isAdmin := claims["admin"].(float64)

        var body struct {
            EventID    int    `json:"event_id"`
            UserEmail  string `json:"email"`
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

        var selEvPart table.EventParticipant
        res = backend.db.Where("user_id = ? AND event_id = ?", currentUser.ID, body.EventID).First(&selEvPart)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to fetch the event participant with that id from the db, %v", res.Error),
                "error_code": 6,
                "data": nil,
            })
        }

        if isAdmin != 1 && selEvPart.EventPRole != "committee" {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "success": false,
                "message": "Invalid credentials for this function",
                "error_code": 2,
                "data": nil,
            })
        }

        res = backend.db.Delete(&table.EventParticipant{}, &selEvPart)
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
        currentUserEmail := claims["email"].(string)

        var body struct {
            EventID    int     `json:"event_id"`
            EventPRole string  `json:"event_role"`
            UserEmail  *string `json:"email"`
        }

        err = c.BodyParser(&body)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Invalid body request, %v", err),
                "error_code": 2,
                "data": nil,
            })
        }

        // Validate the role value
        if body.EventPRole != "committee" && body.EventPRole != "normal" {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid Role. Must be 'committee' or 'normal'.",
                "error_code": 5,
                "data": nil,
            })
        }

        // Determine target user email
        targetUserEmail := currentUserEmail
        if body.UserEmail != nil && *body.UserEmail != "" {
            targetUserEmail = *body.UserEmail
        }

        // Check authorization: Only admins or committee members can edit roles
        if admin != 1 {
            // Check if current user is committee for this event
            var currentEventParticipant table.EventParticipant
            res := backend.db.Where("user_email = ? AND event_id = ?", currentUserEmail, body.EventID).First(&currentEventParticipant)
            if res.Error != nil {
                if errors.Is(res.Error, gorm.ErrRecordNotFound) {
                    return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
                        "success": false,
                        "message": "You are not a participant of this event.",
                        "error_code": 4,
                        "data": nil,
                    })
                }
                return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                    "success": false,
                    "message": fmt.Sprintf("Failed to fetch current user participation, %v", res.Error),
                    "error_code": 3,
                    "data": nil,
                })
            }

            if currentEventParticipant.EventPRole != "committee" {
                return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
                    "success": false,
                    "message": "Only committee members and admins can edit participant roles.",
                    "error_code": 4,
                    "data": nil,
                })
            }

            // Prevent committee members from editing their own role (security measure)
            if targetUserEmail == currentUserEmail {
                return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
                    "success": false,
                    "message": "Committee members cannot modify their own role.",
                    "error_code": 7,
                    "data": nil,
                })
            }
        }

        // Find target user
        var targetUser table.User
        res := backend.db.Where("user_email = ?", targetUserEmail).First(&targetUser)
        if res.Error != nil {
            if errors.Is(res.Error, gorm.ErrRecordNotFound) {
                return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
                    "success": false,
                    "message": "Target user not found.",
                    "error_code": 8,
                    "data": nil,
                })
            }
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to fetch target user, %v", res.Error),
                "error_code": 3,
                "data": nil,
            })
        }

        // Find and update event participant
        var eventParticipant table.EventParticipant
        res = backend.db.Where("event_id = ? AND user_id = ?", body.EventID, targetUser.ID).First(&eventParticipant)
        if res.Error != nil {
            if errors.Is(res.Error, gorm.ErrRecordNotFound) {
                return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
                    "success": false,
                    "message": "Event participant not found.",
                    "error_code": 9,
                    "data": nil,
                })
            }
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to fetch event participant, %v", res.Error),
                "error_code": 3,
                "data": nil,
            })
        }

        // Update the role
        eventParticipant.EventPRole = table.UserEventRoleEnum(body.EventPRole)

        res = backend.db.Save(&eventParticipant)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to update event participant, %v", res.Error),
                "error_code": 6,
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "Participant role updated successfully.",
            "error_code": 0,
            "data": fiber.Map{
                "event_id": body.EventID,
                "user_email": targetUserEmail,
                "new_role": body.EventPRole,
            },
        })
    })
}

// NOTE: just return the participant of the specified event id
// GET : api/protected/event-participate-of-event
func appHandleEventParticipateOfEvent(backend *Backend, route fiber.Router) {
    route.Get("event-participate-of-event", func (c *fiber.Ctx) error {
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

        queryEventID := c.Query("event_id")
        queryEventIDInt, err := strconv.Atoi(queryEventID)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "event_id need to be integer.",
                "error_code": 3,
                "data": nil,
            })
        }

        var selectedEvent table.Event
        res := backend.db.Where("id = ?", queryEventIDInt).First(&selectedEvent)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "The specified event ID didnt exist.",
                "error_code": 4,
                "data": nil,
            })
        }

        var participants []table.EventParticipant
        res = backend.db.Preload("User").Where("event_id = ?", selectedEvent.ID).Find(&participants)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "There is no event participant for that event.",
                "error_code": 5,
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "Check data.",
            "error_code": 0,
            "data": participants,
        })
    })
}

// NOTE: return then event that participated by the selected user.
// GET : api/protected/event-participate-of-user
func appHandleEventParticipateOfUser(backend *Backend, route fiber.Router) {
    route.Get("event-participate-of-user", func (c *fiber.Ctx) error {
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
        email := claims["email"].(string)

        userEmail := c.Query("email")

        useThisEmail := email
        if admin == 1 && userEmail != "" {
            useThisEmail = userEmail
        }

        var selectedUser table.User
        res := backend.db.Where("user_email = ?", useThisEmail).First(&selectedUser)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("There is no user with that id on the db, %v", res.Error),
                "error_code": 3,
                "data": nil,
            })
        }

        // NOTE: Just display the one that registered as normal only for now...
        // If there is an issue it can fetch everything instead.
        var eventList[] table.Event
        res = backend.db.Model(&table.EventParticipant{}).Joins("JOIN events ON events.id = event_participants.event_id").
        Where("event_participants.user_id = ? AND event_participants.eventp_role = ?", selectedUser.ID, "normal").
        Select("events.*").Find(&eventList)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "This user didnt participate in any event.",
                "error_code": 3,
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "Check data.",
            "error_code": 0,
            "data": eventList,
        })
    })
}
// POST : api/protected/event-participate-absence-itself
func appHandleEventParticipateAbsenceItself(backend *Backend, route fiber.Router) {
    route.Post("event-participate-absence-itself", func (c *fiber.Ctx) error {
        claims, err := GetJWT(c)
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to claims JWT token.",
                "error_code": 1,
                "data": nil,
            })
        }

        email := claims["email"].(string)

        var body struct {
            EventID int `json:"event_id"`
        }

        err = c.BodyParser(&body)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Invalid body request, %v", err),
                "error_code": 2,
                "data": nil,
            })
        }

        var currentUser table.User
        res := backend.db.Where("user_email = ?", email).First(&currentUser)
        if res.Error != nil {
            if !errors.Is(res.Error, gorm.ErrRecordNotFound) {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                    "success": false,
                    "message": "Invalid user on JWT.",
                    "error_code": 3,
                    "data": nil,
                })
            }
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Something wrong happened on the backend, %v", res.Error),
                "error_code": 4,
                "data": nil,
            })
        }

        // Check if event is online
        var event table.Event
        res = backend.db.Where("id = ? AND event_att = ?", body.EventID, "online").First(&event)
        if res.Error != nil {
            if errors.Is(res.Error, gorm.ErrRecordNotFound) {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                    "success": false,
                    "message": "The event is not online or the event itself is not exist.",
                    "error_code": 5,
                    "data": nil,
                })
            }
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to get event with that id, %v", res.Error),
                "error_code": 6,
                "data": nil,
            })
        }

        res = backend.db.Model(&table.EventParticipant{}).Where("event_id = ? AND eventp_role = ? AND user_id = ?", body.EventID, "normal", currentUser.ID).Update("eventp_come", true)

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "OK",
            "error_code": 0,
            "data": nil,
        })
    })
}

// POST : api/protected/event-participate-absence-bulk
func appHandleEventParticipateAbsenceBulk(backend *Backend, route fiber.Router) {
    route.Post("event-participate-absence-bulk", func (c *fiber.Ctx) error {
        claims, err := GetJWT(c)
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to claims JWT token.",
                "error_code": 1,
                "data": nil,
            })
        }

        email := claims["email"].(string)
        admin := claims["admin"].(float64)

        var body struct {
            EventID int `json:"event_id"`
        }

        err = c.BodyParser(&body)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Invalid body request, %v", err),
                "error_code": 2,
                "data": nil,
            })
        }

        var currentUser table.User
        res := backend.db.Where("user_email = ?", email).First(&currentUser)
        if res.Error != nil {
            if !errors.Is(res.Error, gorm.ErrRecordNotFound) {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                    "success": false,
                    "message": "Invalid user on JWT.",
                    "error_code": 3,
                    "data": nil,
                })
            }
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Something wrong happened on the backend, %v", res.Error),
                "error_code": 4,
                "data": nil,
            })
        }

        if admin != 1 {
            var eventPart table.EventParticipant
            res = backend.db.Where("user_id = ? AND event_id = ?", currentUser.ID, body.EventID).First(&eventPart)
            if res.Error != nil {
                if !errors.Is(res.Error, gorm.ErrRecordNotFound) {
                    return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                        "success": false,
                        "message": "Invalid event participant.",
                        "error_code": 5,
                        "data": nil,
                    })
                }
                return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                    "success": false,
                    "message": fmt.Sprintf("Something wrong happened on the backend, %v", res.Error),
                    "error_code": 6,
                    "data": nil,
                })
            }
            if eventPart.EventPRole != "committee" {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                    "success": false,
                    "message": "Invalid credentials for this API.",
                    "error_code": 7,
                    "data": nil,
                })
            }
        }

        res = backend.db.Model(&table.EventParticipant{}).Where("event_id = ? AND eventp_role = ?", body.EventID, "normal").Update("eventp_come", true)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to update the absence for this event, %v", res.Error),
                "error_code": 8,
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "OK",
            "error_code": 0,
            "data": nil,
        })
    })
}

// POST : api/protected/event-participate-absence
func appHandleEventParticipateAbsence(backend *Backend, route fiber.Router) {
    route.Post("event-participate-absence", func (c *fiber.Ctx) error {
        claims, err := GetJWT(c)
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to claims JWT token.",
                "error_code": 1,
                "data": nil,
            })
        }
        email := claims["email"].(string)
        admin := claims["admin"].(float64)

        var body struct  {
            EventId   int    `json:"id"`
            Secret    string `json:"code"`
        }

        err = c.BodyParser(&body)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Invalid body request, %v", err),
                "error_code": 2,
                "data": nil,
            })
        }

        var userSender table.User
        res := backend.db.Where("user_email = ?", email).First(&userSender)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to fetch user from the db, %v", res.Error),
                "error_code": 2,
                "data": nil,
            })
        }

        var userEventPart table.EventParticipant
        res = backend.db.Where("user_id = ? AND event_id = ?", userSender.ID, body.EventId).First(&userEventPart)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to fetch event participant from the db, %v", res.Error),
                "error_code": 3,
                "data": nil,
            })
        }

        // Check if the requestee is a committee
        if userEventPart.EventPRole != "committee" && admin != 1 {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Invalid credentials for this function. DEBUG: %s, %f", userEventPart.EventPRole, admin),
                "error_code": 4,
                "data": nil,
            })
        }

        var absenTarget table.EventParticipant
        res = backend.db.Where("eventp_code = ?", body.Secret).First(&absenTarget)
        if res.Error != nil {
            if errors.Is(res.Error, gorm.ErrRecordNotFound) {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                    "success": false,
                    "message": "Invalid secret code.",
                    "error_code": 5,
                    "data": nil,
                })
            }
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to fetch event participant with that secret.",
                "error_code": 6,
                "data": nil,
            })
        }

        absenTarget.EventPCome = true
        res = backend.db.Save(&absenTarget)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to save event participant.",
                "error_code": 7,
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "User absence.",
            "error_code": 0,
            "data": nil,
        })
    })
}

// GET : api/protected/event-participate-of-event-count
func appHandleEventParticipateOfEventCount(backend *Backend, route fiber.Router) {
    route.Get("event-participate-of-event-count", func (c *fiber.Ctx) error {
        claims, err := GetJWT(c)
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to claims JWT token.",
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

        queryEventID := c.Query("id")
        if queryEventID == "" {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Invalid Query : %v", err),
                "error_code": 3,
                "data": nil,
            })
        }

        var eventParticipantCount int64
        res := backend.db.Model(&table.EventParticipant{}).Where("event_id = ?", queryEventID).Count(&eventParticipantCount)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to fetch event count from db.",
                "error_code": 4,
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "Check data.",
            "error_code": 0,
            "data": eventParticipantCount,
        })
    })
}
