package main

import (
	"fmt"
	"strconv"
	"time"
	"webrpl/table"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

// POST : api/login
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
                "error_code": 1,
                "data": nil,
            })
        }

        if len(body.UserEmail) <= 0 || len(body.UserPassword) <= 0 {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid email and password",
                "error_code": 2,
                "data": nil,
            })
        }

        var user table.User;
        res := backend.db.Where("user_email = ?", body.UserEmail).First(&user)

        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("There is a problem in the db, %v", res.Error),
                "error_code": 3,
                "data": nil,
            })
        }

        validPass := CheckPassword(user.UserPassword, body.UserPassword)
        if !validPass {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Wrong Password",
                "error_code": 4,
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
                "error_code": 5,
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "successfully logged in.",
            "data": user,
            "error_code": 0,
            "token": t,
        })
    })

}

// GET : api/protected/user-info-of
func appHandleUserInfoOf(backend *Backend, route fiber.Router) {
    route.Get("user-info-of", func (c *fiber.Ctx) error {
        user := c.Locals("user").(*jwt.Token)
        if user != nil {
            claims := user.Claims.(jwt.MapClaims)
            admin := claims["admin"].(int)

            if admin != 1 {
                return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                    "success": false,
                    "message": "Invalid credentials to acces this api.",
                    "error_code": 1,
                    "data": nil,
                })
            }
        }

        queriedEmail := c.Query("email")
        if queriedEmail == "" {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "No email specified.",
                "error_code": 2,
                "data": nil,
            })
        }

        var specifiedUser table.User
        res := backend.db.Where("user_email = ?", queriedEmail).First(&specifiedUser)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "The email specified is not registered.",
                "error_code": 3,
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "Check the data.",
            "error_code": 0,
            "data": specifiedUser,
        })
    })
}

// POST: api/protected/user-edit
func appHandleUserEdit(backend *Backend, route fiber.Router) {
    route.Post("/user-edit", func (c *fiber.Ctx) error {
        var body struct {
            FullName string `json:"name"`
            Instance string `json:"instance"`
            Picture  string `json:"picture"`
        }

        user := c.Locals("user").(*jwt.Token)
        if user != nil {
            claims := user.Claims.(jwt.MapClaims)
            email := claims["email"].(string)
            err:= c.BodyParser(&body)
            if err != nil {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                    "success": false,
                    "message": "Invalid Body Request",
                    "error_code": 1,
                    "data": nil,
                })
            }
            
            updates := make(map[string]interface{})

            if body.FullName != "" {
                updates["user_full_name"] = body.FullName
            }

            if body.Instance != "" {
                updates["user_instance"] = body.Instance
            }

            if body.Picture != "" {
                updates["user_picture"] = body.Picture
            }

            result := backend.db.Model(&table.User{}).Where("user_email = ?", email).Updates(updates)
            if result.Error != nil {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                    "success": false,
                    "message": fmt.Sprintf("Error while updating the db, %v", result.Error),
                    "error_code": 2,
                    "data": nil,
                })
            }
            
            return c.Status(fiber.StatusOK).JSON(fiber.Map{
                "success": true,
                "message": "Data Saved.",
                "error_code": 0,
                "data": nil,
            })
        } else {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Failed to claim JWT Token.",
                "error_code": 3,
                "data": nil,
            })
        }
    })
}

// GET : api/protected/user-info-all
func appHandleUserInfoAll(backend *Backend, route fiber.Router) {
    route.Get("user-info-all", func (c *fiber.Ctx) error {
        offsetQuery := c.Query("offset")
        if offsetQuery == "" {
            offsetQuery = "0";
        }

        offset, err := strconv.Atoi(offsetQuery)
        if err != nil {
            offset = 0
        }
        user := c.Locals("user").(*jwt.Token)
        if user != nil {
            claims := user.Claims.(jwt.MapClaims)
            admin := claims["admin"].(int)

            if admin != 1 {
                return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                    "success": false,
                    "message": "Invalid credentials to acces this api.",
                    "error_code": 1,
                    "data": nil,
                })
            }

            var userData []table.User

            res := backend.db.Offset(offset).Limit(1000).Find(&userData)
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
                "message": "Accept the data.",
                "error_code": 0,
                "data": userData,
            })
        }
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "success": false,
            "message": "Failed to claim the JWT Token.",
            "error_code": 3,
            "data": nil,
        })
    })
}

// GET : api/protected/user-info
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
                    "error_code": 1,
                    "data": nil,
                })
            }

            return c.Status(fiber.StatusOK).JSON(fiber.Map{
                "success": true,
                "message": "Success",
                "error_code": 0,
                "data": userData,
            })
        } else {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Failed to claims JWT token.",
                "error_code": 2,
                "data": nil,
            })
        }
    })
}

// POST : api/register
func appHandleRegister(backend *Backend, route fiber.Router) {
    route.Post("register", func (c *fiber.Ctx) error {
        var body struct {
            Email    string `json:"email"`
            FullName string `json:"name"`
            Password string `json:"pass"`
            Instance string `json:"instance"`
            Picture  string `json:"picture"`
        }

        err:= c.BodyParser(&body)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Invalid request body, %v", err),
                "error_code": 1,
                "data": nil,
            })
        }

        if len(body.Email) <= 0 || len(body.Password) <= 0 || len(body.FullName) <= 0 {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid data.",
                "error_code": 2,
                "data": nil,
            })
        }

        var userData table.User
        res := backend.db.Where("user_email = ?", body.Email).First(&userData)
        if res.Error != nil && res.Error != gorm.ErrRecordNotFound {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to fetch user data from db.",
                "error_code": 3,
                "data": nil,
            })
        }

        if res.RowsAffected > 0 {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "User with that email already registered.",
                "error_code": 4,
                "data": nil,
            })
        }

        hashedPassword, err := HashPassword(body.Password)
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to hash the password.",
                "error_code": 5,
                "data": nil,
            })
        }

        newUser := table.User {
            UserFullName: body.FullName,
            UserEmail: body.Email,
            UserPassword: hashedPassword,
            UserPicture: body.Picture,
            UserInstance: body.Instance,
            UserRole: 0,
            UserCreatedAt: time.Now(),
        }

        result := backend.db.Create(&newUser)
        if result.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to write to db, %v", result.Error),
                "error_code": 6,
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "successfully created new user",
            "error_code": 0,
            "data": nil,
        })
    })
}

// POST : api/event-register
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
        isAdmin := claims["admin"].(int)

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
            FMaterial     []int       `json:"material_id"`
            FCertTemplate int       `json:"cert_temp_id"`
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

        var _NewCertTemplate table.CertTemplate
        res := backend.db.Where("cer_id = ?", body.FCertTemplate).First(&_NewCertTemplate)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to get the cert id , %v", res.Error),
                "error_code": 4,
                "data": nil,
            })
        }
        // TODO: Check if that id didnt exist.
        var NewCertTemplate []table.CertTemplate
        NewCertTemplate = append(NewCertTemplate, _NewCertTemplate)

        var _NewEventMat table.EventMaterial
        res = backend.db.Where("eventm_id = ?", body.FMaterial).First(&_NewEventMat)

        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to get the event material id , %v", res.Error),
                "error_code": 5,
                "data": nil,
            })
        }
        // TODO: Check if that id didnt exist.
        var NewEventMat []table.EventMaterial
        NewEventMat = append(NewEventMat, _NewEventMat)

        // TOOD: will not add the event if there is event on that time?
        // TOOD: will not create the event with the same name?
        // TOOD: finish binding this.
        newEvent := table.Event {
            EventDesc: body.Desc,
            EventName: body.Name,
            EventDStart: body.DStart,
            EventDEnd: body.DEnd,
            EventSpeaker: body.Speaker,
            EventAtt: table.AttTypeEnum(body.Att),
            EventMaterials: NewEventMat,
            CertTemplates: NewCertTemplate,
        }

        res = backend.db.Create(newEvent)
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
