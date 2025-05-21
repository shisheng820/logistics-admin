// mock/user.js
import Mock from 'mockjs'

// Assuming tokens and user data structure from vue-element-admin
const tokens = {
  admin: { token: 'admin-token' },
  editor: { token: 'editor-token' }
}
const users = {
  'admin-token': {
    roles: ['admin'],
    introduction: '我是超级管理员',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Super Admin',
    id: 'admin001', // Added user ID
    email: 'admin@example.com' // Added email
  },
  'editor-token': {
    roles: ['editor'],
    introduction: '我是一名编辑',
    avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
    name: 'Normal Editor',
    id: 'editor001', // Added user ID
    email: 'editor@example.com' // Added email
  }
}

// Store registered users in memory for mock
const registeredUsers = [
    { username: 'admin', password: 'password123', roles: ['admin'], name: 'Super Admin', id: 'admin001', email: 'admin@example.com' },
    { username: 'editor', password: 'password123', roles: ['editor'], name: 'Normal Editor', id: 'editor001', email: 'editor@example.com' }
]


export default [
  // User login
  {
    url: '/user/login', // Match your API path
    type: 'post',
    response: config => {
      const { username, password } = config.body
      const user = registeredUsers.find(u => u.username === username && u.password === password)

      if (!user) {
        return {
          code: 60204,
          message: '账号或密码不正确.'
        }
      }
      const token = user.roles.includes('admin') ? tokens.admin.token : tokens.editor.token;
      return {
        code: 20000,
        data: { token }
      }
    }
  },

  // Get user info
  {
    url: '/user/info\\?token=.*', // Match your API path
    type: 'get',
    response: config => {
      const { token } = config.query
      const info = users[token]

      if (!info) {
        return {
          code: 50008,
          message: '登录失败，无法获取用户详情.'
        }
      }
      return {
        code: 20000,
        data: info
      }
    }
  },

  // User logout
  {
    url: '/user/logout', // Match your API path
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  // User registration
  {
    url: '/user/register',
    type: 'post',
    response: config => {
      const { username, password, name, email } = config.body
      if (registeredUsers.find(u => u.username === username)) {
        return {
          code: 50000,
          message: '用户名已存在.'
        }
      }
      const newUser = {
        id: Mock.Random.guid(),
        username,
        password, // In a real app, password would be hashed
        name: name || username,
        email: email || '',
        roles: ['editor'], // Default role
        avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
        introduction: '新注册用户'
      }
      registeredUsers.push(newUser)
      // Also add to users for getInfo mock if needed immediately after registration
      const newToken = `${username}-token`; // Simple token generation for mock
      users[newToken] = newUser;
      tokens[username] = { token: newToken };


      return {
        code: 20000,
        data: { message: '注册成功', token: newToken } // Optionally return a token for auto-login
      }
    }
  },

  // Update user profile
  {
    url: '/user/profile/update',
    type: 'put',
    response: config => {
      const { id, name, email, password, oldPassword } = config.body // Assuming id is passed or derived from token
      // In a real app, you'd get user by token from request header
      // For mock, let's assume we find user by id if provided, or a default user
      let userToUpdate = registeredUsers.find(u => u.id === id); // Or find by token
      
      // This mock is simplified. A real backend would handle token authentication.
      // For demonstration, let's pick the first admin if no ID matches.
      if (!userToUpdate && users['admin-token'] && (id === users['admin-token'].id || !id)) {
         userToUpdate = registeredUsers.find(u => u.id === users['admin-token'].id);
      } else if (!userToUpdate && users['editor-token'] && (id === users['editor-token'].id || !id)) {
         userToUpdate = registeredUsers.find(u => u.id === users['editor-token'].id);
      }


      if (!userToUpdate) {
        return {
          code: 50008,
          message: '用户未找到.'
        }
      }

      // Password change logic (simplified)
      if (password) {
        if (!oldPassword) {
             return { code: 50000, message: '旧密码不能为空.' }
        }
        if (userToUpdate.password !== oldPassword) {
            return { code: 50000, message: '旧密码不正确.' }
        }
        userToUpdate.password = password; // Update password
      }

      if (name) userToUpdate.name = name;
      if (email) userToUpdate.email = email;
      
      // Update the 'users' object as well if it's used by getInfo
      for (const tokenKey in users) {
          if (users[tokenKey].id === userToUpdate.id) {
              users[tokenKey].name = userToUpdate.name;
              users[tokenKey].email = userToUpdate.email; // Assuming email is part of info
              break;
          }
      }

      return {
        code: 20000,
        data: { message: '个人资料更新成功.' }
      }
    }
  }
]
