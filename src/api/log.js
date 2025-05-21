import request from '@/utils/request'

// 获取日志列表
export function fetchLogList(query) {
  return request({
    url: '/log/list',
    method: 'get',
    params: query
  })
}

// (通常日志是系统自动记录，较少手动创建或删除)
// 如有需要，可添加删除日志接口
// export function deleteLog(id) {
//   return request({
//     url: '/log/delete',
//     method: 'post',
//     data: { id }
//   })
// }
