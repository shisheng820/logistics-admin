const Mock = require('mockjs')

const List = []
const count = 50 // Number of mock users
const baseContent = '<p>I am testing data, I am testing data.</p><p><img src="https://wpimg.wallstcn.com/4c69009c-0fd4-4153-b112-6cb53d1cf943"></p>'
const image_uri = 'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3' // Default avatar

for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    username: '@first',
    password: '123456', // In a real app, password would be hashed
    email: '@email',
    phone: /^1[3456789]\d{9}$/,
    'roles|1': ['admin', 'editor'],
    avatar: image_uri,
    createTime: '@datetime',
    updateTime: '@datetime',
    operator: '@cname'
  }))
}
// Admin user for login
const adminUser = {
  id: 1,
  username: 'admin',
  password: '123456',
  email: 'admin@example.com',
  phone: '13800138000',
  roles: ['admin'],
  avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
  introduction: '我是超级管理员',
  createTime: new Date().toISOString(),
  updateTime: new Date().toISOString(),
  operator: 'system'
}
List.unshift(adminUser) // Add admin to the list

const editorUser = {
  id: 2,
  username: 'editor',
  password: '123456',
  email: 'editor@example.com',
  phone: '13900139000',
  roles: ['editor'],
  avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
  introduction: '我是编辑员',
  createTime: new Date().toISOString(),
  updateTime: new Date().toISOString(),
  operator: 'system'
}
List.unshift(editorUser)


const users = {
  admin: {
    roles: ['admin'],
    introduction: 'I am a super administrator',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Super Admin',
    token: 'admin-token'
  },
  editor: {
    roles: ['editor'],
    introduction: 'I am an editor',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Normal Editor',
    token: 'editor-token'
  }
}

module.exports = [
  // user login
  {
    url: '/user/login',
    type: 'post',
    response: config => {
      const { username, password } = config.body
      const user = List.find(u => u.username === username && u.password === password)

      if (!user) {
        return {
          code: 60204,
          message: '账号或密码不正确.'
        }
      }
      const token = user.roles.includes('admin') ? 'admin-token' : 'editor-token'
      return {
        code: 20000,
        data: { token }
      }
    }
  },

  // get user info
  {
    url: '/user/info.*',
    type: 'get',
    response: config => {
      const { token } = config.query
      let info = users[token.replace('-token', '')] // Simplified mapping

      if (!info) { // Fallback for other users not explicitly 'admin' or 'editor' by token
        const user = List.find(u => u.username === (token === 'admin-token' ? 'admin' : 'editor')) // Example, better to map by actual user ID or more robust token
        if (user) {
          info = {
            roles: user.roles,
            name: user.username,
            avatar: user.avatar,
            introduction: `我是用户 ${user.username}`
          }
        } else {
          return {
            code: 50008,
            message: '登录失败，无法获取用户信息.'
          }
        }
      }

      return {
        code: 20000,
        data: info
      }
    }
  },

  // user logout
  {
    url: '/user/logout',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  // register user
  {
    url: '/user/register',
    type: 'post',
    response: config => {
      const { username, password, email, phone } = config.body
      if (List.some(u => u.username === username)) {
        return { code: 50000, message: '用户名已存在' }
      }
      const newUser = {
        id: Mock.mock('@increment'),
        username,
        password, // Store as is for mock, hash in real app
        email,
        phone,
        roles: ['editor'], // Default role
        avatar: image_uri,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        operator: 'system' // Or the registering user if applicable
      }
      List.push(newUser)
      return { code: 20000, data: 'success', message: '注册成功' }
    }
  },

  // change password
  {
    url: '/user/changePassword',
    type: 'post',
    response: config => {
      // This requires knowing the current user, typically via token
      // For mock, let's assume we can find the user by username if provided
      // Or, more realistically, this would be for the logged-in user
      const { username, oldPassword, newPassword } = config.body
      // Assuming 'admin' is trying to change password. In a real app, use user from token.
      const user = List.find(u => u.username === 'admin') // Example
      if (user && user.password === oldPassword) {
        user.password = newPassword
        user.updateTime = new Date().toISOString()
        return { code: 20000, data: 'success', message: '密码修改成功' }
      }
      return { code: 50000, message: '旧密码不正确或用户不存在' }
    }
  },

  // get user list for User Management
  {
    url: '/user/list',
    type: 'get',
    response: config => {
      const { username, page = 1, limit = 20, sort } = config.query
      let mockList = List.filter(item => {
        if (username && item.username.indexOf(username) < 0) return false
        return true
      })

      if (sort === '-id') {
        mockList = mockList.reverse()
      }

      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))

      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList.map(u => ({ // Return only necessary fields
            id: u.id,
            username: u.username,
            email: u.email,
            phone: u.phone,
            roles: u.roles,
            createTime: u.createTime,
            operator: u.operator
          }))
        }
      }
    }
  },
  // create user
  {
    url: '/user/create',
    type: 'post',
    response: config => {
      const data = config.body
      const newUser = {
        id: Mock.mock('@id'),
        username: data.username,
        password: data.password || '123456', // Default password
        email: data.email,
        phone: data.phone,
        roles: data.roles || ['editor'],
        avatar: image_uri,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        operator: data.operator || 'admin' // Assuming admin created
      }
      List.unshift(newUser) // Add to beginning
      return { code: 20000, data: { item: newUser }, message: '用户创建成功' }
    }
  },

  // update user
  {
    url: '/user/update',
    type: 'post',
    response: config => {
      const data = config.body
      const user = List.find(u => u.id === data.id)
      if (user) {
        Object.assign(user, data)
        user.updateTime = new Date().toISOString()
        return { code: 20000, data: 'success', message: '用户更新成功' }
      }
      return { code: 50000, message: '用户不存在' }
    }
  },

  // delete user
  {
    url: '/user/delete',
    type: 'post',
    response: config => {
      const { id } = config.body
      const index = List.findIndex(u => u.id === id)
      if (index > -1) {
        List.splice(index, 1)
        return { code: 20000, data: 'success', message: '用户删除成功' }
      }
      return { code: 50000, message: '用户不存在' }
    }
  }
]
