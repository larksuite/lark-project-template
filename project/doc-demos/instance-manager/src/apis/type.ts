export interface WorkItemsByViewIdParams {
    project_key: string;
    view_id: string;
    page_size?: number;
    page_num?: number;
    quick_filter_id?: string;
    work_item_type_keys?:  string[];
}