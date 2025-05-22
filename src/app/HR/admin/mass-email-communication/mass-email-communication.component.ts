import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { APIURLS } from '../../../shared/api-url';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { AppComponent } from '../../../app.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthData } from '../../../auth/auth.model';
import { ExcelService } from '../../../shared/excel-service';
import swal from 'sweetalert';
import { DataStorageService } from '../../Services/data-storage.service';
import { Util } from '../../Services/util.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
//import { SendEmailMassComunicationModel } from '../../admin/mass-email-communication/SendEmailMassComunication.model'
import { SafeHtmlPipe } from '../../Services/safe-html.pipe';
import { Pipe, PipeTransform } from "@angular/core";
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-mass-email-communication',
  templateUrl: './mass-email-communication.component.html',
  providers: [Util]
})
export class MassEmailCommunicationComponent implements OnInit {
@ViewChild(NgForm, { static: false }) massEmailComunicationForm: NgForm;


  currentUser: AuthData;
  isLoading: boolean = false;
  filterData: any = {};
  filterModel: any = {};
  plantlist: any[] = [];
  payGroupList: any[] = [];
  employeeCategoryList: any[] = [];
  sendEmailModel: any = {};
  editorConfig: AngularEditorConfig = {};
  selectAll = false;
  errorCount = 0;
  statusList = [
    { type: "Probationary", color: "info" },
    { type: "Confirmed", color: "success" },
    { type: "Serving Notice Period", color: "warning" },
    { type: "Resigned And Exited", color: "danger" },
    { type: "Service Extended", color: "warning" },
    { type: "Service Withdrawn", color: "danger" },
    { type: "Retired", color: "danger" },
    { type: "FNF Settled", color: "danger" },
  ]


  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private dataStore: DataStorageService, private excelService: ExcelService, private util: Util) {
  }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.filterModel.pageNo = 1;
    this.filterModel.pageSize = 10;
    this.filterModel.employeeId = this.currentUser.uid;
    this.filterModel.status = "";
    this.filterModel.departmentId = "";
    this.filterModel.stateId = "";
    this.filterModel.locationId = "";
    this.filterModel.plantId = "";
    this.filterModel.payGroupId = "";
    this.filterModel.employeeCategoryId = "";
    this.filterModel.fromdate = "";
    this.filterModel.todate = "";
    this.filterModel.active = true;

    this.sendEmailModel.emailType = "Official Email";

    this.editorConfig.minHeight = "400px";

    this.getAllDropDownValues();
    this.getData();
  }


  getEmployeeList() {    
    this.filterModel.pageNo = 1;
    this.getData();
  }

  getAllDropDownValues() {

    this.getDepartments();
    this.getState();
    this.getLocation();
    this.getPlantList();
    this.getPayGroupList();
    this.getEmployeeCategoryList();
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }


  getPlantList() {
    this.httpService.HRget(APIURLS.OFFER_GET_PLANTS_ASSIGNED + "/" + this.currentUser.uid).then((data: any) => {
      if (data.length > 0) {
        this.plantlist = data.sort((a, b) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
      }
    }).catch(error => {
      this.plantlist = [];
    });
  }

  getPayGroupList() {
    
    if (this.filterModel.plantId) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.filterModel.plantId).then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a, b) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
        }
      }).catch(error => {
        this.payGroupList = [];
      });
    }
    else {
      this.payGroupList = [];
      this.filterModel.payGroupId = "";
      this.filterModel.employeeCategoryId = "";
    }
  }

  getEmployeeCategoryList() {
      this.httpService.HRget(APIURLS.OFFER_GET_EMP_CATEGORIES_ASSIGNED + "/" + this.currentUser.uid + "/0/0")
        .then((data: any) => {
          if (data.length > 0) {
            this.employeeCategoryList = data.sort((a, b) => { if (a.catltxt > b.catltxt) return 1; if (a.catltxt < b.catltxt) return -1; return 0; });;
          }
        }).catch(error => {
          this.employeeCategoryList = [];
        });
  }


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

  locationFullList: any[] = [];
  locationList: any[] = [];
  getLocation() {
    this.httpService.HRget(APIURLS.OFFER_LOCATION_MASTER_ALL_API).then((data: any) => {
      if (data.length > 0) {
        this.locationFullList = data.sort((a, b) => { if (a.name > b.name) return 1; if (a.name < b.name) return -1; return 0; });
      }
    }).catch(error => {
      this.locationList = [];
    });
  }

  departmentList: any[] = [];
  getDepartments() {
    this.httpService.HRget(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.sort((a, b) => { if (a.description > b.description) return 1; if (a.description < b.description) return -1; return 0; });
      }
    }).catch(error => {
      this.departmentList = [];
    });
  }

  getData() {
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.EMPLOYEE_GET_EMPLOYEELIST, this.filterModel).then((data: any) => {
      this.filterData = data;
      for (var item of this.filterData.list) {
        item.statusColor = this.statusList.find(x => x.type == item.status).color;
      }
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;
    });
  }

  gotoPage(no) {
    if (this.filterModel.pageNo == no) return;
    this.filterModel.pageNo = no;
    this.getData();
  }

  pageSizeChange() {
    this.filterModel.pageNo = 1;
    this.getData();
  }

  onStateChange() {
    this.filterModel.locationId = "";
    this.locationList = this.locationFullList.filter(x => x.stateId == this.filterModel.stateId);
  }

  setDateFormate(date: any): string {
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear();
  }
 
  onSelectAllChange(){
    for (var item of this.filterData.list) {
      item.selected = this.selectAll;
    }
  }

  SendSelected(files) {
    var selectedList = this.filterData.list.filter(x => x.selected == true);
    if (selectedList.length <= 0) {
      toastr.error("Please select atleast one employee to send email notification");
      return;
    }
    if (this.sendEmailModel.subject == undefined) {
      toastr.error("Please enter subject");
      return;
    }
    if (this.sendEmailModel.body == undefined) {
      toastr.error("Please enter body");
      return;
    }
    if (this.sendEmailModel.emailType == undefined) {
      toastr.error("Please select Email type");
      return;
    }
    var EmployeeIds: any[] = [];

    for (var t of selectedList) {
      EmployeeIds.push(t.employeeId);
    }
    this.errorCount = 0;
    const formData = new FormData();
    for (const file of files) {
      var ext = file.name.split('.').pop();
      if(ext.toLowerCase() != "jpg" && ext.toLowerCase() != "jpeg" && ext.toLowerCase() != "png" && ext.toLowerCase() != "pdf")
      {
        toastr.error("Only pdf/jpeg/jpg/png files are allowed. Please select a different file.");
        return;
      }
      if (file.size > (2 * 1024 * 1024)) {
        toastr.error("Maximum file size allowed is 2MB. Please select a different file.");
        return;
      }
      formData.append("attachment", file);
      this.sendEmailModel.imageFileName = file.name;
    }
    toastr.info("Sending email...");
    this.isLoading = true;
    formData.append("employeeIds", EmployeeIds.toString());
    formData.append("subject", this.sendEmailModel.subject);
    formData.append("body", this.sendEmailModel.body);
    formData.append("emailType", this.sendEmailModel.emailType != undefined ? this.sendEmailModel.emailType : "");
    formData.append("submittedById", this.currentUser.hrEmployeeId.toString());
    formData.append("submittedByName", this.currentUser.fullName);

    this.httpService.HRpostAttachmentFile(APIURLS.ADMIN_SEND_EMAIL_NOTIFICATION_SELECTED_EMPLOYEE, formData)
      .then((data: any) => {
        if (data == 200 || data.success) {
          toastr.success("Successfully Sent Email Notification.");
          $("#sendEmail").modal("hide");
        } else if (!data.success) {
          toastr.error(data.message);
        } else
          toastr.error("Error occurred while sending email.");
        this.isLoading = false;
      }).catch(error => {
        toastr.error(error);
        this.isLoading = false;
      });
  }

  SendAll(files) {
    if (this.sendEmailModel.subject == undefined) {
      toastr.error("Please enter subject");
      return;
    }
    if (this.sendEmailModel.body == undefined) {
      toastr.error("Please enter body");
      return;
    }
    if (this.sendEmailModel.emailType == undefined) {
      toastr.error("Please select Email type");
      return;
    }

    const formData = new FormData();
    for (const file of files) {
      var ext = file.name.split('.').pop();
      if(ext.toLowerCase() != "jpg" && ext.toLowerCase() != "jpeg" && ext.toLowerCase() != "png" && ext.toLowerCase() != "pdf")
      {
        toastr.error("Only pdf/jpeg/jpg/png files are allowed. Please select a different file.");
        return;
      }
      if (file.size > (2 * 1024 * 1024)) {
        toastr.error("Maximum file size allowed is 2MB. Please select a different file.");
        return;
      }
      formData.append("attachment", file);
      this.sendEmailModel.imageFileName = file.name;
    }
    toastr.info("Sending email...");
    this.isLoading = true;

    formData.append("subject", this.sendEmailModel.subject);
    formData.append("body", this.sendEmailModel.body);
    formData.append("emailType", this.sendEmailModel.emailType != undefined ? this.sendEmailModel.emailType : "");
    formData.append("submittedById", this.currentUser.hrEmployeeId.toString());
    formData.append("submittedByName", this.currentUser.fullName);

    formData.append("employeeFilterModel.plantId", this.filterModel.plantId != undefined ? this.filterModel.plantId : "");
    formData.append("employeeFilterModel.payGroupId", this.filterModel.payGroupId != undefined ? this.filterModel.payGroupId : "");
    formData.append("employeeFilterModel.employeeCategoryId", this.filterModel.employeeCategoryId != undefined ? this.filterModel.employeeCategoryId : "");
    formData.append("employeeFilterModel.departmentId", this.filterModel.departmentId != undefined ? this.filterModel.departmentId : "");
    formData.append("employeeFilterModel.stateId", this.filterModel.stateId != undefined ? this.filterModel.stateId : "");
    formData.append("employeeFilterModel.locationId", this.filterModel.locationId != undefined ? this.filterModel.locationId : "");
    formData.append("employeeFilterModel.status", this.filterModel.status != undefined ? this.filterModel.status : "");
    formData.append("employeeFilterModel.fromDate", this.filterModel.fromDate != undefined ? this.filterModel.fromDate : "");
    formData.append("employeeFilterModel.toDate", this.filterModel.toDate != undefined ? this.filterModel.toDate : "");

    this.httpService.HRpostAttachmentFile(APIURLS.ADMIN_SEND_EMAIL_NOTIFICATION_ALL_EMPLOYEE, formData)
      .then((data: any) => {
        if (data == 200 || data.success) {
          toastr.success("Successfully Sent Email Notification.");
          $("#sendEmail").modal("hide");
        } else if (!data.success) {
          toastr.error(data.message);
        } else
          toastr.error("Error occurred while sending email.");
          this.isLoading = false;
      }).catch(error => {
        toastr.error(error);
        this.isLoading = false;
      });
  }

  option = "";
  count = 0;
  sendEmail(option) {
    if(option == "selected"){
      var selectedList = this.filterData.list.filter(x => x.selected == true);
      if (selectedList.length <= 0) {
        toastr.error("Please select atleast one employee to send email notification");        
        return;
      }      
      this.count = selectedList.length;
    }else
      this.count = this.filterData.totalCount;

    $("#sendEmail").modal("show");
    this.option = option;
  }

  performComunication(files) {
    if (this.option == "selected") {
      this.SendSelected(files);
    }
    else {
      this.SendAll(files);
    }
  }

  countClick(){
    if(this.option == "selected"){
      var selectedList = this.filterData.list.filter(x => x.selected == true);
      this.exportData(selectedList);
    }
    else{
      this.filterModel.export = true;
      this.isLoading = true;   
      this.httpService.HRpost(APIURLS.EMPLOYEE_GET_EMPLOYEELIST, this.filterModel).then((data: any) => {
        this.filterModel.export = false;
        this.exportData(data.list);
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;   
        this.filterModel.export = false;
        swal('Error occurred while fetching data.');   
        return;
      });
    }
  }

  
  exportData(data: any[]){
    var exportList=[];
    let index=0;
    data.forEach(item => {
      index=index+1;
      let exportItem={
        "SlNo":index,
        "Employee No": item.employeeNo,
        "Status": item.status,
        "First Name": item.firstName,
        "Middle Name": item.middleName,
        "Last Name": item.lastName,
        "Plant": item.plantName,
        "Pay Group": item.payGroupName,
        "Employee Category": item.employeeCategoryName,
        "State": item.state,
        "Location": item.location,
        "Department": item.department,
        "Designation": item.designation,
        "Grade": item.grade,
        "Role": item.role,
        "Official Email ID": item.officialEmailId,
        "Personal Email ID": item.personalEmailId,
        "Joining Date": this.setDateFormate(item.dateOfJoining),
        "Reporting Manager": item.reportingManagerName,
        "HOD": item.approvingManagerName,
        "Employment Type": item.employmentType,
      };
        exportList.push(exportItem);
    });
    this.excelService.exportAsExcelFile(exportList, 'Employee_List');       
  }
}
