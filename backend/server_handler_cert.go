package main

import (
    "os"
    "strings"
    "strconv"
    "fmt"
    "encoding/base64"

    "webrpl/table"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// TODO: all of the cert api will be revamped because "THEY" want an editor
// for the cert templates... sigh...

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
            // NOTE:
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
        res := backend.db.Where("id = ?", body.EventId).First(&event)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to fetch event from db, %v", res.Error),
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

// NOTE: @@ -> $bg.png.path
// NOTE: data_html, data_img
// POST : api/protected/cert-upload-template
func appHandleCertUploadTemplate(backend *Backend, route fiber.Router) {
	route.Post("cert-upload-template", func (c *fiber.Ctx) error {
		claims, err := GetJWT(c)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Failed to claim JWT Token.",
				"error_code": 1,
				"data": nil,
			})
		}
		admin := claims["admin"].(float64)
		if admin != 1 {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Invalid credentials for this function",
				"error_code": 2,
				"data": nil,
			})
		}

		var body struct {
			FileName  string `json:"event_name"`
			DataHTML  string `json:"data_html"`
			DataIMG   string `json:"data_img"`
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

		if (body.DataHTML == "" && body.DataIMG == "") || body.FileName == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "No data provided",
				"error_code": 4,
				"data": nil,
			})
		}

		certDir := "static"
		if err := os.MkdirAll(certDir, 0755); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": "Failed to create certificate template directory",
				"error_code": 5,
				"data": nil,
			})
		}

		b64HTMLData := body.DataHTML
        b64IMGData  := body.DataIMG
		if i := strings.Index(b64HTMLData, ","); i != -1 {
			b64HTMLData = b64HTMLData[i+1:]
		}
		if i := strings.Index(b64IMGData, ","); i != -1 {
			b64IMGData = b64IMGData[i+1:]
		}

		htmlData, err := base64.StdEncoding.DecodeString(b64HTMLData)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Invalid base64 data",
				"error_code": 6,
				"data": nil,
			})
		}

		imgData, err := base64.StdEncoding.DecodeString(b64IMGData)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Invalid base64 data",
				"error_code": 6,
				"data": nil,
			})
		}

		if !strings.Contains(string(htmlData), "text/html") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Invalid base64 data",
				"error_code": 6,
				"data": nil,
			})
		}

        // NOTE: For now only accept png
		if !strings.Contains(string(imgData), "image/png") {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Invalid base64 data",
				"error_code": 6,
				"data": nil,
			})
		}

		certTempDir := fmt.Sprintf("%s/%s", certDir, body.FileName)
		if err := os.MkdirAll(certTempDir, 0755); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": "Failed to create certificate template directory",
				"error_code": 5,
				"data": nil,
			})
		}

		htmlFilename := fmt.Sprintf("%s/index.html", certTempDir)

        htmlDataProcessed := strings.ReplaceAll(string(htmlData), "@@", fmt.Sprintf("%s://%s/%s/bg.png", backend.mode, backend.address, certTempDir))

		err = os.WriteFile(htmlFilename, []byte(htmlDataProcessed), 0644)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": "Failed to save data.",
				"error_code": 7,
				"data": nil,
			})
		}
        imgFilename := fmt.Sprintf("%s/bg.png", certTempDir)
		err = os.WriteFile(imgFilename, htmlData, 0644)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": "Failed to save data.",
				"error_code": 7,
				"data": nil,
			})
		}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"success": true,
			"message": "Certificate Template uploaded.",
			"error_code": 0,
			"data": fiber.Map{
                "saved_html": htmlFilename,
                "saved_image": imgFilename,
			},
		})
	})
}

// GET : api/certificate/:base64
func appHandleCertificateRoom(backend *Backend, route fiber.Router) {
	route.Get("certificate/:base64", func (c *fiber.Ctx) error {
		base64Param := c.Params("base64")

        var evPart table.EventParticipant
        res := backend.db.Preload("User").Preload("Event").Where(&table.EventParticipant{EventPCode: base64Param, EventPCome: true}).First(&evPart)

        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to fetch event participant for this code, %v", res.Error),
                "error_code": 1,
                "data": nil,
            })
        }

        var cerTemp table.CertTemplate
        res = backend.db.Where("event_id = ?", evPart.EventId).First(&cerTemp)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to fetch certificate template from the db, %v", res.Error),
                "error_code": 2,
                "data": nil,
            })
        }

        // Presume that certemp is correct path that look
        // something like this : {folder}/{file}.html

        // Strip the .html from the cerTemp
        stripped := strings.TrimSuffix(cerTemp.CertTemplate, ".html")

        backend.engine.ClearCache()
		return c.Render(stripped, fiber.Map{
			"UniqID": base64Param,
            "Event": evPart.Event.EventName,
			"Name": evPart.User.UserFullName,
		})
	})
}

// new but dumb stuff

// NOTE: wrapper around alot of independent api so it is more locked up.
// POST : api/protected/create-new-cert-from-event
func appHandleCertNewDumb(backend *Backend, route fiber.Router) {
    route.Post("create-new-cert-from-event", func (c *fiber.Ctx) error {
        claims, err := GetJWT(c);
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

        if email == "" {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "success": false,
                "message": "Invalid email on JWT.",
                "error_code": 2,
                "data": nil,
            })
        }

        var body struct {
            EventID int
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

        var currentUser table.EventParticipant
        res := backend.db.Preload("User").Where("user_email = ? AND event_id = ?", email, body.EventID).First(&currentUser)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to fetch event from db, %v", res.Error),
                "error_code": 4,
                "data": nil,
            })
        }

        if currentUser.EventPRole != "committee" && admin != 1 {
            return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
                "success": false,
                "message": "Invalid credentials for this function",
                "error_code": 5,
                "data": nil,
            })
        }

        // straight up set the the cert path to nonexistance index.html
        cert_path := fmt.Sprintf("%d/index.html", body.EventID)

        newCertTemplate := table.CertTemplate {
            EventId: body.EventID,
            CertTemplate: cert_path,
        }

        res = backend.db.Create(&newCertTemplate)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": false,
                "message": fmt.Sprintf("Failed to create new event cert template, %v", res.Error),
                "error_code": 5,
                "data": nil,
            })
        }

        return c.Status(fiber.StatusOK).JSON(fiber.Map{
            "success": true,
            "message": "Check data. Please access the editor link with the id this api return.",
            "error_code": 0,
            "data": fiber.Map{
                "id": newCertTemplate.ID,
            },
        })
    })
}

// TODO: Finish this API
// NOTE: Accept the event_id as the query so it knows what for.
// GET : api/protected/cert-editor
func appHandleCertEditor(backend *Backend, route fiber.Router) {
    // route.Get("cert-editor", func (c *fiber.Ctx) error {
    // })
}
