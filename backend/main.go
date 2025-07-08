package main

import (
	"fmt"
	l "log"
	"os"
	"strconv"

	"github.com/gofiber/fiber/v2/middleware/cors"
)

func main() {
    ip := "0.0.0.0"
    port := 3000

    ip_env   := os.Getenv("WRPL_IP")
    port_env := os.Getenv("WRPL_PORT")
    if len(ip_env) > 0 {
        ip = ip_env
    }
    if len(port_env) > 0 {
        convert, err := strconv.Atoi(port_env)
        if err == nil {
            port = convert
        }
    }

    add := fmt.Sprintf("%s:%d", ip, port)

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
    sec := getCredentialFromEnv()
    password := sec.Password

    app := appCreateNewServer(db, sec, add)
    app.app.Use(cors.New(cors.Config{
        AllowOrigins: "*",
        AllowHeaders: "Origin, Content-Type, Accept, Authorization",
        AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
        AllowCredentials: false,
    }))

    if !checkOrMakeAdmin(app, password) {
        l.Panic("ERR: There is a problem when making user 0 (SUPER ADMIN)")
    }
    appMakeRouteHandler(app)
    const hardcodeAddress = "0.0.0.0:3000"
    if err := app.app.Listen(hardcodeAddress); err != nil {
        l.Fatal("ERR: Server failed to start: ", err)
    }
}
