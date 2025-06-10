import { useContext } from "react";
import { SDKContext } from "../hoc/with-context";

function useSdkContext() {
  return useContext(SDKContext);
}
export default useSdkContext;
