import { App } from '../apps/app';
import { MedicalRecord } from '../apps/app';
import { Notification } from '../notification/notification';



export interface MyRecordsCategories {
  _id:string
  type: string;
  image_url:string;
  description:String;
  createdBy:string;
  updatedBy:string;
  isActive:boolean;
  isDeleted:boolean
}

