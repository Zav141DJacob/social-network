package exec

import (
	"fmt"
	"strings"
)

//Handles the error when called
func HandleErr(err error) {
	fmt.Printf("Found error: \n%v\n", err.Error())
}

func GetCategoryNames() ([]string, error){

	categoryList, err := FromCategories("", "")

	if err != nil {
		return nil, err
	}

	var returnStringArr []string
	for _, category := range categoryList {
		returnStringArr = append(returnStringArr, "has" + category.Title) 
	}

	return returnStringArr, nil
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