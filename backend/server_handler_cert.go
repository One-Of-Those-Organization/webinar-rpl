package main

import (
    "os"
    "strings"
    "strconv"
    "fmt"
    "encoding/base64"
	"archive/zip"
	"path/filepath"
	"io"

    "webrpl/table"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// TODO: Make an editor so dont need to upload as zip anymore.
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

// TOOD: the file that have the symbol @@ will be replaced by the server stuff.
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
			Data      string `json:"data"`
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

		if body.Data == "" || body.FileName == "" {
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

		base64Data := body.Data
		if i := strings.Index(base64Data, ","); i != -1 {
			base64Data = base64Data[i+1:]
		}

		zipData, err := base64.StdEncoding.DecodeString(base64Data)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Invalid base64 data",
				"error_code": 6,
				"data": nil,
			})
		}

		if !strings.Contains(string(zipData), "application/zip") {
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

		filename := fmt.Sprintf("%s/%s.zip", certTempDir, body.FileName)
		err = os.WriteFile(filename, zipData, 0644)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": "Failed to save data.",
				"error_code": 7,
				"data": nil,
			})
		}

		archive, err := zip.OpenReader(filename)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": "Failed to process zip data.",
				"error_code": 8,
				"data": nil,
			})
		}

		defer archive.Close()

		var extractedFiles []string
		for _, f := range archive.File {
			if strings.Contains(f.Name, "..") {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"success": false,
					"message": "Invalid file path in archive",
					"error_code": 9,
					"data": nil,
				})
			}

			newFilePath := fmt.Sprintf("%s/%s", certTempDir, f.Name)

			// Create directory if file is in subdirectory
			if f.FileInfo().IsDir() {
				if err := os.MkdirAll(newFilePath, f.FileInfo().Mode()); err != nil {
					return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
						"success": false,
						"message": "Failed to create directory from archive",
						"error_code": 10,
						"data": nil,
					})
				}
				continue
			}

			if err := os.MkdirAll(filepath.Dir(newFilePath), 0755); err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"success": false,
					"message": "Failed to create parent directory",
					"error_code": 11,
					"data": nil,
				})
			}

			// Open file in archive
			rc, err := f.Open()
			if err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"success": false,
					"message": "Failed to open file in archive",
					"error_code": 12,
					"data": nil,
				})
			}

			outFile, err := os.OpenFile(newFilePath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, f.FileInfo().Mode())
			if err != nil {
				rc.Close()
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"success": false,
					"message": "Failed to create extracted file",
					"error_code": 13,
					"data": nil,
				})
			}

			_, err = io.Copy(outFile, rc)
			if err != nil {
				rc.Close()
				outFile.Close()
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"success": false,
					"message": "Failed to extract file contents",
					"error_code": 14,
					"data": nil,
				})
			}

			outFile.Close()
			rc.Close()
			extractedFiles = append(extractedFiles, f.Name)
		}

		// NOTE: Maybe log this in the future.
		if err := os.Remove(filename); err != nil {}

		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"success": true,
			"message": "Certificate Template uploaded and extracted.",
			"error_code": 0,
			"data": fiber.Map{
                "extracted_files": extractedFiles,
				"extraction_path": strings.TrimLeft(certTempDir, "static/"),
			},
		})
	})
}

// WIP: Finish this.
// GET : api/certificate/:base64
func appHandleCertificateRoom(backend *Backend, route fiber.Router) {
	route.Get("certificate/:base64", func (c *fiber.Ctx) error {
		base64Param := c.Params("base64")

        var evPart table.EventParticipant
        res := backend.db.Preload("User").Preload("Event").Where(&table.EventParticipant{EventPCode: base64Param, EventPCome: true}).First(&evPart)

        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": true,
                "message": fmt.Sprintf("Failed to fetch event participant for this code, %v", res.Error),
                "error_code": 1,
                "data": nil,
            })
        }

        var cerTemp table.CertTemplate
        res = backend.db.Where("event_id = ?", evPart.EventId).First(&cerTemp)
        if res.Error != nil {
            return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                "success": true,
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
