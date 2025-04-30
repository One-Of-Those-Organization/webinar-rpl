package main

import (
	l "log"

	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
    // DB stuff tetap sama
    db, err := open_db("./db/data.db")
    if err != nil {
        l.Fatal("ERR: Failed to open the db.")
        return
    }
    err = migrate_db(db)
    if err != nil {
        l.Fatal("ERR: Failed to mirgrate the db.")
        return
    }
    l.Println("INFO: DB init task completed successfully.")

    // Server stuff
    app := appCreateNewServer("./db/sessions.db", db)
    
    // Tambahkan ini sebelum appMakeRouteHandler
    app.app.Use(cors.New(cors.Config{
        AllowOrigins: "http://localhost:5173", // URL frontend
        AllowHeaders: "Origin, Content-Type, Accept",
    }))

    appMakeRouteHandler(app)
    if err := app.app.Listen(":3000"); err != nil {
        l.Fatal("ERR: Server failed to start: ", err)
    }
}