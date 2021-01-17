import {
  setLightState,
  getLightsInfo,
  getBridgeIp,
  createNewUser,
  getGroups,
  getLightInfo,
} from "./hue_api.js"
const APP_NAME = "HUE_LIGHTS"
const HOST = getBridgeInfo()[0].internalipaddress
// get username
// const USERNAME = "Bj65ugaq7VjkRgqgBR2y5TRxNlkqLqao4zsu85SG"
let username = null
let lightsInfo = null
let groupsInfo = null

const bridgePopUp = document.querySelector("#bridge-pop-up")
const overlay = document.querySelector("#overlay")

initialize()

async function initialize() {
  username = getUsernameFromLocalStorage()
  if (username != null) {
    // get lights info
    await loadLights()
    // get groups info
    await loadGroups()
  } else {
    showBridgePopUp()
  }
}

async function loadLights() {
  lightsInfo = await getLightsInfo(HOST, username)
  renderLights()
}

async function loadGroups() {
  groupsInfo = await getGroups(HOST, username)
  // render groups
  if (groupsInfo != null) {
    Object.keys(groupsInfo).forEach((groupId) =>
      renderGroupButton(groupsInfo[groupId], groupId)
    )
  }
  // group "all"
  const groupAll = document.querySelector(".group-all")
  groupAll.addEventListener("click", (e) => {
    const dashboard = document.querySelector(".dashboard")
    const groupButtons = dashboard.querySelector("light-group-button")
    groupButtons.forEach((groupButton) =>
      groupButton.classList.remove("active")
    )
    groupAll.classList.add("active")
    renderLights()
  })
}
function renderLights() {
  if (lightsInfo != null) {
    Object.keys(lightsInfo).forEach((lightId) =>
      renderLightButton(lightsInfo[lightId], lightId)
    )
    const groupAll = document.querySelector(".group-all")
    groupAll.dataset.lightIds = Object.keys(lightsInfo)
  }
}
function renderLightButton(light, lightId) {
  const container = document.querySelector(".lights-container")
  const lightButtonTemplate = document.querySelector("#light-button-template")
  const clone = lightButtonTemplate.content.cloneNode(true)
  const lightButton = clone.querySelector(".light-button")
  lightButton.dataset.lightId = lightId
  const hue = Math.floor((light.state.hue / 65535) * 360)

  if (light.state.on === true) {
    lightButton.classList.add("on")
  }

  const lightName = lightButton.querySelector("#light-name")
  lightName.innerText = light.name
  const slider = lightButton.querySelector(".slider")
  slider.value = hue
  container.append(lightButton)
}

function renderGroupButton(group, groupId) {
  const dashboard = document.querySelector(".dashboard")
  const groupButton = document.createElement("div")
  groupButton.classList.add("light-group-button")
  groupButton.dataset.groupId = groupId
  groupButton.dataset.lightIds = group.lights
  groupButton.innerText = group.name
  dashboard.append(groupButton)
}

function showBridgePopUp() {
  bridgePopUp.classList.add("open")
  overlay.classList.add("open")
}

const closeButton = document.querySelector("#bridge-pop-up-close")
closeButton.addEventListener("click", (e) => {
  let deviceType = APP_NAME
  createNewUser(HOST, deviceType)
    .then((response) => response.json())
    .then((data) => {
      data = data[0]
      // check if button has been pressed in the last 30sec
      if (data.success != null) {
        return data.success.username
      } else if (data.error != null && data.error.type === 101) {
        return null
      } else {
        return null
      }
    })
    .then((username) => {
      if (username != null) {
        bridgePopUp.classList.remove("open")
        overlay.classList.remove("open")
        saveUsernameToLocalStorage(username)
        initialize()
      }
    })
})

function convertHue(hue) {
  return Math.floor((hue / 360) * 65535)
}

function saveBridgeInfo(bridgeInfo) {
  localStorage.setItem("bridgeInfo", JSON.stringify(bridgeInfo))
}
function getBridgeInfo() {
  let bridgeInfo = localStorage.getItem("bridgeInfo")
  if (bridgeInfo == null) {
    getBridgeIp()
      .then((data) => {
        bridgeInfo = data
        saveBridgeInfo(data)
      })
      .catch(console.log)
  }
  return JSON.parse(bridgeInfo)
}

function saveUsernameToLocalStorage(username) {
  localStorage.setItem("HUE_LIGHT_USERNAME", username)
}
function getUsernameFromLocalStorage() {
  return localStorage.getItem("HUE_LIGHT_USERNAME")
}

// add event listener on light buttons
document.addEventListener("click", (e) => {
  const lightButton = e.target.closest(".light-button")
  if (lightButton == null) return
  if (e.target.matches(".slider")) return
  const isOn = lightButton.classList.contains("on")
  const lightId = lightButton.dataset.lightId
  setLightState(HOST, username, lightId, { on: !isOn })
  lightButton.classList.toggle("on")
})

// add event listener on group buttons
document.addEventListener("click", (e) => {
  const dashboard = document.querySelector(".dashboard")
  const groupButtons = dashboard.querySelectorAll(".light-group-button")
  const lightsContainer = document.querySelector(".lights-container")
  if (!e.target.matches(".light-group-button")) return
  lightsContainer.innerHTML = ""
  const lightIds = e.target.dataset.lightIds.split(",")
  console.log(lightIds)
  lightIds.forEach((lightId) => {
    renderLightButton(lightsInfo[lightId], lightId)
  })
  console.log(groupButtons)
  groupButtons.forEach((groupButton) => groupButton.classList.remove("active"))
  e.target.classList.add("active")
})

// add event listener on sliders
document.addEventListener("input", (e) => {
  if (!e.target.matches(".slider")) return
  const lightButton = e.target.closest(".light-button")
  const lightId = lightButton.dataset.lightId
  const hue = convertHue(e.target.value)
  setLightState(lightId, { hue: hue })
})
