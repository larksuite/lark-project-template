
import axios from "axios";
import AxiosMockAdapter  from "axios-mock-adapter";
import { authenUserPluginToken, authenPluginToken } from "./authen";
import { WorkItemsByViewIdParams } from "../type";
/**
 * @desc 本文件模拟 服务端调用 openapi 流程;
 */
const mock = new AxiosMockAdapter(axios);
/**
 * 拦截 axios 请求, 模拟服务端调用 openapi 流程
 */

const USE_USER_TOKEN = false; 
mock.onGet('/mock/loginAuth').reply(async config => {
    // 根据约定从 params 中读取 code 
    const code = config.params?.code;
    let data: any = {};
    if(USE_USER_TOKEN) { // 只有 user_plugin_token  才需要 code
        if (!code) {
            return [
                400,
                {
                    message: 'code is required',
                }
            ]
        }
        // 用户访问凭证
        data = await authenUserPluginToken(code);
    } else {
        // 插件访问凭证
        data = await authenPluginToken();
    }

    /**
     * 模拟 openapi 通过 code 获取 user accross token 成功
     */
    return [
        200,
        data,
      ];
});

function generateMockWorkItemInfos(quickFilterId?: string) {
    function generateRandom10Digits() {
        // 生成 1000000000 到 9999999999 之间的随机整数
        const min = 1000000000;
        const max = 9999999999;
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
    return {
        "data":[//结构同获取工作项详情 获取工作项详情
            {
                "id": quickFilterId ? generateRandom10Digits() : 1234567890,
                "name": `mock 名称 ${quickFilterId || ""}`,
                "work_item_type_key":"story",
                "project_key":"60acd5610444ba031b503055",
                "simple_name":"test",
                "template_type":"control",
                "pattern":"Node",
                "sub_stage":"started",
                "work_item_status": {
                    "state_key": "started",
                },
                "current_nodes":[
                    {
                        "id":"state_1",
                        "name":"node1",
                        "owners":[
                            "7012514555133820947"
                        ]
                    }
                ],
                "state_times": [ //节点时间
                    {
                        "end_time": 1654156400805,
                        "name": "开始",
                        "start_time": 1654156400804,
                        "state_key": "started"
                    },
                    {
                        "end_time": 0,
                        "name": "节点表单",
                        "start_time": 1654156400805,
                        "state_key": "doing"
                    }
                ],
                "created_by":"7009146719661228031",
                "updated_by":"7009146719661228031",
                "created_at":1633776613033,
                "updated_at":1633776613033,
                "fields":[
                    {
                        "field_alias": "",
                        "field_key": "aborted",
                        "field_type_key": "aborted",
                        "field_value": {
                            "is_aborted": false,
                            "reason": ""
                        }
                    },
                    {
                        "field_alias": "",
                        "field_key": "role_owners",
                        "field_type_key": "role_owners",
                        "field_value": [
                            {
                                "owners": [
                                    "7012514555184152596"
                                ],
                                "role": "uiouiouio"
                            },
                            {
                                "owners": null,
                                "role": "test"
                            },
                            {
                                "owners": null,
                                "role": "tt"
                            }
                        ]
                    }
                ],
            }
        ],
        "err": {},
        "err_msg": "",
        "err_code": 0,
        "pagination": {
            "page_num": 1,
            "page_size": 10,
            "total": 1
        }
    }
}
const bizJSONParse = (data: string) => {
    try {
       return JSON.parse(data);
    } catch (error) {
       return {};
    }
}
/**
 * 1. 根据视图id，获取视图下工作项列表
 * 2. 根据 1 中返回的 work_item_id_list 数据, 调用 openapi 获取工作项详情 
 */

mock.onPost('/mock/queryWorkItemsByViewId').reply(async (config: any) => {
    const data: WorkItemsByViewIdParams = bizJSONParse(config.data)
    const { project_key, view_id, quick_filter_id, work_item_type_keys } = data;
    const mockWorkItemInfoResponse = generateMockWorkItemInfos(quick_filter_id);
    // 直接返回调用 openapi 逻辑 mock 结果;
    return [
        200,
        mockWorkItemInfoResponse,
      ];
      
    const queryWorkItemIdsByViewId = async () => {
        /**
         *  根据视图id，获取视图下工作项列表
         *  详见: 开发者手册 获取视图下工作项列表
         * @return 参考手册的返回格式
         */
        const response = axios.get(`https://{平台域名}/open_api/${project_key}/fix_view/${view_id}`, {
            params: {
                page_size: 200,
                page_num: 1,
                quick_filter_id,
            }
        }).then(res => res.data);
        return response;
     }
    const queryWorkItemFilter = async (ids: []) => {
        /**
         * 根据  work_item_id_list 数据, 调用 openapi 获取工作项详情;
         * 详见: 开发者手册 获取指定的工作项列表（单空间）
         * @return 参考手册的返回格式
         * 
         * work_item_type_keys 也可以不通过前端获取, 通过 openapi 查询 
         * 详见: 开发者手册 获取空间下工作项类型
         */
        const response = axios.post(`https://{平台域名}/open_api/${project_key}/work_item/filter`, {
            work_item_ids: ids,
            work_item_type_keys,
        }).then(res => res.data);
              
        return response;
    }
    const  fixViewRes = await queryWorkItemIdsByViewId();
    const workItemIdList = fixViewRes?.data?.work_item_id_list || [];
    const responseData = await queryWorkItemFilter(workItemIdList);
    return [
        200,
        responseData,
      ];
})