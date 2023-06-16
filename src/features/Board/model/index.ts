import { useEffect, useState } from 'react';
export type Status = 'online' | 'offline' | 'busy';
interface SchedulingInfo {
  staff: {
    id: string;
    name: string;
    avatar: string;
  };
  status: string;
  workTime: string;
  serviceScope: string;
}
const useModel = () => {
  const [data, setData] = useState<SchedulingInfo[]>([]);

  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dateStr = `${year}-${month}-${day}`;
  const dayOfWeek = date.getDay();

  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  const chineseDayOfWeek = weekdays[dayOfWeek];
  useEffect(() => {
    setData([
      {
        staff: { id: 'zhangsan', name: '张三', avatar: 'ZS' },
        status: 'online',
        workTime: '10:00~12:00,14:00~18:00',
        serviceScope: '休假工单',
      },
      {
        staff: { id: 'lisi', name: '李四', avatar: 'LS' },
        status: 'offline',
        workTime: '10:00~12:00,14:00~18:00',
        serviceScope: '服务工单',
      },
      {
        staff: { id: 'wangwu', name: '王五', avatar: 'WW' },
        status: 'online',
        workTime: '10:00~12:00,14:00~18:00,19:00~20:00',
        serviceScope: '所有工单',
      },
      {
        staff: { id: 'zhaoliu', name: '赵六', avatar: 'ZL' },
        status: 'busy',
        workTime: '14:00~18:00,19:00~22:00',
        serviceScope: '所有工单',
      },
    ]);
  }, []);

  const handleChangeStatus = (val: Status, index: number) => {
    const newData = [...data];
    newData[index].status = val;
    setData(newData);
  };

  return { data, dateStr, chineseDayOfWeek, handleChangeStatus };
};

export default useModel;
