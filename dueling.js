/**
 *                                   FV/Halcyon Dueling
 *                              Copyright (C) 2023 halcyonXT
 *
 *        This program/code is owned by halcyonXT and is protected by copyright laws.
 *      Unauthorized use, copying, or distribution of this code is strictly prohibited.
 * 
 *                           Contact - halcyonxt1987@gmail.com
 */

this.options = {
  root_mode: "",
  map_name: "Dueling",
  max_players: 12,
  starting_ship: 101,
  map_size: 100,
  speed_mod: 1.2,
  max_level: 1,
  weapons_store: false,
  soundtrack: "warp_drive.mp3",
  custom_map: "",
};

let sessionMemory = {
    admins: [],
    chatChannels: [
        {
            parties: ["global"],
            messages: []
        }
    ]
}

let staticMemory = {
    retractableComponentIDs: ["mainControlsBackground"],
    layout: ['qwertyuiop'.split(''),'asdfghjkl'.split(''),'zxcvbnm'.split('')],
    layoutString: 'qwertyuiopasdfghjklzxcvbnm'
}


const determineType = (ship) => sessionMemory.admins.includes(ship.name) ? "admin" : "regular"

this.event = function (event, game) {
    switch (event.name) {
        case "ship_spawned":
            if (event.ship != null) {
                event.ship.chatOpen = false
                event.ship.draftMessage = ""
                event.ship.chatTargetID = -1
                event.ship.dashboardOpen = false
                renderExpandedUI(event.ship, determineType(event.ship));
            }
            break;
        case "ui_component_clicked":
            var component = event.id;
            if (component == "expandButton") {
                event.ship.isUIExpanded
                ?
                renderRetractedUI(event.ship)
                :
                renderExpandedUI(event.ship, determineType(event.ship))
            }
            if (component == "showShipTree") {
                renderShipTree(event.ship)
            }
            if (component == "showDashboard") {
                renderDashboard(event.ship, game)
            }
            if (component.startsWith("channel_")) {
                handleOpenChat(event.ship, Number(component.split("_")[1]), game)
            }
            if (component.startsWith("key_")) {
                echo("PRESSED KEY")
                handleDraftChange(event.ship, component.split("_")[1], game)
            }
            if (component == "sendMessage") {
                handleSendMessage(event.ship)
            }
            if (component == "closeDashboard") {
                echo('CLOSE EVENT REGISTERED - TRIGGER [1]')
                closeDashboard(event.ship, game)
            }
            if (component == "back_chat") {
                closeChat(event.ship, game)
            }
            break;
    }
};

const handleDraftChange = (ship, key, game) => {
    function removeLastCharacter(str) {
        if (str === '') {
          return '';
        } else {
          return str.slice(0, -1);
        }
    }
    switch (key) {
        case "space":
            ship.draftMessage = ship.draftMessage + " "
            break
        case "backspace":
            ship.draftMessage = removeLastCharacter(ship.draftMessage)
            break
        default:
            ship.draftMessage = ship.draftMessage + key
    }
    echo(key)
    echo(ship.draftMessage)
    echo("GOT TO IT")
    ship.setUIComponent({
        id: "typingSpace",
        position: [20, 60, 50, 5],
        visible: true,
        clickable: false,
        components: [
            {type:"box", position: [0, 0, 100, 100], fill: "#00000070", stroke:"#FFFFFF50"},
            {type:"text",position: [0,0,100,100],color: "#FFF",value: ship.draftMessage,align:"left"},
        ]
    })
}

const handleSendMessage = (ship) => {
    if (ship.draftMessage === "") {return}
    let targets = [ship.id, ship.chatTargetID]
    let chatIndex = fetchChat(targets[0], targets[1])
    console.log("SEND MESSAGE VARS:")
    console.log(targets)
    console.log(chatIndex)
    console.log(sessionMemory.chatChannels[chatIndex])
    sessionMemory.chatChannels[chatIndex].messages.length === 6 && sessionMemory.chatChannels[chatIndex].messages.shift()
    sessionMemory.chatChannels[chatIndex].messages.push({
        sentBy: Math.min(ship.id, ship.chatTargetID) === ship.id ? 0 : 1,
        message: ship.draftMessage
    })
    ship.draftMessage = ""
    ship.setUIComponent({
        id: "typingSpace",
        position: [20, 60, 50, 5],
        visible: true,
        clickable: false,
        components: [
            {type:"box", position: [0, 0, 100, 100], fill: "#00000070", stroke:"#FFFFFF50"},
            {type:"text",position: [0,0,100,100],color: "#FFF",value: ship.draftMessage,align:"left"},
        ]
    })
    renderMessages(targets[0], targets[1])
}

const handleOpenChat = (initiator, targetID, game) => {
    initiator.chatTargetID = targetID
    initiator.draftMessage = ""
    initiator.chatOpen = true
    const renderKeyboard = () => {
        for (let i = 0; i < staticMemory.layout.length; i++) {
            for (let j = 0; j < staticMemory.layout[i].length; j++) {
                //echo(`i: ${i} | j: ${j} | current: ${staticMemory.layout[i][j]}`)
                const X_OFFSET = i == 0 ? 0 : i == 1 ? 2 : 4
                echo(`KEY ID: key_${staticMemory.layout[i][j]}`)
                initiator.setUIComponent({
                    id: `key_${staticMemory.layout[i][j]}`,
                    position: [20 + X_OFFSET + (j * 6), 65 + (i * 5), 6, 5],
                    visible: true,
                    shortcut: staticMemory.layout[i][j].toUpperCase(),
                    clickable: true,
                    components: [
                        {type:"box", position: [0, 0, 100, 100], fill: "#FFFFFF50", stroke:"#FFFFFF50"},
                        {type:"text",position: [0,0,100,100],color: "#FFF",value:staticMemory.layout[i][j],align:"center"},
                    ]
                })
            }
        }
        initiator.setUIComponent({
            id: "key_space",
            position: [30, 80, 30, 5],
            visible: true,
            shortcut: " ",
            clickable: true,
            components: [
                {type:"box", position: [0, 0, 100, 100], fill: "#FFFFFF50", stroke:"#FFFFFF50"},
            ]
        })
        initiator.setUIComponent({
            id: "typingSpace",
            position: [20, 60, 50, 5],
            visible: true,
            clickable: false,
            components: [
                {type:"box", position: [0, 0, 100, 100], fill: "#00000070", stroke:"#FFFFFF50"},
                {type:"text",position: [0,0,100,100],color: "#FFF",value: initiator.draftMessage,align:"left"},
            ]
        })
        initiator.setUIComponent({
            id: "key_backspace",
            position: [70, 60, 5, 5],
            visible: true,
            clickable: true,
            components: [
                {type:"box", position: [0, 0, 100, 100], fill: "#FFFFFF50", stroke:"#FFFFFF50"},
                {type:"text",position: [0,0,100,100],color: "#FFF",value:"↩",align:"center"},
            ]
        })
        initiator.setUIComponent({
            id: "sendMessage",
            position: [75, 60, 5, 5],
            visible: true,
            clickable: true,
            components: [
                {type:"box", position: [0, 0, 100, 100], fill: "#FFFFFF50", stroke:"#FFFFFF50"},
                {type:"text",position: [0,0,100,100],color: "#FFF",value:"➤",align:"center"},
            ]
        })
    }
    for (let i = 0; i < game.ships.length; i++) {
        initiator.setUIComponent({id: `channel_${game.ships[i].id}`, visible: false})
        initiator.setUIComponent({id: `player_${game.ships[i].id}`, visible: false})
    }
        initiator.setUIComponent({
            id:"back_chat",
            position:[72, 17, 4, 3],
            clickable: true,
            visible: true,
            components: [
                {type:"box", position: [0, 0, 100, 100], fill: "#20202050", stroke:"#FFFFFF50"},
                {type:"text",position: [0,0,100,100],color: "#FFF",value:"←",align:"center"},
            ]
        })
        initiator.setUIComponent({
            id:"chat_player_indicator",
            position:[22, 17, 45, 3],
            clickable: false,
            visible: true,
            components: [
                {type: "text", position: [0,0,100,100], color: "#FFF", value: `Chatting with: ${game.ships[fetchShip(targetID)].name}`, align: "left"}
            ]
        })
    renderKeyboard();
    echo(fetchChat(initiator.id, targetID))
    fetchChat(initiator.id, targetID) !== -1
    ?
    renderMessages(initiator.id, targetID)
    :
    sessionMemory.chatChannels.push({
        parties: [initiator.id, targetID],
        messages: []
    })
}

const fetchChat = (id1, id2) => sessionMemory.chatChannels.findIndex(el => el.parties !== undefined && el.parties.includes(id1) && el.parties.includes(id2))
const fetchShip = (id) => game.ships.findIndex(el => el.id === id)

const renderMessages = (id1, id2) => {
    echo("RENDERING")
    let targets = [fetchShip(id1), fetchShip(id2)]
    const returnOtherTarget = (exc) => {
        for (let i of targets) {if (i !== targets[exc]) {return i}}
    }
    let chat = sessionMemory.chatChannels[fetchChat(id1, id2)]
    console.log(targets)
    console.log(chat)
    for (let i = 0; i < 2; i++) {
        targets = [fetchShip(id1), fetchShip(id2)]
        echo('I LOOP: ' + i)
        for (let j = 0; j < chat.messages.length; j++) {
            echo('J LOOP')
            echo(`i: ${i} | j: ${j} | check: ${game.ships[targets[i]] ? "EXISTS" : "DOESNT EXIST"}`)
            console.log(game.ships[targets[i]])
            if (game.ships[targets[i]].chatTargetID == game.ships[returnOtherTarget(i)].id) {
                //let messageType = ((Math.min(id1, id2) === (i == 0 ? id1 : id2) && chat.messages[j].sentBy == 0) || (Math.min(id1, id2) === (i == 0 ? id1 : id2) && chat.messages[j].sentBy !== 0)) ? "user" : "foreign" 
                let messageType = Math.min(game.ships[targets[i]].id, game.ships[returnOtherTarget(i)].id) == game.ships[targets[i]].id ? chat.messages[j].sentBy == 0 ? "user" : "foreign" : chat.messages[j].sentBy == 1 ? "user" : "foreign"
                game.ships[targets[i]].setUIComponent({
                    id: `message_${j}`,
                    position: [22, 21 + (j * 6.66), 56, 5.2],
                    clickable: false,
                    visible: game.ships[targets[i]].chatOpen,
                    components: [
                        {type:"box", position: [0, 0, 100, 100], fill: messageType == "foreign" ? "#00FF0060" : "#0000FF60", stroke:"#FFFFFF50"},
                        {type:"text",position: [2,2, 96, 96],color: "#FFF", value: chat.messages[j].message, align: messageType == "foreign" ? "left" : "right"},
                    ]
                })
            }
        }
    }
}

const renderDashboard = (ship, game) => {
    if (ship.chatOpen) {return}
    ship.dashboardOpen = true
    for (let i = 0, Y_OFFSET = 20; i < game.ships.length; i++) {
        if (game.ships[i].id === ship.id) {continue}
        ship.setUIComponent({
            id:`channel_${game.ships[i].id}`,
            position: [73, Y_OFFSET, 7, 5],
            clickable: true,
            visible: true,
            components: [
                {type:"box", position: [0, 0, 100, 100], fill: "#FFFFFF50", stroke:"#FFFFFF50"},
                {type:"text",position: [5,0,90,100],color: "#FFF",value:"Chat",align:"center"},
            ]
        })
        ship.setUIComponent({
            id:`player_${game.ships[i].id}`,
            position: [20, Y_OFFSET, 60, 5],
            clickable: false,
            visible: true,
            components: [
                {type: "player", id: game.ships[i].id, position: [1,10,70,80],color: "#FFF"},
                {type:"box", position: [0, 0, 100, 100], fill: "#24242450"},
                {type:"box", position: [0, 99, 100, 1], fill: "#FFFFFF50"},
                {type:"box", position: [0, 0, 100, 1], fill: "#FFFFFF50"}
            ]
        })
        Y_OFFSET += 5
    }
    ship.setUIComponent({
        id:"dashboard",
        position:[20, 20, 60, 60],
        clickable: false,
        visible: true,
        components: [
            {type:"box", position: [0, 0, 100, 100], fill: "#24242450"},
            {type:"box", position: [0, 99.5, 100, 0.5], fill: "#FFFFFF50"},
            {type:"box", position: [0, 0, 100, 0.5], fill: "#FFFFFF50"}
        ]
    })
    ship.setUIComponent({
        id:"closeDashboard",
        position:[76, 17, 4, 3],
        clickable: true,
        visible: true,
        components: [
            {type:"box", position: [0, 0, 100, 100], fill: "#FF000050", stroke:"#FFFFFF50"},
            {type:"text",position: [0,0,100,100],color: "#FFF",value:"✖",align:"center"},
        ]
    })
    ship.setUIComponent({
        id:"navbar",
        position: [20, 17, 60, 3],
        clickable: false,
        visible: true,
        components: [
            {type:"box", position: [0, 0, 100, 100], fill: "#20202030", stroke:"#FFFFFF50"},
        ]
    })
}

const closeDashboard = (ship, game) => {
    echo('[1]: TRIGGERED')
        ship.dashboardOpen = false
        ship.chatOpen = false
        let elementsToClose = ['dashboard', 'typingSpace', 'sendMessage', 'key_space', 'key_backspace', 'closeDashboard', 'navbar', 'back_chat', 'chat_player_indicator']
        for (let letter of staticMemory.layoutString.split('')) {
            elementsToClose.push(`key_${letter}`)
        }
        for (let ship of game.ships) {
            elementsToClose.push(`player_${ship.id}`)
            elementsToClose.push(`channel_${ship.id}`)
        }
        for (let i = 0; i <= 6; i++) {elementsToClose.push(`message_${i}`)} 
        for (let component of elementsToClose) {
            ship.setUIComponent({
                id: component,
                visible: false
            })
        }
    echo('[1]: FINISHED')
}

const closeChat = (ship, game) => {
    ship.chatOpen = false
    let elementsToClose = ['typingSpace', 'sendMessage', 'key_space', 'key_backspace', 'back_chat', 'chat_player_indicator']
    for (let letter of staticMemory.layoutString.split('')) {
        elementsToClose.push(`key_${letter}`)
    }
    for (let i = 0; i <= 6; i++) {elementsToClose.push(`message_${i}`)} 
    for (let component of elementsToClose) {
        ship.setUIComponent({
            id: component,
            visible: false
        })
    }
    renderDashboard(ship, game)
}

const renderShipTree = (ship) => {
    ship.setUIComponent({
        id:"shipTree",
        position:[20, 20, 60, 60],
        clickable: false,
        visible: true,
        components: [
            {type:"box", position: [0, 0, 100, 100], fill: "#24242450"},
            {type:"box", position: [0, 99, 100, 1], fill: "#FFFFFF50"},
            {type:"box", position: [0, 0, 100, 1], fill: "#FFFFFF50"}
        ]
    })
}

const renderExpandedUI = (ship, type) => {
    ship.isUIExpanded = true
    switch (type) {
        case "admin":
            break
        case "regular":
            const BACKGROUND_WIDTH = 50
            const BUTTONS = [
                {label: "Select Ship", id: "showShipTree"},
                {label: "Dashboard", id: "showDashboard"},
                {label: "Adjust stats", id: "adjustStats"},
                {label: "More soon..", id: "fffff"},
            ]
            staticMemory.retractableComponentIDs = [...staticMemory.retractableComponentIDs, ...BUTTONS.map(item => item.id)]
            for (let i = 0, 
                REF_WIDTH = BACKGROUND_WIDTH - BUTTONS.length, 
                X_OFFSET = (100 - BACKGROUND_WIDTH) / 2 + .5, 
                BUTTON_WIDTH = REF_WIDTH / BUTTONS.length; 
                i < BUTTONS.length; 
                i++, 
                X_OFFSET += BUTTON_WIDTH + 1) {
                ship.setUIComponent({
                    id: BUTTONS[i].id,
                    position:[X_OFFSET, 1, BUTTON_WIDTH, 6],
                    clickable: true,
                    visible: true,
                    components: [
                        {type:"box", position: [0, 0, 100, 100], fill: "#24242450",stroke:"#FFFFFF50",width:3},
                        {type: "text",position: [5,0,90,100],color: "#FFF",value: BUTTONS[i].label,align:"center"},
                    ]
                })
            }
            ship.setUIComponent({
                id:"mainControlsBackground",
                position:[25, 0, BACKGROUND_WIDTH, 8],
                clickable: false,
                visible: true,
                components: [
                    {type:"box", position: [0, 0, 100, 100], fill: "#24242450"},
                    {type:"box", position: [0, 98, 100, 2], fill: "#FFFFFF50"}
                ]
            })
            ship.setUIComponent({
                id:"expandButton",
                position:[71,8.5,4,4],
                clickable: true,
                shortcut: "X",
                visible: true,
                components: [
                  { type:"box",position:[0,0,100,100],fill:"#24242450",stroke:"#FFFFFF50",width:3},
                  { type: "text",position: [0,15,100,70],color: "#FFF",value: "↑"},
                ]
            })
            break
    }
    
}

const renderRetractedUI = (ship) => {
    ship.isUIExpanded = false
    for (let id of staticMemory.retractableComponentIDs) {
        ship.setUIComponent({id, visible: false})
    }
    ship.setUIComponent({
        id:"expandButton",
        position:[71,1,4,4],
        clickable: true,
        shortcut: "X",
        visible: true,
        components: [
          { type:"box",position:[0,0,100,100],fill:"#24242450",stroke:"#FFFFFF50",width:3},
          { type: "text",position: [0,15,100,70],color: "#FFF",value: "↓"},
        ]
    })
}