import { BriefWorkObject } from '@lark-project/js-sdk';
import { ISelectProps } from '@lark-project/ui-kit-plugin';

export interface IWorkObjectSelectProps extends Pick<ISelectProps<BriefWorkObject>, 'value' | 'onChange'> {
  className?: string;
}
