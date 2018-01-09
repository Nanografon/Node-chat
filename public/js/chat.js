window.onload = () => {
  let socket = io()
  let usernameElement = document.getElementById('username')
  let usersElement = document.getElementById('users')
  let messagesElement = document.getElementById('messages')
  let messageElement = document.getElementById('message')
  let submitBtn = document.getElementById('submitBtn')

  let users = []

  submitBtn.addEventListener('click', () => {
    let messageData = {
      username: usernameElement.value,
      message: messageElement.value
    }

    socket.emit('newMessage', messageData)

    messageElement.value = ''
  })

  socket.emit('getUsers')
  socket.emit('getHistory')

  socket.on('newMessageFromUser', addMessage)

  socket.on('changeMyUsername', (username) => {
    usernameElement.value = username
  })

  socket.on('changeUsername', (data) => {
    let index = users.indexOf(data.oldUsername)
    users.splice(index, 1, data.newUsername)
    printUsers()
  })

  socket.on('addNewUser', (username) => {
    users.push(username)
    printUsers()
  })

  socket.on('removeUser', (username) => {
    let index = users.indexOf(username)
    users.splice(index, 1)
    printUsers()
  })

  socket.on('history', messagesData => messagesData.reverse().forEach(addMessage))

  socket.on('users', activeUsers => {
    users = activeUsers
    printUsers()
  })

  function escape (html) {
    return String(html)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  function addMessage (data) {
    let date      = (new Date(data.date)).toLocaleString();
    let username  = escape(data.username);
    let content   = escape(data.content);
    let div       = document.createElement('div')
    div.className = 'box'

    div.innerHTML = `
      <article class="media">
        <div class="media-content">
          <div class="content">
            <p>
              <strong>${username}</strong> <small>${date}</small>
              <br>
              ${content}
            </p>
          </div>
        </div>
      </article>`

    messagesElement.insertBefore(div, messagesElement.firstChild || null)
  }

  function printUsers () {
    let html = ''

    users.forEach(username => {
      html += `<span class="tag">${username}</span>`
    })

    usersElement.innerHTML = html
  }
}