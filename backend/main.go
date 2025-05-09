package main

import (
	l "log"

	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
    // TOOD: Make a user type 0 that will be the admin of admin if the user didnt exist
    // TOOD: Make secret readed from env and the user 0 password from env too.


    // DO THE DB STUFF
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

    // DO THE SERVER STUFF

    // AllowOrigins: "http://localhost:5173",
    // AllowCredentials: false,

    app := appCreateNewServer(db, "secret")
    app.app.Use(cors.New(cors.Config{
        AllowOrigins: "*",
        AllowHeaders: "Origin, Content-Type, Accept, Authorization",
        AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
        AllowCredentials: false,
    }))
    appMakeRouteHandler(app)
    if err := app.app.Listen(":3000"); err != nil {
        l.Fatal("ERR: Server failed to start: ", err)
    }
}
