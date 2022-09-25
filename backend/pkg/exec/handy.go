package exec

import (
	"fmt"
	// "net/url"
	"strings"
	"errors"
)

//Handles the error when called
func HandleErr(err error) {
	fmt.Printf("Found error: \n%v\n", err.Error())
}

//ToDo:
// do this with []interface{}
func RemoveElements(array []OnlineUserData, index int) ([]OnlineUserData){
	var returnArray []OnlineUserData
	for index2, element := range array {
		if index != index2 {
			returnArray = append(returnArray, element)
		}
	}

	return returnArray
}

//From Jacob's (me) Piscine-Go repository with some added twists
func SortAlpha(argArr []string, allUsers []OnlineUserData) []OnlineUserData {
	// strings.ToLower(str)
	argTotal := len(argArr)
	var tempReplace string
	var tempReplaceData OnlineUserData
	var brLoop bool = false
	for i := 1; i < argTotal; i++ {
		if strings.ToLower(argArr[i]) < strings.ToLower(argArr[i-1]) {
			tempReplace = argArr[i-1]
			argArr[i-1] = argArr[i]
			argArr[i] = tempReplace

			tempReplaceData = allUsers[i-1]
			allUsers[i-1] = allUsers[i]
			allUsers[i] = tempReplaceData

			brLoop = false
		}
		if i == argTotal-1 {
			if brLoop == true {
				break
			} else {
				i = 0
				brLoop = true
			}
		}
	}

	return allUsers
}

// type myError struct{}

// func (m *myError) error() string {
// 	return s
// }

func CreateErr(s string) error {
	// https://www.digitalocean.com/community/tutorials/creating-custom-errors-in-go
	return errors.New(s)
}

func FilterUserData(slice interface{}, f func(interface{}) bool) []UserData {
	returnSlice := make([]UserData, 0)

	for _, v := range slice.([]UserData) {
		if f(v) {
			returnSlice = append(returnSlice, v)
		}
	}
	return returnSlice
}

// ToDo: less hardcode
// func QueryData(r *http.Request) (_, error) {
// 	requestUrl := r.URL.RawQuery

// 		m, err := url.ParseQuery(requestUrl)
// 		if err != nil {
// 			HandleErr(err)
// 			w.WriteHeader(419)
// 			return
// 		}
// 		if len(m["userId"]) == 0 {
// 			w.WriteHeader(419)
// 			return
// 		}
// 		userId := m["userId"][0]
// }