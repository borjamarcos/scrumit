const winston = require('winston')
const { User } = require('../models/').models
const helpers = require('../helpers/')
const moment = require('moment')

const formatTasksData = function (tasks) {
  let text = `There are *${tasks.length} tasks*:\n`
  tasks.forEach((t) => {
    if (t.finished) {
      text += '~'
    }
    text += `• ${moment(t.c_at).fromNow()}: ${t._id} - ${t.title}\n`
    if (t.finished) {
      text += '~'
    }
  })
  return text
}

class TodoList {
  constructor (bot, config) {
    winston.info('[TODO] Configuring')
    this.bot = bot
  }

  sendMessage (user, text) {
    helpers.getUserInfo(user).then((username) => {
      winston.info(`[TODO] sending message to ${username} with '${text}'`)
      this.bot.postMessageToUser(username, text)
    })
  }

  handle (data) {
    if (data.text.startsWith('todo show')) {
      winston.debug(`[TODO] SHOW command ${JSON.stringify(data)}`)
      this.show(data)
    } else if (data.text.startsWith('todo add')) {
      winston.debug(`[TODO] ADD command ${JSON.stringify(data)}`)
      this.add(data)
    } else if (data.text.startsWith('todo remove')) {
      winston.debug(`[TODO] REMOVE command ${JSON.stringify(data)}`)
      this.remove(data)
    } else {
      winston.info(`Unknown command ${JSON.stringify(data)}`)
      this.sendMessage(data.user, 'Unknown command!!')
    }
  }

  listCommands () {
    return ['todo']
  }

  show (data) {
    const otherUser = data.text.replace('todo show', '').trim()
    if (otherUser !== '') {
      data.otherUser = otherUser
    }

    User.getTasks(data, (err, tasks) => {
      if (err) {
        winston.error(err)
        this.sendMessage(data.user, 'There was an error showing the list of tasks. Try again later')
      } else {
        const formatted = formatTasksData(tasks)
        this.sendMessage(data.user, formatted)
      }
    })
  }

  add (data) {
    data.text = data.text.replace('todo add ', '')
    User.addTask(data, (err, task) => {
      if (err) {
        this.sendMessage(data.user, 'There was an error adding a new task. Try again later')
      } else {
        this.sendMessage(data.user, 'Cool, task added!')
      }
    })
  }

  remove (data) {
    data.text = data.text.replace('todo remove ', '')
    User.removeTask(data, (err) => {
      if (err) {
        this.sendMessage(data.user, 'There was an error removing the task. Try again later')
      } else {
        this.sendMessage(data.user, 'Cool, task removed!')
      }
    })
  }
}

module.exports = TodoList
