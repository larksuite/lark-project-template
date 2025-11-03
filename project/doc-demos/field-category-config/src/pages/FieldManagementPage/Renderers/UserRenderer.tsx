
import { UserTag } from "@lark-project/ui-kit-plugin";

export const UserRenderer = ({ value }: { value: string | string[] }) => {
  if (!value) {
    return null;
  }
  return (
    <div className="base-field-wrapper">
      {Array.isArray(value) ? (
        value.map((id) => <UserTag userId={id} />)
      ) : (
        <UserTag userId={value} />
      )}
    </div>
  );
};