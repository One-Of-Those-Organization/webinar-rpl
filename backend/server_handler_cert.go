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
)

// IMPORTANT -- DEPRECATED SHOULD NO BE USED. --
// POST : api/protected/cert-register
func appHandleCertTempNew(backend *Backend, route fiber.Router) {
	route.Post("cert-register", func(c *fiber.Ctx) error {
		user := c.Locals("user").(*jwt.Token)
		if user == nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    "Failed to claims JWT token.",
				"error_code": 1,
				"data":       nil,
			})
		}

		claims := user.Claims.(jwt.MapClaims)
		isAdmin := claims["admin"].(float64)

		if isAdmin != 1 {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success":    false,
				"message":    "Invalid credentials for this function",
				"error_code": 2,
				"data":       nil,
			})
		}

		var body struct {
			EventId      int    `json:"id"`
			CertTemplate string `json:"cert_temp"`
		}

		err := c.BodyParser(&body)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Invalid body request, %v", err),
				"error_code": 3,
				"data":       nil,
			})
		}

		var event table.Event
		res := backend.db.Where("id = ?", body.EventId).First(&event)
		if res.Error != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Failed to fetch event from db, %v", res.Error),
				"error_code": 4,
				"data":       nil,
			})
		}

		newCertTemplate := table.CertTemplate{
			EventId:      body.EventId,
			CertTemplate: body.CertTemplate,
		}

		res = backend.db.Create(&newCertTemplate)
		if res.Error != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Failed to create new event material, %v", res.Error),
				"error_code": 5,
				"data":       nil,
			})
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"success":    true,
			"message":    "New certificate template added.",
			"error_code": 0,
			"data":       nil,
		})
	})
}

// GET : api/protected/cert-info-of
func appHandleCertTempInfoOf(backend *Backend, route fiber.Router) {
	route.Get("cert-info-of", func(c *fiber.Ctx) error {
		user := c.Locals("user").(*jwt.Token)
		if user == nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    "Failed to claims JWT token.",
				"error_code": 1,
				"data":       nil,
			})
		}

		claims := user.Claims.(jwt.MapClaims)
		email := claims["email"].(string)

		if email == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    "Invalid email on JWT.",
				"error_code": 2,
				"data":       nil,
			})
		}

		infoOf := c.Query("id")

		if infoOf == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    "Invalid Query.",
				"error_code": 3,
				"data":       nil,
			})
		}

		infoOfInt, err := strconv.Atoi(infoOf)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Invalid Query : %v", err),
				"error_code": 4,
				"data":       nil,
			})
		}

		var certTemp table.CertTemplate
		res := backend.db.Where("id = ?", infoOfInt).First(&certTemp)
		if res.Error != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    "Failed to fetch event material from db.",
				"error_code": 5,
				"data":       nil,
			})
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"success":    true,
			"message":    "Check data.",
			"error_code": 0,
			"data":       certTemp,
		})
	})
}

// POST : api/protected/cert-del
func appHandleCertDel(backend *Backend, route fiber.Router) {
	route.Post("cert-del", func(c *fiber.Ctx) error {
		user := c.Locals("user").(*jwt.Token)
		if user == nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    "Failed to claims JWT token.",
				"error_code": 1,
				"data":       nil,
			})
		}

		claims := user.Claims.(jwt.MapClaims)
		isAdmin := claims["admin"].(float64)
		if isAdmin != 1 {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success":    false,
				"message":    "Invalid credentials for this function",
				"error_code": 2,
				"data":       nil,
			})
		}

		var body struct {
			CertTempID int `json:"id"`
		}

		err := c.BodyParser(&body)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Invalid body request, %v", err),
				"error_code": 3,
				"data":       nil,
			})
		}

		res := backend.db.Delete(&table.CertTemplate{}, body.CertTempID)
		if res.Error != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    "Failed to delete certificate template from the DB.",
				"error_code": 4,
				"data":       nil,
			})
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"success":    true,
			"message":    "Certificate Template deleted.",
			"data":       nil,
			"error_code": 0,
		})
	})
}

// POST : api/protected/cert-edit
func appHandleCertEdit(backend *Backend, route fiber.Router) {
	route.Post("cert-edit", func(c *fiber.Ctx) error {
		user := c.Locals("user").(*jwt.Token)
		if user == nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    "Failed to claim JWT Token.",
				"error_code": 1,
				"data":       nil,
			})
		}

		claims := user.Claims.(jwt.MapClaims)
		isAdmin := claims["admin"].(float64)

		if isAdmin != 1 {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success":    false,
				"message":    "Invalid credentials for this function",
				"error_code": 2,
				"data":       nil,
			})
		}

		var body struct {
			CertTempID int    `json:"id"`
			NewPath    string `json:"cert_path"`
		}

		err := c.BodyParser(&body)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Invalid body request, %v", err),
				"error_code": 3,
				"data":       nil,
			})
		}

		certTemp := table.CertTemplate{}
		result := backend.db.First(&certTemp, body.CertTempID)
		if result.Error != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Certificate Template not found with ID: %d", body.CertTempID),
				"error_code": 4,
				"data":       nil,
			})
		}

		if body.NewPath == "" {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    "Empty path is not allowed.",
				"error_code": 5,
				"data":       nil,
			})
		}

		certTemp.CertTemplate = body.NewPath
		result = backend.db.Save(&certTemp)
		if result.Error != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Failed to update certificate template: %v", result.Error),
				"error_code": 6,
				"data":       nil,
			})
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"success":    true,
			"message":    "Certificate Template edited.",
			"data":       nil,
			"error_code": 0,
		})
	})
}

// IMPORTANT -- DEPRECATED SHOULD NO BE USED. --
// NOTE: @@ -> $bg.png.path
// NOTE: data_html, data_img
// POST : api/protected/cert-upload-template
func appHandleCertUploadTemplate(backend *Backend, route fiber.Router) {
	route.Post("cert-upload-template", func(c *fiber.Ctx) error {
		claims, err := GetJWT(c)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    "Failed to claim JWT Token.",
				"error_code": 1,
				"data":       nil,
			})
		}
		admin := claims["admin"].(float64)
		if admin != 1 {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success":    false,
				"message":    "Invalid credentials for this function",
				"error_code": 2,
				"data":       nil,
			})
		}

		var body struct {
			FileName string `json:"event_name"`
			DataHTML string `json:"data_html"`
			DataIMG  string `json:"data_img"`
		}

		err = c.BodyParser(&body)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    "Invalid Body Request",
				"error_code": 3,
				"data":       nil,
			})
		}

		if (body.DataHTML == "" && body.DataIMG == "") || body.FileName == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    "No data provided",
				"error_code": 4,
				"data":       nil,
			})
		}

		certDir := "static-hidden"
		if err := os.MkdirAll(certDir, 0755); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    "Failed to create certificate template directory",
				"error_code": 5,
				"data":       nil,
			})
		}

		b64HTMLData := body.DataHTML
		b64IMGData := body.DataIMG
		if i := strings.Index(b64HTMLData, ","); i != -1 {
			b64HTMLData = b64HTMLData[i+1:]
		}
		if i := strings.Index(b64IMGData, ","); i != -1 {
			b64IMGData = b64IMGData[i+1:]
		}

		htmlData, err := base64.StdEncoding.DecodeString(b64HTMLData)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    "Invalid base64 data",
				"error_code": 6,
				"data":       nil,
			})
		}

		imgData, err := base64.StdEncoding.DecodeString(b64IMGData)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    "Invalid base64 data",
				"error_code": 6,
				"data":       nil,
			})
		}

		if !strings.Contains(string(htmlData), "text/html") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    "Invalid base64 data",
				"error_code": 6,
				"data":       nil,
			})
		}

		// NOTE: For now only accept png
		if !strings.Contains(string(imgData), "image/png") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    "Invalid base64 data",
				"error_code": 6,
				"data":       nil,
			})
		}

		certTempDir := fmt.Sprintf("%s/%s", certDir, body.FileName)
		if err := os.MkdirAll(certTempDir, 0755); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    "Failed to create certificate template directory",
				"error_code": 5,
				"data":       nil,
			})
		}

		htmlFilename := fmt.Sprintf("%s/index.html", certTempDir)

		htmlDataProcessed := strings.ReplaceAll(string(htmlData), "@@", fmt.Sprintf("%s://%s/%s/bg.png", backend.mode, backend.address, certTempDir))

		err = os.WriteFile(htmlFilename, []byte(htmlDataProcessed), 0644)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    "Failed to save data.",
				"error_code": 7,
				"data":       nil,
			})
		}
		imgFilename := fmt.Sprintf("%s/bg.png", certTempDir)
		err = os.WriteFile(imgFilename, imgData, 0644)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    "Failed to save data.",
				"error_code": 7,
				"data":       nil,
			})
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"success":    true,
			"message":    "Certificate Template uploaded.",
			"error_code": 0,
			"data": fiber.Map{
				"saved_html":  htmlFilename,
				"saved_image": imgFilename,
			},
		})
	})
}

// GET : api/certificate/:base64
func appHandleCertificateRoom(backend *Backend, route fiber.Router) {
	route.Get("certificate/:base64", func(c *fiber.Ctx) error {
		base64Param := c.Params("base64")

		var evPart table.EventParticipant
		res := backend.db.Preload("User").Preload("Event").Where(&table.EventParticipant{EventPCode: base64Param, EventPCome: true}).First(&evPart)

		if res.Error != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Failed to fetch event participant for this code, %v", res.Error),
				"error_code": 1,
				"data":       nil,
			})
		}

		now := time.Now()
		if evPart.Event.EventDEnd.After(now) {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    "The event is not done yet.",
				"error_code": 3,
				"data":       nil,
			})
		}

		var cerTemp table.CertTemplate
		res = backend.db.Where("event_id = ?", evPart.EventId).First(&cerTemp)
		if res.Error != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Failed to fetch certificate template from the db, %v", res.Error),
				"error_code": 2,
				"data":       nil,
			})
		}

		// Presume that certemp is correct path that look
		// something like this : {folder}/{file}.html

		// Strip the .html from the cerTemp
		stripped := strings.TrimSuffix(cerTemp.CertTemplate, ".html")

		backend.engine.ClearCache()
		return c.Render(stripped, fiber.Map{
			"UniqueID":  base64Param,
			"EventName": evPart.Event.EventName,
			"UserName":  evPart.User.UserFullName,
		})
	})
}

// new but dumb stuff

// NOTE: wrapper around alot of independent api so it is more locked up.
// POST : api/protected/create-new-cert-from-event
func appHandleCertNewDumbFixed(backend *Backend, route fiber.Router) {
	route.Post("create-new-cert-from-event", func(c *fiber.Ctx) error {
		fmt.Printf("[DEBUG] Certificate creation request received at %s by user %s\n",
			time.Now().Format("2006-01-02 15:04:05"), "Mikaelazzz")

		claims, err := GetJWT(c)
		if err != nil {
			fmt.Printf("[ERROR] JWT validation failed: %v\n", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    "Failed to claims JWT token.",
				"error_code": 1,
				"data":       nil,
			})
		}

		email := claims["email"].(string)
		admin := claims["admin"].(float64)

		fmt.Printf("[DEBUG] User: %s, Admin: %v\n", email, admin)

		if email == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    "Invalid email on JWT.",
				"error_code": 2,
				"data":       nil,
			})
		}

		var body struct {
			EventID int `json:"event_id"`
		}

		err = c.BodyParser(&body)
		if err != nil {
			fmt.Printf("[ERROR] Body parsing failed: %v\n", err)
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Invalid body request, %v", err),
				"error_code": 3,
				"data":       nil,
			})
		}

		fmt.Printf("[DEBUG] Requested Event ID: %d\n", body.EventID)

		// Check if event exists with improved error handling
		event, err := checkEventExists(backend, body.EventID)
		if err != nil {
			fmt.Printf("[ERROR] Event verification failed: %v\n", err)
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Event not found: %v", err),
				"error_code": 5,
				"data":       nil,
			})
		}

		// Check permissions (admin or committee for this event)
		err = checkCertificatePermission(backend, email, body.EventID, false)
		if err != nil {
			fmt.Printf("[ERROR] Permission denied for user %s on event %d: %v\n", email, body.EventID, err)
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Access denied: %v", err),
				"error_code": 7,
				"data":       nil,
			})
		}

		fmt.Printf("[DEBUG] Permission check passed for user %s on event %s\n", email, event.EventName)

		// Check if certificate template already exists
		var existingCertTemplate table.CertTemplate
		existingRes := backend.db.Where("event_id = ?", body.EventID).First(&existingCertTemplate)
		if existingRes.Error == nil {
			fmt.Printf("[DEBUG] Certificate template already exists: ID=%d\n", existingCertTemplate.ID)
			// Certificate template already exists, return existing one
			return c.Status(fiber.StatusOK).JSON(fiber.Map{
				"success":    true,
				"message":    "Certificate template already exists for this event.",
				"error_code": 0,
				"data": fiber.Map{
					"id":               body.EventID,
					"cert_template_id": existingCertTemplate.ID,
				},
			})
		}

		// Create directory structure: static/sertifikat/event_id
		certDir := fmt.Sprintf("static/sertifikat/%d", body.EventID)
		if err := os.MkdirAll(certDir, 0755); err != nil {
			fmt.Printf("[ERROR] Failed to create certificate directory %s: %v\n", certDir, err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    "Failed to create certificate directory",
				"error_code": 6,
				"data":       nil,
			})
		}

		// Create new certificate template with updated path
		cert_path := fmt.Sprintf("sertifikat/%d/index.html", body.EventID)

		newCertTemplate := table.CertTemplate{
			EventId:      body.EventID,
			CertTemplate: cert_path,
		}

		res := backend.db.Create(&newCertTemplate)
		if res.Error != nil {
			fmt.Printf("[ERROR] Failed to create certificate template record: %v\n", res.Error)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Failed to create new event cert template, %v", res.Error),
				"error_code": 8,
				"data":       nil,
			})
		}

		fmt.Printf("[SUCCESS] Certificate template created successfully for event %d with ID %d\n",
			body.EventID, newCertTemplate.ID)

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"success":    true,
			"message":    "Certificate template created successfully.",
			"error_code": 0,
			"data": fiber.Map{
				"id":               body.EventID,
				"cert_template_id": newCertTemplate.ID,
			},
		})
	})
}

// NOTE: Accept the event_id as the query so it knows what for.
// GET : api/c/cert-editor
func appHandleCertEditor(backend *Backend, route fiber.Router) {
	route.Get("cert-editor", func(c *fiber.Ctx) error {
		claims, err := GetJWT(c)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    "Failed to claims JWT token.",
				"error_code": 1,
				"data":       nil,
			})
		}
		admin := claims["admin"].(float64)
		email := claims["email"].(string)

		if admin != 1 {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success":    false,
				"message":    "Invalid credentials for this function",
				"error_code": 2,
				"data":       nil,
			})
		}

		if email == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    "Invalid email on JWT.",
				"error_code": 3,
				"data":       nil,
			})
		}

		event_id := c.Query("event_id")
		if event_id == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    "Invalid event_id on query.",
				"error_code": 4,
				"data":       nil,
			})
		}

		var certTemp table.CertTemplate
		res := backend.db.Where("event_id = ?", event_id).First(&certTemp)
		if res.Error != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Failed to fetch cert temp from db, %v", res.Error),
				"error_code": 5,
				"data":       nil,
			})
		}

		backend.engine.ClearCache()
		return c.Render("editor", fiber.Map{
			"APIPath": fmt.Sprintf("%s://%s", backend.mode, backend.address),
		})
	})
}

// NOTE: You are not supposed to use this from outside
//       the buildin editor!!!!

// POST : api/c/-cert-editor-upload-image
// Update existing upload image handler to work with both cookie and bearer token
func appHandleCertEditorUploadImage(backend *Backend, route fiber.Router) {
	route.Post("-cert-editor-upload-image", func(c *fiber.Ctx) error {
		// Try to get user from either cookie JWT or bearer token
		var email string
		var isAdmin float64 = 0

		// First try cookie JWT (for existing functionality)
		user := c.Locals("user")
		if user != nil {
			if token, ok := user.(*jwt.Token); ok {
				claims := token.Claims.(jwt.MapClaims)
				email = claims["email"].(string)
				if adminClaim, exists := claims["admin"]; exists {
					isAdmin = adminClaim.(float64)
				}
			}
		}

		// If no user from cookie, try Authorization header
		if email == "" {
			authHeader := c.Get("Authorization")
			if strings.HasPrefix(authHeader, "Bearer ") {
				tokenString := strings.TrimPrefix(authHeader, "Bearer ")

				// Parse and validate JWT token
				token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
					if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
						return nil, fmt.Errorf("unexpected signing method")
					}
					return []byte(backend.pass), nil
				})

				if err == nil && token.Valid {
					if claims, ok := token.Claims.(jwt.MapClaims); ok {
						email = claims["email"].(string)
						if adminClaim, exists := claims["admin"]; exists {
							isAdmin = adminClaim.(float64)
						}
					}
				}
			}
		}

		if email == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success":    false,
				"message":    "Missing or invalid JWT token",
				"error_code": 1,
				"data":       nil,
			})
		}

		var currentUser table.User
		res := backend.db.Where("user_email = ?", email).First(&currentUser)
		if res.Error != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Failed to get the user with that email from the db, %v", res.Error),
				"error_code": 9,
				"data":       nil,
			})
		}

		var body struct {
			Data    string `json:"data"`
			EventID string `json:"event_id"`
		}

		err := c.BodyParser(&body)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Invalid body request, %v", err),
				"error_code": 4,
				"data":       nil,
			})
		}

		// For admin, skip participant check
		if isAdmin != 1 {
			var currentEventPart table.EventParticipant
			res = backend.db.Where("user_id = ? AND event_id = ?", currentUser.ID, body.EventID).First(&currentEventPart)
			if res.Error != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"success":    false,
					"message":    fmt.Sprintf("Failed to get the event participant with that user and event from the db, %v", res.Error),
					"error_code": 10,
					"data":       nil,
				})
			}

			if currentEventPart.EventPRole != "committee" {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"success":    false,
					"message":    "Invalid credentials for this function",
					"error_code": 2,
					"data":       nil,
				})
			}
		}

		if body.Data == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    "No data provided",
				"error_code": 5,
				"data":       nil,
			})
		}

		certDir := "static"
		if err := os.MkdirAll(certDir, 0755); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    "Failed to create certificate template directory",
				"error_code": 6,
				"data":       nil,
			})
		}

		if i := strings.Index(body.Data, ","); i != -1 {
			body.Data = body.Data[i+1:]
		}

		decoded, err := base64.StdEncoding.DecodeString(body.Data)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Invalid base64 data, %v", err),
				"error_code": 6,
				"data":       nil,
			})
		}

		certTempDir := fmt.Sprintf("%s/%s", certDir, body.EventID)
		if err := os.MkdirAll(certTempDir, 0755); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    "Failed to create certificate template directory",
				"error_code": 7,
				"data":       nil,
			})
		}

		imgFilename := fmt.Sprintf("%s/bg.png", certTempDir)
		err = os.WriteFile(imgFilename, decoded, 0644)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    "Failed to save data.",
				"error_code": 8,
				"data":       nil,
			})
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"success":    true,
			"message":    "Image Uploaded successfully.",
			"error_code": 0,
			"data": fiber.Map{
				"filename": fmt.Sprintf("static/%s/bg.png", body.EventID),
			},
		})
	})
}

// FIXED: POST : api/protected/-cert-editor-upload-image
func appHandleCertEditorUploadImageProtectedFixed(backend *Backend, route fiber.Router) {
	route.Post("-cert-editor-upload-image", func(c *fiber.Ctx) error {
		// Enhanced logging
		fmt.Printf("[DEBUG] Certificate image upload request received at %s by user %s\n",
			time.Now().Format("2006-01-02 15:04:05"), "Mikaelazzz")

		// Get JWT from middleware
		user := c.Locals("user").(*jwt.Token)
		if user == nil {
			fmt.Printf("[ERROR] Failed to get JWT token from middleware\n")
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success":    false,
				"message":    "Failed to get JWT token.",
				"error_code": 1,
				"data":       nil,
			})
		}

		claims := user.Claims.(jwt.MapClaims)
		email := claims["email"].(string)
		isAdmin := claims["admin"].(float64)

		fmt.Printf("[DEBUG] User: %s, Admin: %v\n", email, isAdmin)

		if email == "" {
			fmt.Printf("[ERROR] Empty email in JWT token\n")
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success":    false,
				"message":    "Invalid empty email in JWT.",
				"error_code": 3,
				"data":       nil,
			})
		}

		// Parse request body
		var body struct {
			Data    string `json:"data"`
			EventID string `json:"event_id"`
		}

		err := c.BodyParser(&body)
		if err != nil {
			fmt.Printf("[ERROR] Failed to parse request body: %v\n", err)
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Invalid body request, %v", err),
				"error_code": 4,
				"data":       nil,
			})
		}

		fmt.Printf("[DEBUG] Parsed body - EventID: %s, Data length: %d\n", body.EventID, len(body.Data))

		if body.Data == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    "No image data provided",
				"error_code": 5,
				"data":       nil,
			})
		}

		if body.EventID == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    "No event ID provided",
				"error_code": 6,
				"data":       nil,
			})
		}

		// Convert event ID to integer for permission check
		eventIDInt, err := strconv.Atoi(body.EventID)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    "Invalid event ID format",
				"error_code": 7,
				"data":       nil,
			})
		}

		// Verify event exists
		_, err = checkEventExists(backend, eventIDInt)
		if err != nil {
			fmt.Printf("[ERROR] Event verification failed for ID %d: %v\n", eventIDInt, err)
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Event not found: %v", err),
				"error_code": 8,
				"data":       nil,
			})
		}

		// Check permissions (admin or committee for this event)
		err = checkCertificatePermission(backend, email, eventIDInt, false)
		if err != nil {
			fmt.Printf("[ERROR] Permission denied for user %s on event %d: %v\n", email, eventIDInt, err)
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Access denied: %v", err),
				"error_code": 2,
				"data":       nil,
			})
		}

		fmt.Printf("[DEBUG] Permission check passed for user %s\n", email)

		// Create directory structure: static/sertifikat/event_id
		certTempDir := fmt.Sprintf("static/sertifikat/%s", body.EventID)
		if err := os.MkdirAll(certTempDir, 0755); err != nil {
			fmt.Printf("[ERROR] Failed to create certificate template directory: %v\n", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    "Failed to create certificate template directory",
				"error_code": 9,
				"data":       nil,
			})
		}

		// Remove data:image/png;base64, prefix if present
		if i := strings.Index(body.Data, ","); i != -1 {
			body.Data = body.Data[i+1:]
		}

		// Decode base64 data
		decoded, err := base64.StdEncoding.DecodeString(body.Data)
		if err != nil {
			fmt.Printf("[ERROR] Failed to decode base64 data: %v\n", err)
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Invalid base64 data, %v", err),
				"error_code": 10,
				"data":       nil,
			})
		}

		// Save image file with updated path
		imgFilename := fmt.Sprintf("%s/bg.png", certTempDir)
		err = os.WriteFile(imgFilename, decoded, 0644)
		if err != nil {
			fmt.Printf("[ERROR] Failed to save image file: %v\n", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Failed to save image file, %v", err),
				"error_code": 11,
				"data":       nil,
			})
		}

		fmt.Printf("[SUCCESS] Background image uploaded successfully for event %s to %s\n", body.EventID, imgFilename)

		// Return success response with updated path
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"success":    true,
			"message":    "Background image uploaded successfully.",
			"error_code": 0,
			"data": fiber.Map{
				"filename": fmt.Sprintf("static/sertifikat/%s/bg.png", body.EventID),
			},
		})
	})
}

// FIXED: POST : api/protected/-cert-editor-upload-html
func appHandleCertEditorUploadHtmlProtectedFixed(backend *Backend, route fiber.Router) {
	route.Post("-cert-editor-upload-html", func(c *fiber.Ctx) error {
		// Enhanced logging
		fmt.Printf("[DEBUG] Certificate HTML upload request received at %s by user %s\n",
			time.Now().Format("2006-01-02 15:04:05"), "Mikaelazzz")

		// Get JWT from middleware
		user := c.Locals("user").(*jwt.Token)
		if user == nil {
			fmt.Printf("[ERROR] Failed to get JWT token from middleware\n")
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success":    false,
				"message":    "Failed to get JWT token.",
				"error_code": 1,
				"data":       nil,
			})
		}

		claims := user.Claims.(jwt.MapClaims)
		email := claims["email"].(string)
		isAdmin := claims["admin"].(float64)

		fmt.Printf("[DEBUG] User: %s, Admin: %v\n", email, isAdmin)

		if email == "" {
			fmt.Printf("[ERROR] Empty email in JWT token\n")
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success":    false,
				"message":    "Invalid empty email in JWT.",
				"error_code": 3,
				"data":       nil,
			})
		}

		// Parse request body
		var body struct {
			Data    string `json:"data"`
			EventID string `json:"event_id"`
		}

		err := c.BodyParser(&body)
		if err != nil {
			fmt.Printf("[ERROR] Failed to parse request body: %v\n", err)
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Invalid body request, %v", err),
				"error_code": 4,
				"data":       nil,
			})
		}

		fmt.Printf("[DEBUG] Parsed body - EventID: %s, Data length: %d\n", body.EventID, len(body.Data))

		if body.Data == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    "No HTML data provided",
				"error_code": 5,
				"data":       nil,
			})
		}

		if body.EventID == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    "No event ID provided",
				"error_code": 6,
				"data":       nil,
			})
		}

		// Convert event ID to integer for permission check
		eventIDInt, err := strconv.Atoi(body.EventID)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    "Invalid event ID format",
				"error_code": 7,
				"data":       nil,
			})
		}

		// Verify event exists
		_, err = checkEventExists(backend, eventIDInt)
		if err != nil {
			fmt.Printf("[ERROR] Event verification failed for ID %d: %v\n", eventIDInt, err)
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Event not found: %v", err),
				"error_code": 8,
				"data":       nil,
			})
		}

		// Check permissions (admin or committee for this event)
		err = checkCertificatePermission(backend, email, eventIDInt, false)
		if err != nil {
			fmt.Printf("[ERROR] Permission denied for user %s on event %d: %v\n", email, eventIDInt, err)
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Access denied: %v", err),
				"error_code": 2,
				"data":       nil,
			})
		}

		fmt.Printf("[DEBUG] Permission check passed for user %s\n", email)

		// Create directory structure: static/sertifikat/event_id
		certTempDir := fmt.Sprintf("static/sertifikat/%s", body.EventID)
		if err := os.MkdirAll(certTempDir, 0755); err != nil {
			fmt.Printf("[ERROR] Failed to create certificate template directory: %v\n", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    "Failed to create certificate template directory",
				"error_code": 9,
				"data":       nil,
			})
		}

		// Remove data:text/html;base64, prefix if present
		if i := strings.Index(body.Data, ","); i != -1 {
			body.Data = body.Data[i+1:]
		}

		// Decode base64 data
		decoded, err := base64.StdEncoding.DecodeString(body.Data)
		if err != nil {
			fmt.Printf("[ERROR] Failed to decode base64 data: %v\n", err)
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Invalid base64 data, %v", err),
				"error_code": 10,
				"data":       nil,
			})
		}

		// Save HTML file with updated path
		htmlFilename := fmt.Sprintf("%s/index.html", certTempDir)
		err = os.WriteFile(htmlFilename, decoded, 0644)
		if err != nil {
			fmt.Printf("[ERROR] Failed to save HTML file: %v\n", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Failed to save HTML file, %v", err),
				"error_code": 11,
				"data":       nil,
			})
		}

		// Update certificate template in database with new path structure
		var certTemplate table.CertTemplate
		res := backend.db.Where("event_id = ?", body.EventID).First(&certTemplate)
		if res.Error != nil {
			// Create new certificate template record
			newCertTemplate := table.CertTemplate{
				EventId:      eventIDInt,
				CertTemplate: fmt.Sprintf("sertifikat/%s/index.html", body.EventID),
			}
			res = backend.db.Create(&newCertTemplate)
			if res.Error != nil {
				fmt.Printf("[ERROR] Failed to create certificate template record: %v\n", res.Error)
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"success":    false,
					"message":    fmt.Sprintf("Failed to create certificate template record, %v", res.Error),
					"error_code": 12,
					"data":       nil,
				})
			}
			fmt.Printf("[DEBUG] Created new certificate template record with ID %d\n", newCertTemplate.ID)
		} else {
			// Update existing certificate template
			certTemplate.CertTemplate = fmt.Sprintf("sertifikat/%s/index.html", body.EventID)
			res = backend.db.Save(&certTemplate)
			if res.Error != nil {
				fmt.Printf("[ERROR] Failed to update certificate template record: %v\n", res.Error)
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"success":    false,
					"message":    fmt.Sprintf("Failed to update certificate template record, %v", res.Error),
					"error_code": 13,
					"data":       nil,
				})
			}
			fmt.Printf("[DEBUG] Updated existing certificate template record ID %d\n", certTemplate.ID)
		}

		fmt.Printf("[SUCCESS] HTML template uploaded successfully for event %s to %s\n", body.EventID, htmlFilename)

		// Return success response with updated path
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"success":    true,
			"message":    "HTML template uploaded successfully.",
			"error_code": 0,
			"data": fiber.Map{
				"filename": fmt.Sprintf("static/sertifikat/%s/index.html", body.EventID),
			},
		})
	})
}

// NOTE: You are not supposed to use this from outside
//       the buildin editor!!!!

// POST : api/c/-cert-editor-upload-html
func appHandleCertEditorUploadHtml(backend *Backend, route fiber.Router) {
	route.Post("-cert-editor-upload-html", func(c *fiber.Ctx) error {
		// Try to get user from either cookie JWT or bearer token
		var email string
		var isAdmin float64 = 0

		// First try cookie JWT (for existing functionality)
		user := c.Locals("user")
		if user != nil {
			if token, ok := user.(*jwt.Token); ok {
				claims := token.Claims.(jwt.MapClaims)
				email = claims["email"].(string)
				if adminClaim, exists := claims["admin"]; exists {
					isAdmin = adminClaim.(float64)
				}
			}
		}

		// If no user from cookie, try Authorization header
		if email == "" {
			authHeader := c.Get("Authorization")
			if strings.HasPrefix(authHeader, "Bearer ") {
				tokenString := strings.TrimPrefix(authHeader, "Bearer ")

				// Parse and validate JWT token
				token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
					if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
						return nil, fmt.Errorf("unexpected signing method")
					}
					return []byte(backend.pass), nil
				})

				if err == nil && token.Valid {
					if claims, ok := token.Claims.(jwt.MapClaims); ok {
						email = claims["email"].(string)
						if adminClaim, exists := claims["admin"]; exists {
							isAdmin = adminClaim.(float64)
						}
					}
				}
			}
		}

		if email == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success":    false,
				"message":    "Missing or invalid JWT token",
				"error_code": 1,
				"data":       nil,
			})
		}

		var currentUser table.User
		res := backend.db.Where("user_email = ?", email).First(&currentUser)
		if res.Error != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Failed to get the user with that email from the db, %v", res.Error),
				"error_code": 9,
				"data":       nil,
			})
		}

		var body struct {
			Data    string `json:"data"`
			EventID string `json:"event_id"`
		}

		err := c.BodyParser(&body)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Invalid body request, %v", err),
				"error_code": 4,
				"data":       nil,
			})
		}

		// For admin, skip participant check
		if isAdmin != 1 {
			var currentEventPart table.EventParticipant
			res = backend.db.Where("user_id = ? AND event_id = ?", currentUser.ID, body.EventID).First(&currentEventPart)
			if res.Error != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"success":    false,
					"message":    fmt.Sprintf("Failed to get the event participant with that user and event from the db, %v", res.Error),
					"error_code": 10,
					"data":       nil,
				})
			}

			if currentEventPart.EventPRole != "committee" {
				return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
					"success":    false,
					"message":    "Invalid credentials for this function",
					"error_code": 2,
					"data":       nil,
				})
			}
		}

		if body.Data == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    "No data provided",
				"error_code": 5,
				"data":       nil,
			})
		}

		certDir := "static"
		if err := os.MkdirAll(certDir, 0755); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    "Failed to create certificate template directory",
				"error_code": 6,
				"data":       nil,
			})
		}

		if i := strings.Index(body.Data, ","); i != -1 {
			body.Data = body.Data[i+1:]
		}

		decoded, err := base64.StdEncoding.DecodeString(body.Data)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success":    false,
				"message":    fmt.Sprintf("Invalid base64 data, %v", err),
				"error_code": 6,
				"data":       nil,
			})
		}

		certTempDir := fmt.Sprintf("%s/%s", certDir, body.EventID)
		if err := os.MkdirAll(certTempDir, 0755); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    "Failed to create certificate template directory",
				"error_code": 7,
				"data":       nil,
			})
		}

		htmlFilename := fmt.Sprintf("%s/index.html", certTempDir)
		err = os.WriteFile(htmlFilename, decoded, 0644)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success":    false,
				"message":    "Failed to save data.",
				"error_code": 8,
				"data":       nil,
			})
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"success":    true,
			"message":    "HTML Uploaded successfully.",
			"error_code": 0,
			"data": fiber.Map{
				"filename": fmt.Sprintf("static/%s/index.html", body.EventID),
			},
		})
	})
}

func checkCertificatePermission(backend *Backend, email string, eventID int, requireAdmin bool) error {
	// Get user from database
	var currentUser table.User
	res := backend.db.Where("user_email = ?", email).First(&currentUser)
	if res.Error != nil {
		return fmt.Errorf("user not found: %v", res.Error)
	}

	// Check if user is admin (admin has access to everything)
	if currentUser.UserRole == 1 {
		return nil
	}

	// If admin is required and user is not admin, deny access
	if requireAdmin {
		return fmt.Errorf("admin access required")
	}

	// For non-admin users, check if they are committee member for this event
	var currentEventPart table.EventParticipant
	res = backend.db.Where("user_id = ? AND event_id = ?", currentUser.ID, eventID).First(&currentEventPart)
	if res.Error != nil {
		return fmt.Errorf("user is not registered for this event")
	}

	if currentEventPart.EventPRole != "committee" {
		return fmt.Errorf("committee access required for this event")
	}

	return nil
}

func checkEventExists(backend *Backend, eventID int) (*table.Event, error) {
	var event table.Event

	// Try multiple possible field names for compatibility
	result := backend.db.Where("id = ?", eventID).First(&event)
	if result.Error != nil {
		// Log the error for debugging
		fmt.Printf("[DEBUG] Event lookup failed for ID %d: %v\n", eventID, result.Error)

		// Try alternative field names if the first fails
		result = backend.db.Where("ID = ?", eventID).First(&event)
		if result.Error != nil {
			// Check if any events exist at all for debugging
			var eventCount int64
			backend.db.Model(&table.Event{}).Count(&eventCount)
			fmt.Printf("[DEBUG] Total events in database: %d\n", eventCount)

			// List first few events for debugging
			var sampleEvents []table.Event
			backend.db.Limit(5).Find(&sampleEvents)
			for _, evt := range sampleEvents {
				fmt.Printf("[DEBUG] Sample event: ID=%v, Name=%s\n", evt.ID, evt.EventName)
			}

			return nil, fmt.Errorf("event not found with ID %d", eventID)
		}
	}

	fmt.Printf("[DEBUG] Found event: ID=%v, Name=%s\n", event.ID, event.EventName)
	return &event, nil
}
