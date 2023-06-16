import { hot } from 'react-hot-loader/root';
import React from 'react';
import { RadioGroup, Radio, Table, Avatar, Typography } from '@douyinfe/semi-ui';
import useModel, { Status } from './model';
import { AvatarColor } from '@douyinfe/semi-ui/lib/es/avatar';
import './index.less';

export const statusNameMap = {
  online: '在线',
  offline: '离线',
  busy: '忙碌',
};
const colorList = ['red', 'light-blue', 'green', 'orange'];

export default hot(() => {
  const { data, dateStr, chineseDayOfWeek, handleChangeStatus } = useModel();
  const columns = [
    {
      title: '人员',
      dataIndex: 'staff',
      render: (value, _, index) => (
        <div>
          <Avatar
            size="small"
            color={colorList[index % colorList.length] as AvatarColor}
            style={{ margin: 4 }}
          >
            {value.avatar}
          </Avatar>
          <span>{value.name}</span>
        </div>
      ),
    },
    {
      title: '当前状态',
      dataIndex: 'status',
      render: (value, _, index) => (
        <RadioGroup
          onChange={e => handleChangeStatus(e.target.value as unknown as Status, index)}
          value={value}
          name="demo-radio-group"
        >
          <Radio value="online">在线</Radio>
          <Radio value="offline">离线</Radio>
          <Radio value="busy">忙碌</Radio>
        </RadioGroup>
      ),
    },
    {
      title: '工作时间段',
      dataIndex: 'workTime',
    },
    {
      title: '服务工单范围',
      dataIndex: 'serviceScope',
    },
  ];
  return (
    <section className="board-container">
      <div className="inner">
        <div className="inner-header">
          <Typography.Title heading={5}>排班人员状态</Typography.Title>
        </div>
        <div className="inner-info">
          <span>当前时间：</span>
          <span>{dateStr}</span>&nbsp;&nbsp;
          <span>{chineseDayOfWeek}</span>&nbsp;&nbsp;
          <span>工作时间段：00:00-24:00</span>
        </div>
        <div className="inner-table">
          <Table columns={columns} dataSource={data} pagination={false} />
        </div>
      </div>
    </section>
  );
});
