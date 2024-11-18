import React from 'react';
import { Modal } from '@douyinfe/semi-ui';
import './bizModal.less';
import { ModalReactProps } from '@douyinfe/semi-ui/lib/es/modal';
import { isMobile } from '../../utils/helper';

export function BizModal(props: ModalReactProps) {
  return <Modal className={`bizModal${isMobile ? '-mobile' : ''}`} {...props} />;
}
