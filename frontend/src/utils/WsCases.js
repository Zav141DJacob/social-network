// import { mockNotifications } from "../pages/components/topbar"

import { ws2 } from "../pages/components/topbar"

export const FollowCase = (jsonData) => {
    console.log(jsonData)
    // mockNotifications.push(jsonData)
    ws2.send(JSON.stringify(jsonData))
}
