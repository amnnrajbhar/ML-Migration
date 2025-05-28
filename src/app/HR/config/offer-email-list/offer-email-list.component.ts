import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { Router, RouterModule } from '@angular/router';
import { ExcelService } from '../../../shared/excel-service';
import { AuthData } from '../../../auth/auth.model';
import { EmailListFilter } from './emaillistfilter.model'
import { EmailNotification } from '../emailnotification.model';
import { MasterDataService } from '../../Services/masterdata.service';

declare var $: any;
declare var toastr: any;


@Component({
  selector: 'app-offer-email-list',
  templateUrl: './offer-email-list.component.html',
  styleUrls: ['./offer-email-list.component.css']
})
export class OfferEmailListComponent implements OnInit {
  id: number = 0;
  action: string
  isLoading: boolean = false;
  plantList: any[] = [];
  payGroupList: any[] = [];
  payGroupFullList: any[] = [];
  employeeCategoryList: any[] = [];
  filterData: any = {};
  currentUser!: AuthData;
  emailNotificationDetails= {} as EmailNotification;
  emailTypeList = [
    { type: "Offer Letter", color:"info" },    
    { type: "Appointment Letter", color:"warning"},
    { type: "Confirmation", color:"warning"},
    { type: "Appraisal", color:"warning"},    
    { type: "Resignation", color:"warning"},
    { type: "Service Withdrawal", color:"warning"},
    { type: "Transfer", color:"warning"},    
    { type: "Recall", color:"warning"},    
    { type: "Retirement Extension", color:"warning"},       
  ]  
  filterModel: EmailListFilter = {} as EmailListFilter;

  constructor(private httpService: HttpService,
    private router: Router, private excelService: ExcelService, private masterService: MasterDataService) {
      currentUser: AuthData;
     }

  ngOnInit() {
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.filterModel.pageSize = 10;
    this.filterModel.selectedPlantId = "";
    this.filterModel.selectedPayGroupId = "";
    this.filterModel.selectedEmployeeCategoryId = "";
    this.filterModel.selectedStateId = "";
    this.filterModel.selectedEmailType = "";
    
    this.masterService.getPlantList().then((data: any) => { this.plantList = data; });
    this.masterService.getPayGroupList().then((data: any) => { this.payGroupFullList = data; });
    this.masterService.getEmployeeCategoryList().then((data: any) => { this.employeeCategoryList = data; });
    this.getState();
    this.getEmailList();
  }

  selectedState: any;
  stateList: any[] = [];
  getState() {
    this.httpService.HRget(APIURLS.OFFER_STATE_GET_BY_COUNTRY + "/IN").then((data: any) => {
      if (data.length > 0) {
        this.stateList = data.sort((a:any, b:any) => { if (a.bezei > b.bezei) return 1; if (a.bezei < b.bezei) return -1; return 0; });
      }
    }).catch((error)=> {
      this.stateList = [];
    });
  }

  gotoPage(no){
    if( this.filterModel.pageNo == no) return;
    this.filterModel.pageNo = no;
    this.getData();    
  }

  pageSizeChange(){
    this.filterModel.pageNo = 1;    
    this.getData();    
  }

  emailList: any[] = [];  
  getEmailList() {
    this.filterModel.pageNo = 1;
    this.getData();     
  }

  getData(){
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.EMAIL_NOTIFICATION_GET_EMAIL_NOTIFICATION, this.filterModel).then((data: any) => {
      this.filterData = data;
     console.log(this.filterData.list);
      
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;      
    });
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  setDateFormate(date: any): string {
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear() +' ' +
      ("00" + d1.getHours()).slice(-2) + ":" +
      ("00" + d1.getMinutes()).slice(-2) + ":" +
      ("00" + d1.getSeconds()).slice(-2);
  }
  
  exportData(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.EMAIL_NOTIFICATION_GET_EMAIL_NOTIFICATION, this.filterModel).then((data: any) => {
      this.emailList = data.list;     
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      console.log(this.emailList);
      this.emailList.forEach((item :any) => {
        index=index+1;
        let exportItem={
          "Sl No":index,
          "Plant": item.plantName,
          "Paygroup": item.payGroupName,
          "Employee Category": item.employeeCategoryName,
          "State": item.stateName,
          "Email Type": item.eMailType,
          "Email Id": item.emailId,                    
          "User Type": item.userType,  
          "E.No": item.employeeNo,
          "Name": item.nameWithoutEno,                            
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Email_Notification_List'); 
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;   
      this.filterModel.export = false;
      toastr.error('Error occurred while fetching data.');   
      return;
    });    
  }
  
addNew()
{
  let route = 'HR/config/offer-email-notification/';
  this.router.navigate([route]);
}

performTask(offerEmailNotificationId: any)
{
  let connection: any;
  if(confirm("Do you really want to delete this record?"))
  {
    this.isLoading = true;
    this.emailNotificationDetails.offerEmailNotificationId=offerEmailNotificationId;
    this.emailNotificationDetails.createdById = this.currentUser.uid;
    connection = this.httpService.HRpost(APIURLS.EMAIL_NOTIFICATION_DELETE, this.emailNotificationDetails);

    connection.then(
      (data: any) => {
        this.isLoading = false;       
        if (data == 200 || data.success) 
        {   
          var msg = 'Deleted successfully';
          toastr.success(msg);
          this.getData();
        }
        else
        toastr.error(data.message + " Please check all the mandatory fields are entered properly.");
      },
      (err) => {
        this.isLoading = false;
        toastr.error('Error occured while saving email details. Error:' + err);
      })
      .catch((error)=> {
        this.isLoading = false;
        toastr.error('Error occured while saving email details. Error:' + error);
      });

  }
}

onPlantChange(){
  if(this.filterModel.selectedPlantId > 0){
    let plant = this.plantList.find(x=>x.id == this.filterModel.selectedPlantId)
    this.payGroupList = this.payGroupFullList.filter((x:any)=>x.plant == plant.code);
  }
  else
    this.payGroupList = [];
}
}
