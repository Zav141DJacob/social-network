package exec

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	// "strconv"

	"github.com/gorilla/websocket"
)

// This article helped me a lot with this project:
// 	https://www.thepolyglotdeveloper.com/2016/12/create-real-time-chat-app-golang-angular-2-websockets/

type ClientManager struct {
	clients       map[IdType]*websocket.Conn
	register      chan *Client
	unregister    chan *Client
	registerGroup chan *Client
	groupChats    map[IdType](map[IdType]*websocket.Conn)
}

type Client struct {
	id       IdType
	nickname string
	socket   *websocket.Conn
}

type IdType int

var Manager = ClientManager{
	register:   make(chan *Client),
	unregister: make(chan *Client),
	clients:    make(map[IdType]*websocket.Conn),
	groupChats: make(map[IdType](map[IdType]*websocket.Conn)),
}

func Empty(w http.ResponseWriter, r *http.Request) {

	connection, err := (&websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}).Upgrade(w, r, nil)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}

	conn := connection

	log.Println("Empty Client Connection Established")
	for {
		messageType, p, err := conn.ReadMessage()

		if err != nil {
			HandleErr(err)
			return
		}
		err = conn.WriteMessage(messageType, []byte(p))

		if err != nil {
			HandleErr(err)
		}
	}
	// client.reader(connection)

}
func WsSetup() error {
	categories, err := FromCategories("", "")
	if err != nil {
		return err
	}
	for _, category := range categories {
		Manager.groupChats[IdType(category.CatId)] = make(map[IdType]*websocket.Conn)
	}
	return nil
}

func (Manager *ClientManager) start() {
	for {
		select {
		case conn := <-Manager.register:

			members, err := FromGroupMembers("userId", conn.id)

			if err == nil && len(members) != 0 {
				for _, member := range members {
					Manager.groupChats[IdType(member.CatId)][conn.id] = conn.socket
				}
				log.Println(Manager.groupChats)
			}

			Manager.clients[conn.id] = conn.socket

		case conn := <-Manager.unregister:
			if _, ok := Manager.clients[conn.id]; ok {
				delete(Manager.clients, conn.id)
			}

		case conn := <-Manager.registerGroup:
			all, err := FromCategories("", "")

			if err != nil {
				// errCode = 500
				// ToDo: idk what to add here
			}
			Manager.groupChats[IdType(len(all))][conn.id] = conn.socket
		}
	}
}

// ToDo:
// add Follow function to websocket

// ToDo:
//	think of a better name for this function
func (c *Client) reader(conn *websocket.Conn) {
	unregister := func() {
		Manager.unregister <- c
		conn.Close()
		log.Println("Client Connection Terminated")
	}

	for {
		// reads the message from a clients connection
		messageType, p, err := c.socket.ReadMessage()

		if err != nil {
			HandleErr(err)
			unregister()
			return
		}

		var v map[string]interface{}
		json.Unmarshal([]byte(p), &v)

		mode := v["mode"].(string)

		// registers the user with their ID
		switch mode {
		case "register":
			nickname := v["nickname"]
			user, err := FromUsers("nickname", nickname)

			if err != nil || len(user) == 0 {
				fmt.Println(err, user)
				unregister()
				return
			}

			c.id = IdType(user[0].UserId)
			c.nickname = user[0].Nickname
			Manager.register <- c
		case "groupMessage":
			type toClient struct {
				Message    string
				Sent       bool
				TargetId   IdType
				SenderId   IdType
				SenderName string
				Type       string
			}

			message := v["message"]
			targetId := v["targetId"]

			var to toClient
			to.Message = message.(string)
			to.Sent = false
			to.TargetId = IdType(targetId.(float64))
			to.SenderId = c.id
			to.SenderName = c.nickname
			to.Type = mode

			jsonTo, err := json.Marshal(to)
			if err != nil {
				break
			}
			// s, err := strconv.ParseFloat(fmt.Sprintf("%v",targetId), 64)
			// senderId, senderName, message, targetId

			GroupMessage(to.SenderId, to.SenderName, to.Message, targetId)

			//look through global variable clientArray
			//find targetId and write message to the senders and the targets connection

			target := to.TargetId

			value, isValid := Manager.groupChats[target]

			// If target's connection is valid then WriteMessage to their connection
			if isValid {
				for _, v := range value {
					// value2, isValid := v
					if v != conn {
						err = v.WriteMessage(messageType, []byte(jsonTo))
						if err != nil {
							HandleErr(err)
						}
					}
				}
			}

			to.Sent = true

			jsonTo, err = json.Marshal(to)
			if err != nil {
				HandleErr(err)
				continue
			}

			Message(c.id, targetId, message)

			err = conn.WriteMessage(messageType, []byte(jsonTo))

			if err != nil {
				HandleErr(err)
			}
		case "registerGroup":
			type toClient struct {
				CategoryId int
				ErrCode    int
			}

			to := toClient{}

			title := v["title"]
			description := v["description"]
			isPublic := v["isPublic"]

			var errCode int
			category, err := FromCategories("title", title)

			if err != nil {
				HandleErr(err)
				break
			}

			errCode = 409

			if len(category) == 0 {

				err = InsertCategory(title, description, int(c.id), isPublic)
				if err != nil {
					HandleErr(err)
					break
				}
				errCode = 201
				category, err = FromCategories("title", title)

				if err != nil {
					HandleErr(err)
					break
				}
				to.CategoryId = category[0].CatId
				to.ErrCode = errCode

				err = Post(1, to.CategoryId, "First post in "+title.(string), "Welcome to \""+title.(string)+"\"")
				if err != nil {
					HandleErr(err)
				}

				jsonTo, err := json.Marshal(to)

				if err != nil {
					HandleErr(err)
					to.ErrCode = 500
					break
				}

				err = conn.WriteMessage(messageType, []byte(jsonTo))

				if err != nil {
					HandleErr(err)
				}
				Manager.registerGroup <- c

			} else {
				to.ErrCode = 409
			}

			jsonTo, err := json.Marshal(to)

			if err != nil {
				HandleErr(err)
				to.ErrCode = 500
				break
			}

			err = conn.WriteMessage(messageType, []byte(jsonTo))

			if err != nil {
				HandleErr(err)
			}
		case "follow":
			type toClient struct {
				Nickname   string
				UserId     int
				UserAvatar string
				Type       string
				Category   string
			}
			targetId := v["targetId"]
			fmt.Println(targetId)
			user, err := FromUsers("userId", c.id)
			if err != nil {
				HandleErr(err)
				break
			}

			target, err := FromUsers("userId", targetId)
			if err != nil {
				HandleErr(err)
				break
			}

			if !target[0].IsPrivate {
				err = Follow(c.id, targetId)
				if err != nil {
					HandleErr(err)
					break
				}
				return
			}

			err = Notify(user, target, 0, mode)
			if err != nil {
				HandleErr(err)
				break
			}

			// err = Follow(c.id, targetId)
			// if err != nil {
			// 	HandleErr(err)
			// 	break
			// }

			to := toClient{}
			to.Type = mode
			to.Nickname = user[0].Nickname
			to.UserId = user[0].UserId
			to.UserAvatar = user[0].Avatar

			jsonTo, err := json.Marshal(to)
			if err != nil {
				HandleErr(err)
				return
			}
			// targetId := IdType(target[0].UserId)

			value, isValid := Manager.clients[IdType(target[0].UserId)]

			if isValid {
				err = value.WriteMessage(messageType, []byte(jsonTo))
				if err != nil {
					HandleErr(err)
				}
			}
		case "join":
			type toClient struct {
				CategoryId int
				ErrCode    int
			}

			to := toClient{}

			catId := v["catId"]
			nickname := v["nickname"]

			category, err := FromCategories("catId", catId)
			if err != nil {
				HandleErr(err)
				break
			}

			target, err := FromUsers("userId", category[0].UserId)
			if err != nil {
				HandleErr(err)
				break
			}

			user, err := FromUsers("nickname", nickname)
			if err != nil {
				HandleErr(err)
				break
			}

			err = Notify(user, target, catId, mode)
			if err != nil {
				HandleErr(err)
				break
			}

			if len(category) == 0 {
				jsonTo, err := json.Marshal(to)

				if err != nil {
					HandleErr(err)
					to.ErrCode = 500
					break
				}

				err = conn.WriteMessage(messageType, []byte(jsonTo))

				if err != nil {
					HandleErr(err)
				}
				Manager.registerGroup <- c

			} else {
				to.ErrCode = 409
			}

			jsonTo, err := json.Marshal(to)

			if err != nil {
				HandleErr(err)
				to.ErrCode = 500
				break
			}

			err = conn.WriteMessage(messageType, []byte(jsonTo))

			if err != nil {
				HandleErr(err)
			}

		case "unfollow":
			targetId := v["targetId"]
			UnFollow(c.id, targetId)

			////////////////////////////////////////////////////////////////////////////
			//copied from registerGroup case, not adapted yet
		case "createEvent":
			type toClient struct {
				CategoryId int
				ErrCode    int
			}

			to := toClient{}

			title := v["title"]
			description := v["description"]

			var errCode int
			category, err := FromCategories("title", title)

			if err != nil {
				HandleErr(err)
				break
			}

			errCode = 409

			if len(category) == 0 {

				// err = InsertCategory(title, description, int(c.id), isPublic)
				if err != nil {
					HandleErr(err)
					break
				}
				errCode = 201
				category, err = FromCategories("title", title)

				if err != nil {
					HandleErr(err)
					break
				}
				to.CategoryId = category[0].CatId
				to.ErrCode = errCode

				err = Post(1, to.CategoryId, "First post in "+title.(string), "Welcome to \""+title.(string)+"\"")
				if err != nil {
					HandleErr(err)
				}

				jsonTo, err := json.Marshal(to)

				if err != nil {
					HandleErr(err)
					to.ErrCode = 500
					break
				}

				err = conn.WriteMessage(messageType, []byte(jsonTo))

				if err != nil {
					HandleErr(err)
				}
				Manager.registerGroup <- c

			} else {
				to.ErrCode = 409
			}

			jsonTo, err := json.Marshal(to)

			if err != nil {
				HandleErr(err)
				to.ErrCode = 500
				break
			}

			err = conn.WriteMessage(messageType, []byte(jsonTo))

			if err != nil {
				HandleErr(err)
			}

		default:
			type toClient struct {
				Message  string
				Sent     bool
				SenderId IdType
				Type     string
			}

			message := v["message"]
			targetId := v["targetId"]

			var to toClient
			to.Message = message.(string)
			to.Sent = false
			to.SenderId = c.id
			to.Type = mode

			jsonTo, err := json.Marshal(to)
			if err != nil {
				break
			}
			//look through global variable clientArray
			//find targetId and write message to the senders and the targets connection

			target := IdType(targetId.(float64))

			value, isValid := Manager.clients[target]

			// If target's connection is valid then WriteMessage to his connection
			if isValid {
				err = value.WriteMessage(messageType, []byte(jsonTo))
				if err != nil {
					HandleErr(err)
				}
			}

			to.Sent = true
			to.Type = mode

			jsonTo, err = json.Marshal(to)
			if err != nil {
				HandleErr(err)
				continue
			}

			Message(c.id, targetId, message)

			err = conn.WriteMessage(messageType, []byte(jsonTo))

			if err != nil {
				HandleErr(err)
			}
		}
	}
}

func WsEndpoint(w http.ResponseWriter, r *http.Request) {

	go Manager.start()

	connection, err := (&websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}).Upgrade(w, r, nil)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}

	client := &Client{id: 0, socket: connection}

	client.reader(connection)
}
