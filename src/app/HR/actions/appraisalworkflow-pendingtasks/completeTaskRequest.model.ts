export interface CompleteTaskRequest{
    flowTaskId: number;
    comments: string;
    completedById: number;
}