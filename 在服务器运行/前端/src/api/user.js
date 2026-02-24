import request from '@/utils/request'

export const userRegisterService = (registerData)=>{
    const params=new URLSearchParams()
    for(let key in registerData){
        params.append(key,registerData[key]);
    }
    return request.post('/user/register',params);
}
export const userLoginService=(loginData)=>{
    const params=new URLSearchParams()
    for(let key in loginData){
        params.append(key,loginData[key]);
    }
    return request.post('/user/login',params)
}
// 获取用户信息
export function userInfoService() {
  return request({
    url: '/user/userInfo',
    method: 'get'
  })
}

// 更新用户资料
export function userUpdateService(data) {
  return request({
    url: '/user/update',
    method: 'put',
    data
  })
}

// 更新头像
export function updateAvatarService(avatarUrl) {
  return request({
    url: '/user/updateAvatar',
    method: 'patch',
    params: { avatarUrl }
  })
}

// 修改密码
export function updatePwdService(data) {
  return request({
    url: '/user/updatePwd',
    method: 'patch',
    data: {
      old_pwd: data.oldPwd,
      new_pwd: data.newPwd,
      re_pwd: data.rePwd
    }
  })
}