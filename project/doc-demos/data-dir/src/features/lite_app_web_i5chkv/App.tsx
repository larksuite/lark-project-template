import React, { useEffect, useState } from "react";
import "./index.css";
import { LiteAppCompPropSelectConfig } from "@lark-project/js-sdk";

const dirTypeKey = "组件属性key";
const dirOutputKey = "输出属性key";
const Items = [
  { id: 0, name: "用户反馈" },
  { id: 1, name: "技术支持反馈" },
  { id: 2, name: "其他场景" },
];
const App: React.FC = () => {
  const [spaceId, setSpaceId] = useState<string>();
  const [selectedItem, setSelectedItem] = useState<{
    id: number;
    name: string;
  }[]>([]);
  const [dirType, setDirType] = useState<number[]>([0]); // 0-用户反馈，1-技术支持反馈，2-其他场景

  // 初始化
  useEffect(() => {
    (async () => {
      try {
        const { spaceId } = await window.JSSDK.liteAppComponent.getContext();
        setSpaceId(spaceId);
        
        // 获取目录类型配置，映射出目录类型值与选项的关系
        const dirTypeConfig =
          (await window.JSSDK.liteAppComponent.getPropFullConfig(
            dirTypeKey,
          )) as LiteAppCompPropSelectConfig;
        
        const dirTypeMap: Record<string, number> = {};
        dirTypeConfig.options?.forEach((opt) => {
          if (opt.label.raw === "用户反馈") {
            dirTypeMap[opt.value] = 0;
          } else if (opt.label.raw === "技术支持反馈") {
            dirTypeMap[opt.value] = 1;
          } else {
            dirTypeMap[opt.value] = 2;
          }
        });
        
        // 获取属性值，支持多选
        const props = await window.JSSDK.liteAppComponent.getProps();
        const dirTypeValue = props[dirTypeKey];
        
        // 处理多选情况
        if (Array.isArray(dirTypeValue)) {
          const types = dirTypeValue
            .filter((value): value is string => typeof value === 'string')
            .map((value) => dirTypeMap[value])
            .filter((type): type is number => type !== undefined) as number[];
          setDirType(types.length > 0 ? types : [0]);
        } else if (typeof dirTypeValue === 'string') {
          setDirType([dirTypeMap[dirTypeValue]]);
        }
        
        // 添加监听
        await window.JSSDK.liteAppComponent.watch((newProps) => {
          const newType = newProps[dirTypeKey];
          if (Array.isArray(newType)) {
            const types = newType
              .filter((value): value is string => typeof value === 'string')
              .map((value) => dirTypeMap[value])
              .filter((type): type is number => type !== undefined) as number[];
            setDirType(types.length > 0 ? types : [0]);
          } else if (typeof newType === 'string') {
            setDirType([dirTypeMap[newType]]);
          }
        }, dirTypeKey);
      } catch (error) {
        console.error('初始化组件失败:', error);
      }
    })();
  }, []);

  // 更新目录数据
  useEffect(() => {
    if (!spaceId || !selectedItem.length) return;
    (async () => {
      try {
        await window.JSSDK.liteAppComponent.notify(dirOutputKey, {
          moql: `select \`work_item_id\` from \`${spaceId}\`.\`技术文档\` where \`反馈渠道\` in (${selectedItem.map(it => `'${it.name}'`).join(',')})`,
        });
      } catch (error) {
        console.error('更新目录数据失败:', error);
      }
    })();
  }, [selectedItem, spaceId]);

  // 处理选项点击
  const handleItemClick = (item: { id: number; name: string }) => {
    setSelectedItem(prev => {
      const isSelected = prev.some(selected => selected.id === item.id);
      if (isSelected) {
        // 取消选择
        return prev.filter(selected => selected.id !== item.id);
      } else {
        // 添加选择
        return [...prev, item];
      }
    });
  };

  return (
    <div
      className="wrapper"
      style={{
        justifyContent: "flex-start",
        alignItems: "stretch",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <div style={{ flex: 1, minHeight: 0 }}>
        {Items.length === 0 ? (
          <div style={{ color: "rgba(28,31,35,.6)", padding: 12 }}>
            暂无数据
          </div>
        ) : (
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {Items.map((it) => {
              // 根据目录类型过滤，同时确保已选中的选项始终显示
              if (!dirType?.includes(it.id) && !selectedItem.some(item => item.id === it.id)) {
                return null;
              }
              
              const key = `${it.name}-${it.id}`;
              const active = selectedItem.some(item => item.id === it.id);
              
              return (
                <li key={key}>
                  <a
                    className="secondary"
                    onClick={() => handleItemClick(it)}
                    style={{
                      display: "block",
                      padding: "10px 12px",
                      borderRadius: 10,
                      textAlign: "left",
                      background: active ? "rgba(137,126,246,0.14)" : "#fff",
                      border: `1px solid ${active ? "rgba(137,126,246,0.6)" : "rgba(28,31,35,.08)"}`,
                      color: "rgba(28,31,35,1)",
                      fontWeight: active ? 600 : 500,
                      cursor: "pointer",
                      userSelect: "none",
                      transition: "all 0.2s ease",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = active ? "rgba(137,126,246,0.14)" : "rgba(28,31,35,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = active ? "rgba(137,126,246,0.14)" : "#fff";
                    }}
                  >
                    {it.name || ""}
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default App;
