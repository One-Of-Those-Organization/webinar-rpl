package main

import (
	"encoding/base64"
	"fmt"
	"os"
	"strconv"
	"strings"
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
                "message": "Email or password empty",
                "error_code": 2,
                "data": nil,
            })
        }

        if !isEmailValid(body.UserEmail) {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid email",
                "error_code": 3,
                "data": nil,
            })
        }

        var user table.User;
        res := backend.db.Where("user_email = ?", body.UserEmail).First(&user)

        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("There is a problem in the db, %v", res.Error),
                "error_code": 4,
                "data": nil,
            })
        }

        validPass := CheckPassword(user.UserPassword, body.UserPassword)
        if !validPass {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Wrong Password",
                "error_code": 5,
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
                "error_code": 6,
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
            admin := claims["admin"].(float64)

            if admin != 1 {
                return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                    "success": false,
                    "message": "Invalid credentials to access this api.",
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

// POST: api/protected/user-edit-admin
func appHandleUserEditAdmin(backend *Backend, route fiber.Router){
    route.Post("/user-edit-admin", func (c *fiber.Ctx) error {

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
        if admin != 1 {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid credentials to acces this api.",
                "error_code": 2,
                "data": nil,
            })
        }

        var body struct {
            FullName string `json:"name"`
            Instance string `json:"instance"`
            Picture  string `json:"picture"`
            Password *string `json:"password"`
        }
        updates := make(map[string]any)
        if body.FullName != "" {
            updates["user_full_name"] = body.FullName
        }

        if body.Instance != "" {
            updates["user_instance"] = body.Instance
        }

        if body.Picture != "" {
            updates["user_picture"] = body.Picture
        }

        if body.Password != nil && *body.Password != "" {
            hashedPassword, err := HashPassword(*body.Password)
            if err != nil {
                return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                    "success": false,
                    "message": "Failed to hash the password.",
                    "error_code": 3,
                    "data": nil,
                })
            }
            updates["password"] = hashedPassword
        }

        result := backend.db.Model(&table.User{}).Where("user_email = ?", email).Updates(updates)
        if result.Error != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Error while updating the db, %v", result.Error),
                "error_code": 4,
                "data": nil,
            })
        }
        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "Data Saved.",
            "error_code": 0,
            "data": nil,
        })
    })
}

// POST: api/protected/user-del-admin
func appHandleUserDelAdmin(backend *Backend, route fiber.Router){
    route.Post("/user-del-admin", func (c *fiber.Ctx) error{
        var body struct {
            UserID int `json:"id"`
        }

        user := c.Locals("user").(*jwt.Token)
        if user == nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Failed to claim JWT Token.",
                "error_code": 1,
                "data": nil,
            })
        }

        err := c.BodyParser(&body)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Bad request body, %v", err),
                "error_code": 2,
                "data": nil,
            })
        }

        claims := user.Claims.(jwt.MapClaims)
        admin := claims["admin"].(float64)

        if admin != 1 {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "success": false,
                "message": "Invalid credentials to acces this api.",
                "error_code": 3,
                "data": nil,
            })
        }

        res := backend.db.Delete(&table.User{}, body.UserID)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to delete user from the DB.",
                "error_code": 4,
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "User deleted.",
            "error_code": 0,
            "data": nil,
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
            Password *string `json:"password"`
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

            updates := make(map[string]any)
            // updates := make(map[string]interface{})

            if body.FullName != "" {
                updates["user_full_name"] = body.FullName
            }

            if body.Instance != "" {
                updates["user_instance"] = body.Instance
            }

            if body.Picture != "" {
                updates["user_picture"] = body.Picture
            }

            if body.Password != nil && *body.Password == "" {
                hashedPassword, err := HashPassword(*body.Password)
                if err != nil {
                    return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                        "success": false,
                        "message": "Failed to hash the password.",
                        "error_code": 2,
                        "data": nil,
                    })
                }
                updates["password"] = hashedPassword
            }

            result := backend.db.Model(&table.User{}).Where("user_email = ?", email).Updates(updates)
            if result.Error != nil {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                    "success": false,
                    "message": fmt.Sprintf("Error while updating the db, %v", result.Error),
                    "error_code": 3,
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
                "error_code": 4,
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

        user := c.Locals("user").(*jwt.Token)
        if user != nil {
            claims := user.Claims.(jwt.MapClaims)
            admin := claims["admin"].(float64)

            if admin != 1 {
                return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                    "success": false,
                    "message": "Invalid credentials to acces this api.",
                    "error_code": 1,
                    "data": nil,
                })
            }

            var userData []table.User

            res := backend.db.Offset(offset).Limit(limit).Find(&userData)
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

// POST: api/protected/user-upload-image
func appHandleUserUploadImage(backend *Backend, route fiber.Router) {
    route.Post("user-upload-image", func(c *fiber.Ctx) error {
        var body struct {
            Data string `json:"data"`
        }

        user := c.Locals("user").(*jwt.Token)
        if user == nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to claim JWT Token.",
                "error_code": 1,
                "data": nil,
            })
        }
        claims := user.Claims.(jwt.MapClaims)
        email := claims["email"].(string)

        err := c.BodyParser(&body)
        if err != nil {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid Body Request",
                "error_code": 2,
                "data": nil,
            })
        }

        if body.Data == "" {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "No image data provided",
                "error_code": 3,
                "data": nil,
            })
        }

        imgDir := "static"
        if err := os.MkdirAll(imgDir, 0755); err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to create image directory",
                "error_code": 4,
                "data": nil,
            })
        }

        username := strings.Split(email, "@")[0]
        if username == "" {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Invalid email format",
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

        filename := fmt.Sprintf("%s/%s%s", imgDir, username, fileExt)

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

        if !isEmailValid(body.Email) {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid email format.",
                "error_code": 3,
                "data": nil,
            })
        }

        var userData table.User
        res := backend.db.Where("user_email = ?", body.Email).First(&userData)
        if res.Error != nil && res.Error != gorm.ErrRecordNotFound {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to fetch user data from db.",
                "error_code": 4,
                "data": nil,
            })
        }

        if res.RowsAffected > 0 {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "User with that email already registered.",
                "error_code": 5,
                "data": nil,
            })
        }

        hashedPassword, err := HashPassword(body.Password)
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to hash the password.",
                "error_code": 6,
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
                "error_code": 8,
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

// GET : api/protected/user-count
func appHandleUserCount(backend *Backend, route fiber.Router) {
    route.Get("/user-count", func (c *fiber.Ctx) error {

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

        if admin != 1 {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "success": false,
                "message": "Invalid credentials to acces this api.",
                "error_code": 2,
                "data": nil,
            })
        }
        var count int64
        res := backend.db.Model(&table.User{}).Count(&count)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to fetch user count.",
                "error_code": 3,
                "data": nil,
            })
        }
        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "Check data",
            "error_code": 0,
            "data": count,
        })
    })
}

// POST : api/protected/register-admin
func appHandleRegisterAdmin(backend *Backend, route fiber.Router) {
    route.Post("register-admin", func (c *fiber.Ctx) error {
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

        if admin != 1 {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "success": false,
                "message": "Invalid credentials to acces this api.",
                "error_code": 2,
                "data": nil,
            })
        }
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
                "error_code": 3,
                "data": nil,
            })
        }

        if len(body.Email) <= 0 || len(body.Password) <= 0 || len(body.FullName) <= 0 {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid data.",
                "error_code": 4,
                "data": nil,
            })
        }

        if !isEmailValid(body.Email) {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid email format.",
                "error_code": 5,
                "data": nil,
            })
        }

        var userData table.User
        res := backend.db.Where("user_email = ?", body.Email).First(&userData)
        if res.Error != nil && res.Error != gorm.ErrRecordNotFound {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to fetch user data from db.",
                "error_code": 6,
                "data": nil,
            })
        }

        if res.RowsAffected > 0 {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "User with that email already registered.",
                "error_code": 7,
                "data": nil,
            })
        }

        hashedPassword, err := HashPassword(body.Password)
        if err != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": "Failed to hash the password.",
                "error_code": 8,
                "data": nil,
            })
        }

        newUser := table.User {
            UserFullName: body.FullName,
            UserEmail: body.Email,
            UserPassword: hashedPassword,
            UserPicture: body.Picture,
            UserInstance: body.Instance,
            UserRole: 1,
            UserCreatedAt: time.Now(),
        }

        result := backend.db.Create(&newUser)
        if result.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to write to db, %v", result.Error),
                "error_code": 9,
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
