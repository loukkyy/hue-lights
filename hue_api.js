// const HOST = "http://192.168.1.34"
// const USERNAME = "Bj65ugaq7VjkRgqgBR2y5TRxNlkqLqao4zsu85SG"

const URL = "/api"
export function createNewUser(host, deviceType) {
  return fetch(`http://${host}${URL}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ devicetype: deviceType }),
  })
}

export function setLightState(host, username, lightId, state) {
  return fetch(`http://${host}${URL}/${username}/lights/${lightId}/state`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(state),
  })
}

export function getLightsInfo(host, username) {
  return fetch(`http://${host}${URL}/${username}/lights`)
    .then((response) => response.json())
    .then((data) => data)
}

export function getLightInfo(host, username, lightId) {
  return fetch(`http://${host}${URL}/${username}/lights/${lightId}`)
    .then((response) => response.json())
    .then((data) => data)
}

export function getBridgeIp() {
  return fetch("https://discovery.meethue.com/")
    .then((response) => response.json())
    .then((data) => data)
}

export function getGroups(host, username) {
  return fetch(`http://${host}${URL}/${username}/groups`)
    .then((response) => response.json())
    .then((data) => data)
}
