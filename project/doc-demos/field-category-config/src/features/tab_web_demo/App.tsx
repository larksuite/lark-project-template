import React, { useEffect, useState } from 'react';

import { FieldManagementPage, AUTH_USERS } from '../../pages';
import { Empty } from '@douyinfe/semi-ui';
import { storage } from '../../utils';
import './index.css'
const App: React.FC = () => {
  const [showAuth, setShowAuth] = useState<boolean>(false)
  useEffect(() => {
     storage.getItem(AUTH_USERS).then(val => {
      Array.isArray(val) && val.length > 0 && setShowAuth(true);
     })
  }, []);
  if(!showAuth) {
    return <div className='empty-wrapper'><Empty  title="无权限" description="联系空间管理员，添加权限"/></div>
  }
  return (
   <FieldManagementPage />
  );
}

export default App;