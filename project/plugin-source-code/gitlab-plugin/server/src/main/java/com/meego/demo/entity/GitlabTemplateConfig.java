/**
 * Copyright (2024) Bytedance Ltd. and/or its affiliates 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); 
 * you may not use this file except in compliance with the License. 
 * You may obtain a copy of the License at 
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0 
 * 
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS, 
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
 * See the License for the specific language governing permissions and 
 * limitations under the License. 
 */

package com.meego.demo.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.meego.demo.entity.base.BaseEntity;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

/**
 * <p>
 * gitlab规则配置表
 * </p>
 *
 * @author meego
 * @since 2024-07-29
 */
@Getter
@Setter
@Accessors(chain = true)
@TableName("gitlab_template_config")
public class GitlabTemplateConfig extends BaseEntity {

    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 空间ID
     */
    private String projectKey;

    /**
     * 工作项类型
     */
    private String workItemType;

    /**
     * 模板ID
     */
    private Long templateId;

    /**
     * 节点ID
     */
    private String relation;

    /**
     * 配置名称
     */
    private String name;

    /**
     * 创建者
     */
    private String creator;

    /**
     * 是否自动流转
     */
    private Integer autoPass;

    /**
     * 是否启用
     */
    private Boolean enable;

    /**
     * 工作项类型名称
     */
    private String workItemTypeName;

    /**
     * 模板名称
     */
    private String templateName;

    /**
     * 模板类型
     */
    private String templateType;
}
