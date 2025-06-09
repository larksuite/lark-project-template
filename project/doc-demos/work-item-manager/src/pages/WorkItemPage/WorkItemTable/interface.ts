import { BriefWorkItem } from '@lark-project/js-sdk';

export interface IWorkItemTableProps {
  workItems?: BriefWorkItem[];
  onRemoveWorkItem?: (workItemId: number) => void;
}
