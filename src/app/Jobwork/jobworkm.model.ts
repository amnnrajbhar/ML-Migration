import { JobWorkD } from "./jobworkd.model";

export class JobWorkM {
    id: number;
  plant: string;
  challenNo: string;
  challenDate: string;
  shippingAddress: string;
  billingAddress: string;
  transporterName: string;
  vehicleNo: string;
  lrNo: string;
  lrDate: string;
  eWayBillNo: string;
  remarks: string;
  placeOfSupply: string;
  doneBy: string;
  doneOn: string;
  modifiedBy: string;
  modifiedOn: string;
  isActive: boolean;
  reasonforcancellation:string;
  ponumber:string;
  reference:string;
  pieces:string;
  modeOfTransport:string;
  jobWorkDViewModel:JobWorkD[]=[];
}