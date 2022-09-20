package exec

import (
	"log"
	"net/http"
	"encoding/json"
	"github.com/gorilla/websocket"
  "fmt"
)

// This article helped me a lot with this project:
// 	https://www.thepolyglotdeveloper.com/2016/12/create-real-time-chat-app-golang-angular-2-websockets/

type ClientManager struct {
    clients    map[idType]*websocket.Conn
    register   chan *Client
    unregister chan *Client
	groupChats map[idType](map[idType]*websocket.Conn)
}

type Client struct {
	id     idType
    socket *websocket.Conn
}

type idType int

var manager = ClientManager{
    register:   make(chan *Client),
    unregister: make(chan *Client),
    clients:    make(map[idType]*websocket.Conn),
	groupChats: make(map[idType](map[idType]*websocket.Conn)),
}

func WsSetup() error {
	categories, err := FromCategories("", "") 
	if err != nil {
		return err
	}
	for _, category := range categories {
		manager.groupChats[idType(category.CatId)] = make(map[idType]*websocket.Conn)
	}
	return nil
}

func (manager *ClientManager) start() {
    for {
        select {
        case conn := <-manager.register:

			members, err := FromGroupMembers("userId", conn.id)

			if err == nil && len(members) != 0 {
				for _, member := range members {
					manager.groupChats[idType(member.CatId)][conn.id] = conn.socket
				}
				log.Println(manager.groupChats)
			}

            manager.clients[conn.id] = conn.socket

        case conn := <-manager.unregister:
            if _, ok := manager.clients[conn.id]; ok {
                delete(manager.clients, conn.id)
            }
        }
    }
}

// ToDo:
// add Follow function to websocket

// ToDo:
//	think of a better name for this function
func (c *Client) reader(conn *websocket.Conn) {
	unregister := func() {
		manager.unregister <- c
		 conn.Close()
		 log.Println("Client Connection Terminated")
	}

	for {
		// reads the message from a clients connection
		messageType, p, err := c.socket.ReadMessage()

		if err != nil {
      		fmt.Println(err)
			unregister()
			return
		}


		type toClient struct {
			Message  string
			Sent	 bool
			SenderId idType
		}

		// Clients message should be a json {
		// 	message string
		// 	senderId float64
		// 	targetId float64
		// 	init bool
		// }
		var v map[string]interface{}
		json.Unmarshal([]byte(p), &v)

		mode := v["mode"]
		
		// registers the user with their ID
		switch mode.(string) {
		case "register":
			nickname := v["nickname"]
			user, err := FromUsers("nickname", nickname)

			if err != nil || len(user) == 0 {
				fmt.Println(err, user)
				unregister()
				return
			}

			c.id = idType(user[0].UserId)
			manager.register <- c
		case "groupMessage":
			message  := v["message"]
			targetId := v["targetId"]

			var to toClient
			to.Message = message.(string)
			to.Sent = false
			to.SenderId = c.id

			jsonTo, err := json.Marshal(to)
			if err != nil {
				break
			}
			//look through global variable clientArray
			//find targetId and write message to the senders and the targets connection
			
			target := idType(targetId.(float64))

			value, isValid := manager.groupChats[target]

			// If target's connection is valid then WriteMessage to their connection
			if isValid {
				err = value.WriteMessage(messageType, []byte(jsonTo))
				if err != nil {
					HandleErr(err)
				}
			}

			to.Sent = true

			jsonTo, err = json.Marshal(to)
			if err != nil {
				HandleErr(err)
				continue
			}

			Message(c.id, targetId, message)
			
			err = conn.WriteMessage(messageType,[]byte(jsonTo))

			if err != nil {
				HandleErr(err)
			}

		default:
			message  := v["message"]
			targetId := v["targetId"]

			var to toClient
			to.Message = message.(string)
			to.Sent = false
			to.SenderId = c.id

			jsonTo, err := json.Marshal(to)
			if err != nil {
				break
			}
			//look through global variable clientArray
			//find targetId and write message to the senders and the targets connection
			
			target := idType(targetId.(float64))

			value, isValid := manager.clients[target]

			// If target's connection is valid then WriteMessage to his connection
			if isValid {
				err = value.WriteMessage(messageType, []byte(jsonTo))
				if err != nil {
					HandleErr(err)
				}
			}

			to.Sent = true

			jsonTo, err = json.Marshal(to)
			if err != nil {
				HandleErr(err)
				continue
			}

			Message(c.id, targetId, message)
			
			err = conn.WriteMessage(messageType,[]byte(jsonTo))

			if err != nil {
				HandleErr(err)
			}
		}
	}
}

func WsEndpoint(w http.ResponseWriter, r *http.Request){

	go manager.start()
	
	connection, err := (&websocket.Upgrader{CheckOrigin: func(r *http.Request) bool { return true }}).Upgrade(w, r, nil)

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
	}

	client := &Client{id: 0, socket: connection}

	log.Println("Client Connection Established")
	client.reader(connection)
}
