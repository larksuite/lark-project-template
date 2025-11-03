
import { Typography } from "@douyinfe/semi-ui";
const { Text } = Typography;
export const LinkRenderer = ({ value }) => {
    if (!value || typeof value !== 'string') return null;
  return (<div className="base-field-wrapper">
    <Text
      link
      onClick={(e) => {
        // 插件页面中跳转行为，需通过 JSSDK 提供的方法跳转
        e.preventDefault();
        window.JSSDK.navigation.open(value);
      }}
    >
      {value}
    </Text>
  </div>);
}