import { BriefWorkItem } from '@lark-project/js-sdk';

export interface IHeaderProps {
  onWorkItemCreated?: (workItem: BriefWorkItem) => void;
}
