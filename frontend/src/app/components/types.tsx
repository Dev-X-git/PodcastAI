export interface PromptType {
  id: number;
  title: string;
  description: string;
  }
export interface NewPromptType{
  title: string;
  description: string;
}
export interface TypeContentType{
  id:number;
  title: string; 
}
export interface NewTypeContentType{
 
  title: string; 
}
export enum ModalStatus {
  Closed = 'Closed',
  Download = 'Download',
  EditModal = 'EditModal',
  DeleteModal = 'DeleteModal',
  SetStartIndex= 'SetStartIndex',
  HistoryModal = 'HistoryModal',
  SetRangeModal = 'SetRangeModal'
  // Add more modal states as needed
}

export interface TimerType{
  scriptTimer:string[];
  audioTimer:string[];
  totalScriptTimer:0;
  totalAudioTimer:0;
}

export interface RangeType{
  start: number;
  end: number;
}

export interface HistoryEntry {
  start_time: string;
  count: number;
}