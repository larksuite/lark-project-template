// Get the login status of the plug-in
// If return false, will call the function `authorize` with a code
export function isLogin() {
  return true;
}

// Identity authentication
export function authorize(code) {
  return new Promise((resolve, reject) => {
    resolve(true);
  });
}

export const visibilityControl = async (type, key) => {
  return new Promise((resolve, reject) => {
    if (type === 'DASHBOARD') {
      resolve(true);
    } else {
      resolve(true);
    }
  });
};

export function getIntergrationPointConfig(type, key = '') {
  const configs = {
    BUTTON: {
      button_demo: { need_self_renderer: true, work_item_type: ['_all'] },
      button_id: { need_self_renderer: true, work_item_type: ['_all'] },
    },
  };
  return configs[type] ? configs[type][key] : {};
}
