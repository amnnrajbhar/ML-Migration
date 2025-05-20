import { Component, OnInit } from '@angular/core';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ExcelService } from '../../../shared/excel-service';
import { AuthData } from '../../../auth/auth.model';
import { EmailNotification } from '../emailnotification.model';
import { Util } from '../../Services/util.service';
import { MasterDataService } from '../../Services/masterdata.service';

declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-edit-email-notification',
  templateUrl: './edit-email-notification.component.html',
  styleUrls: ['./edit-email-notification.component.css'],
  providers:[Util]
})
export class EditEmailNotificationComponent implements OnInit {
  id: number = 0;
  action: string;
  isLoading: boolean = false;
  plantList: any[] = [];
  payGroupList: any[] = [];
  payGroupFullList: any[] = [];
  employeeCategoryList: any[] = [];
  filterData: any = {};
  emailNotificationDetails= {} as EmailNotification;
  currentUser: AuthData;
  selectedEmailType: any = null;
  employeeName: any;
  emailPattern: any = "^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$";
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
  selectedPlant: any = null; 
  selectedPayGroup: any = null;
  selectedEmployeeCategory: any = null;

  constructor(private httpService: HttpService,
    private router: Router, private route: ActivatedRoute,private excelService: ExcelService, private masterService: MasterDataService) {
      currentUser: AuthData;
     }

  offerEmailNotitifactionId :any=null;
  canEdit:boolean = false;

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.offerEmailNotitifactionId = this.route.snapshot.paramMap.get('id')!;
   
    this.masterService.getPlantList().then((data: any) => { this.plantList = data; });
    this.masterService.getPayGroupList().then((data: any) => { this.payGroupFullList = data; });
    this.masterService.getEmployeeCategoryList().then((data: any) => { this.employeeCategoryList = data; });
  
    if (this.offerEmailNotitifactionId>0)
    {
      this.canEdit = true;
      console.log(this.offerEmailNotitifactionId);
      this.GetEmailNotificationDetailsById(this.offerEmailNotitifactionId);      
    }
  }

  GetEmailNotificationDetailsById(id) {
    this.isLoading = true;

    this.httpService.HRget(APIURLS.EMAIL_NOTIFICATION_GET_EMAIL_BY_ID+"/"+id).then((data: any) => {
      if (data) {
         this.emailNotificationDetails=data;
         this.selectedPlant=this.emailNotificationDetails.plantId;
         this.selectedPayGroup=this.emailNotificationDetails.payGroupId;   
         this.selectedEmployeeCategory=this.emailNotificationDetails.employeeCategoryId; 
         this.selectedState = this.emailNotificationDetails.stateId;
         this.selectedEmailType = this.emailNotificationDetails.eMailType; 
         this.employeeName = this.emailNotificationDetails.name;
         this.emailNotificationDetails.employeeId = this.emailNotificationDetails.employeeId;
                     
         this.onPlantChange();  
         this.getState();
      }
      this.isLoading = false;
    }).catch(error => {
      toastr.error(error);
    });
  }
  
  selectedState: any;
  stateList: any[] = [];
  getState() {
    this.httpService.HRget(APIURLS.OFFER_STATE_GET_BY_COUNTRY + "/IN").then((data: any) => {
      if (data.length > 0) {
        this.stateList = data.sort((a, b) => { if (a.bezei > b.bezei) return 1; if (a.bezei < b.bezei) return -1; return 0; });
      }
    }).catch(error => {
      this.stateList = [];
    });
  }

  isEmailValid:boolean=false;
  validateEmail(email:any)
  {
    const expression: RegExp = /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;

    this.isEmailValid = expression.test(email);
    
    console.log('e-mail is ' + (this.isEmailValid  ? 'correct' : 'incorrect'));
  }

  validate(action:any)
  {
    this.validateEmail(this.emailNotificationDetails.emailId);
    if (this.isEmailValid==false)
    {
      toastr.error("Enter Valid Email Id");
      return;
    }
    if (this.selectedPlant==null)
    {
      toastr.error("Select Plant");
      return;
    }
    if (this.selectedPayGroup==null)
    {
      toastr.error("Select Paygroup");
      return;
    }
    if (this.selectedEmployeeCategory==null)
    {
      toastr.error("Select Employee Category");
      return;
    }
    if (this.selectedEmailType==null)
    {
      toastr.error("Select Email Type");
      return;
    }
    if (this.emailNotificationDetails.emailId==undefined || this.emailNotificationDetails.emailId=='')
    {
      toastr.error("Select Email Id");
      return;
    }
    if(this.emailNotificationDetails.userType == null)
    {
      toastr.error("Please select user type.");
      return;
    }
    this.emailNotificationDetails.employeeId = $("#employeeId").val();
    this.employeeName = $("#employeeName").val();

    if(this.emailNotificationDetails.userType == "Employee" && this.employeeName == '')
    {
      toastr.error("Please enter employee.");
      return;
    }
    if(this.emailNotificationDetails.userType == "Non-Employee" && this.emailNotificationDetails.name == '')
    {
      toastr.error("Please enter employee name.");
      return;
    }
   if(this.emailNotificationDetails.userType == "Employee" && !this.emailNotificationDetails.emailId.includes("@microlabs.in"))
    {
      toastr.error("Please enter a microlabs email Id.");
      return;
    }
    if(this.emailNotificationDetails.userType == "Non-Employee")
    {
      this.emailNotificationDetails.employeeId = null;
    }
    else if(this.emailNotificationDetails.userType == "Employee")
    {
      this.emailNotificationDetails.name = null;
    }
    this.performAction(action);
    
  }
  goBack() {
    let route = 'HR/config/offer-email-list';
    this.router.navigate([route]);
  }
  performAction(action:any){
    let connection: any;
    let data:any;
    if(confirm("Do you really want to " + action +"?"))
    {
      this.isLoading = true;
   
      this.emailNotificationDetails.createdById = this.currentUser.uid;
 
    if (action == "Update")
    {
      connection = this.httpService.HRpost(APIURLS.EMAIL_NOTIFICATION_UPDATE, this.emailNotificationDetails);
    }
    else if (action == "Delete")
    {
      connection = this.httpService.HRpost(APIURLS.EMAIL_NOTIFICATION_DELETE, this.emailNotificationDetails);
    }
    else
    {
      toastr.info("Select An Action");
      return;
    }
    connection.then(
      (data: any) => {
        this.isLoading = false;       
        if (data == 200 || data.success) 
        {   
          var msg = action + ' successfull';
          toastr.success(msg);
            this.emailNotificationDetails.offerEmailNotificationId = data.offerEmailNotificationId;
            this.router.navigate(['/HR/config/offer-email-list']);

        }
        else
        toastr.error(data.message + " Please check all the mandatory fields are entered properly.");
      },
      (err) => {
        this.isLoading = false;
        toastr.error('Error occured while saving email details. Error:' + err);
      })
      .catch(error => {
        this.isLoading = false;
        toastr.error('Error occured while saving email details. Error:' + error);
      });
   }
  
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

  lastApproverEmployeekeydown = 0;
  getEmployees($event) {
    let text = $('#employeeName').val();

    if (text.length > 3) {
      if ($event.timeStamp - this.lastApproverEmployeekeydown > 400) {
        this.httpService.HRget(APIURLS.HR_EMPLOYEEMASTER_GET_LIST + "/" + text).then((data: any) => {
          if (data.length > 0) {
            var sortedList = data.sort((a, b) => { if (a.fullName > b.fullName) return 1; if (a.fullName < b.fullName) return -1; return 0; });
            var list = $.map(sortedList, function (item) {
              return { label: item.fullName + " (" + item.employeeId + ")", value: item.id };
            })
            $('#employeeName').autocomplete({
              source: list,
              classes: {
                "ui-autocomplete": "highlight",
                "ui-menu-item": "list-group-item"
              },
              change: function (event, ui) {
                if (ui.item) {
                  $("#employeeId").val(ui.item.value);
                  $("#employeeName").val(ui.item.label);
                }
                else {
                  $("#employeeId").val('');
                  $("#employeeName").val('');
                }
              },
              select: function (event, ui) {
                if (ui.item) {
                  $("#employeeId").val(ui.item.value);
                  $("#employeeName").val(ui.item.label);
                }
                else {
                  $("#employeeId").val('');
                  $("#employeeName").val('');
                }
                return false;
              }
            });
          }
        });
      }
      this.lastApproverEmployeekeydown = $event.timeStamp;
    }
  }
  
  onPlantChange(){
    if(this.emailNotificationDetails.plantId > 0){
      let plant = this.plantList.find(x=>x.id == this.emailNotificationDetails.plantId)
      this.payGroupList = this.payGroupFullList.filter(x=>x.plant == plant.code);
    }
    else
      this.payGroupList = [];
  }

}
