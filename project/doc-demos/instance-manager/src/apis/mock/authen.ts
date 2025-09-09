import axios from "axios";


/**
* @desc 获取插件访问凭证
* 详见: 开发者手册 获取访问凭证
*/
export async function  authenPluginToken() {
 // mock 成功调用情况
 return {
   token: 'p-49257489-f7d7-4cd6-b34f-98c6b81d****',
   expire_time: Date.now() + 7200 * 1000, // 2小时后过期
}
 const response = await axios.post('https://{平台域名}/open_api/authen/plugin_token', {
       "plugin_id": "MII_63E9D49B8C82****", 
       "plugin_secret": "D01B5F1A191C8620D133CDC371C0****", 
       "type": 0, 
   }).then(res => res.data); // 返回 axios 包的 data 字段;
   /*** response 响应体参数示例;
      { 
           "data": { 
               "expire_time": 7200, // token失效时间, 2小时
               "token": "p-49257489-f7d7-4cd6-b34f-98c6b81d****" // 插件访问凭证 plugin_access_token 
           }, 
           "error": { 
               "code": 0, // 返回码，非0表示失败 
               "msg": "success" // 返回码描述 
           } 
       } 
    */

   /** 省略 error 处理 */

   return response.data;
}

/**
 * @desc 获取用户插件访问凭证
 * 详见: 开发者手册 获取访问凭证
 */
export async function authenUserPluginToken(code: string) {
    // mock 成功调用情况
    return {
        token: 'u-efe05d32-b733-4b15-a960-6acadf8e****',
        expire_time: Date.now() + 7200 * 1000, // 2小时后过期
    }
    return;
    const { token } = await authenPluginToken();
    const response = await axios.post('https://{平台域名}/open_api/authen/user_plugin_token', {
        "code": code,
        "grant_type": "authorization_code"
    }, {
        headers: {
            'X-Plugin-Token': token,
        }
    }).then(res => res.data); 
    // 返回 axios 包的 data 字段;
    /* response 响应体参数示例;
        {
            "data": {
                "token": "u-efe05d32-b733-4b15-a960-6acadf8e****",// 用户访问凭证 user_access_token
                "expire_time": 7200, // user_access_token 有效时间
                "refresh_token": "85cde42e-76c8-4677-a783-1e5761f7****", // 刷新用户 user_access_token 时使用的 refresh_token
                "refresh_token_expire_time": 1209600, // refresh_token 有效时间
                "saas_tenant_key": "DeepCollaboration", // 用户所属租户
                "user_key": "he" // 用户唯一标识
            },
            "error": {
                "code": 0, // 返回码，非0表示失败
                "msg": "success" // 返回码描述
            }
        } 
    */
    /** 省略 error 处理 */
    return {
        token: response.data.token,
        expire_time: Date.now() + response.data.expire_time * 1000, // 2小时后过期
    }

}