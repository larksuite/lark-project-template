import { Form, withField } from "@douyinfe/semi-ui";
import { ConfigurationFeatureContext } from "@lark-project/js-sdk";
import { UserSelect } from "@lark-project/ui-kit-plugin";
import { useEffect, useState } from "react";
import { storage } from "../../utils/storage";

export const AUTH_USERS = "auth_users";

const UserSelectField = withField(UserSelect);
const useConfigContext = () => {
  const [configContext, setConfigContext] =
    useState<ConfigurationFeatureContext>();
  const getConfigContext = async () => {
    try {
      const context = await window.JSSDK.configuration.getContext();
      setConfigContext(context);
    } catch (error) {}
  };
  useEffect(() => {
    getConfigContext();
  }, []);

  return { configContext };
};
const useAuthUser = () => {
  const [userIds, setUserIds] = useState<string[]>([]);
  const onChange = async (ids: string[]) => {
    setUserIds(ids);
    await storage.setItem(AUTH_USERS, ids);
  };
  const initUserIds = async () => {
    const value = await storage.getItem<string[]>(AUTH_USERS);
    setUserIds(value || []);
  };
  useEffect(() => {
    initUserIds();
  }, []);
  return {
    userIds,
    onChange,
  };
};
export const ConfigPage = () => {
  const { configContext } = useConfigContext();
  const { userIds, onChange } = useAuthUser();

  return (
    <div style={{ paddingLeft: 12 }}>
      <Form labelPosition="left">
        <UserSelectField
          label="字段分类"
          field={AUTH_USERS}
          multiple={true}
          spaceId={configContext?.spaceId}
          style={{ width: 400 }}
          placeholder="请选择授权用户"
          maxTagCount={3}
          userIds={userIds}
          onChange={onChange}
        />
      </Form>
    </div>
  );
};
