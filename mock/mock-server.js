// mock/mock-server.js
const chokidar = require('chokidar')
const bodyParser = require('body-parser')
const chalk = require('chalk')
const path = require('path')
// const Mock = require('mockjs') // 删除或注释掉这行

const mockDir = path.join(process.cwd(), 'mock')

let MockInstance // 用于存储导入的 MockJS 实例

// 异步加载 MockJS
async function loadMockJs() {
  if (!MockInstance) {
    try {
      // 使用动态 import() 加载 ES Module
      const mockModule = await import('mockjs')
      MockInstance = mockModule.default || mockModule // 处理 default 导出
      if (!MockInstance || typeof MockInstance.mock !== 'function') {
        console.error(chalk.redBright('Error: Failed to load Mock.mock function from mockjs. Mocking will not work.'));
        MockInstance = null;
      } else {
        console.log(chalk.greenBright('MockJS loaded successfully.'));
      }
    } catch (error) {
      console.error(chalk.redBright('Error importing mockjs:'), error)
      MockInstance = null
    }
  }
  return MockInstance
}

function registerRoutes(app) {
  if (!MockInstance) {
    console.error(chalk.redBright('MockJS is not loaded. Cannot register mock routes.'))
    return { mockRoutesLength: 0, mockStartIndex: 0 }
  }

  let mockLastIndex = 0
  // require('./index.js') 会加载 mock/index.js
  // vue-element-admin 的 mock/index.js 通常默认导出一个数组
  const mocks = require('./index.js').default || require('./index.js')

  if (!Array.isArray(mocks)) {
    console.error(chalk.redBright('Error: mock/index.js did not export an array of mocks.'));
    return { mockRoutesLength: 0, mockStartIndex: 0 };
  }

  for (const mock of mocks) {
    if (!mock || typeof mock.url !== 'string' || typeof mock.type !== 'string' || typeof mock.response !== 'function') {
      console.warn(chalk.yellowBright('Warning: Invalid mock definition skipped:'), mock);
      continue;
    }
    app[mock.type](mock.url, (req, res) => {
      const { body, query, params } = req; // 从req中解构
      // 使用加载的 MockInstance
      res.send(MockInstance.mock(mock.response({ body, query, params })))
    })
    mockLastIndex = app._router.stack.length
  }

  const mockRoutesLength = mocks.length
  return {
    mockRoutesLength: mockRoutesLength,
    mockStartIndex: mockLastIndex - mockRoutesLength
  }
}

function unregisterRoutes() {
  Object.keys(require.cache).forEach(i => {
    if (i.includes(mockDir)) {
      delete require.cache[require.resolve(i)]
    }
  })
}

// 将模块导出函数改为异步函数
module.exports = async (app) => {
  // 首先确保 MockJS 加载完成
  await loadMockJs()

  if (!MockInstance) {
    console.error(chalk.redBright('MockJS failed to load. Mock server functionality will be limited or disabled.'))
    // 可以选择在这里返回，或者继续执行但不注册mock路由
    // return;
  }

  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({
    extended: true
  }))

  let { mockRoutesLength, mockStartIndex } = registerRoutes(app)

  // 监控 mock 文件夹中的文件变化
  chokidar.watch(mockDir, {
    ignored: /mock-server\.js/, // 忽略 mock-server.js 本身
    ignoreInitial: true
  }).on('all', async (event, filePath) => { // 注意这里也用 async
    if (event === 'change' || event === 'add') {
      try {
        // 移除旧的 mock 路由
        app._router.stack.splice(mockStartIndex, mockRoutesLength)

        // 清除 require 缓存
        unregisterRoutes()

        // 重新加载 MockJS (通常不需要，除非 MockJS 本身或其配置被修改)
        // await loadMockJs(); // 如果需要，可以取消注释

        // 重新注册路由
        const newRoutes = registerRoutes(app)
        mockRoutesLength = newRoutes.mockRoutesLength
        mockStartIndex = newRoutes.mockStartIndex

        if (mockRoutesLength > 0) {
           console.log(chalk.magentaBright(`\n > Mock Server hot reload success! File changed: ${filePath}`))
        }
      } catch (error) {
        console.log(chalk.redBright(error))
      }
    }
  })
}
