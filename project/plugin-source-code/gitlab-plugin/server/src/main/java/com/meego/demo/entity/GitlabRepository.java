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
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.meego.demo.entity.base.BaseEntity;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

/**
 * <p>
 * gitlab空间仓库表
 * </p>
 *
 * @author meego
 * @since 2024-07-25
 */
@Getter
@Setter
@Accessors(chain = true)
@TableName("gitlab_repository")
public class GitlabRepository extends BaseEntity {

    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @JsonIgnore
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 空间Key
     */
    @JsonIgnore
    private String projectKey;

    /**
     * 仓库标识符
     */
    @JsonIgnore
    private Long originId;

    /**
     * 仓库名称
     */
    private String name;

    /**
     * 仓库名称带namespace
     */
    private String pathWithNamespace;

    /**
     * 仓库链接
     */
    private String url;
}
