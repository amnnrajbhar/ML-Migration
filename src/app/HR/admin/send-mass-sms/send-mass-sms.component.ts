import { Component, OnInit } from '@angular/core';
import { APIURLS } from '../../../shared/api-url';
import { HttpService } from '../../../shared/http-service';
import { AppService } from '../../../shared/app.service';
import { AppComponent } from '../../../app.component';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthData } from '../../../auth/auth.model';
import { ExcelService } from '../../../shared/excel-service';
import swal from 'sweetalert';
import { DataStorageService } from '../../Services/data-storage.service';
import { MasterDataService } from '../../Services/masterdata.service';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-send-mass-sms',
  templateUrl: './send-mass-sms.component.html',
  styleUrls: ['./send-mass-sms.component.css']
})
export class SendMassSmsComponent implements OnInit {

  constructor(private appService: AppComponent, private httpService: HttpService,
    private router: Router, private appServiceDate: AppService, private route: ActivatedRoute,
    private dataStore: DataStorageService, private excelService: ExcelService, private masterDataService: MasterDataService) { }

  currentUser!: AuthData;
  isLoading: boolean = false;
  filterData: any = {};
  filterModel: any = {};
  plantlist: any[] = [];
  payGroupList: any[] = [];
  employeeCategoryList: any[] = [];
  departmentList: any[] = [];
  stateList: any[] = [];
  locationFullList: any[] = [];
  locationList: any[] = [];
  //designationList: any[] = [];
  //roleList: any[] = [];
  smsTemplatesList: any[] = [];
  selectedTemplate: any = {};
  selectAll = false;
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

  ngOnInit() {
 const storedUser = localStorage.getItem('currentUser');
this.currentUser = storedUser ? JSON.parse(storedUser) : null;
    this.filterModel.pageNo = 1;
    this.filterModel.pageSize = 10;
    this.filterModel.employeeId = this.currentUser.uid;
    this.filterModel.status = "";
    this.filterModel.departmentId = "";
    //this.filterModel.designationId ="";
    this.filterModel.stateId = "";
    this.filterModel.locationId = "";
    this.filterModel.plantId = "";
    this.filterModel.payGroupId = "";
    this.filterModel.employeeCategoryId = "";
    this.filterModel.fromdate = "";
    this.filterModel.todate = "";
    this.filterModel.active = true;

    this.masterDataService.getPlantListAssigned(this.currentUser.uid).then(data => this.plantlist = data);
    this.masterDataService.getDepartments().then(data => this.departmentList = data);
    //this.masterDataService.getRole().then(data => this.roleList = data);
    //this.masterDataService.getDesignation().then(data => this.designationList = data);
    this.masterDataService.getState().then(data => this.stateList = data);
    this.masterDataService.getLocation().then(data => this.locationFullList = data);
    this.masterDataService.getEmployeeCategoryListAssigned(this.currentUser.uid, 0, 0).then(data => this.employeeCategoryList = data);
    this.getSMSTemplates();
    this.getData();
  }

  getEmployeeList() {
    this.filterModel.pageNo = 1;
    this.getData();
  }

  getData() {
    this.isLoading = true;
    this.httpService.HRpost(APIURLS.EMPLOYEE_GET_EMPLOYEELIST, this.filterModel).then((data: any) => {
      this.filterData = data;
      for (var item of this.filterData.list) {
        item.statusColor = this.statusList.find((x:any)  => x.type == item.status).color;
      }
      this.isLoading = false;
    }).catch((error)=> {
      this.isLoading = false;
    });
  }

  sendToAll() {
    if(this.filterData.totalCount <= 0){
      toastr.error("There are no employees in the selected filter criteria, please check the list."); return;
    }
    if(!this.selectedTemplate || this.selectedTemplate.smsTemplateId == undefined || this.selectedTemplate.smsTemplateId <= 0){
      toastr.error("please select SMS template."); return;
    }
    if (confirm("Are you sure you want to send SMS to all the filtered "+this.filterData.totalCount+" Employees?")) {
      var request: any = {};
      request.submittedById = this.currentUser.hrEmployeeId;
      request.smsTemplateId = this.selectedTemplate.smsTemplateId;
      request.filterModel = this.filterModel;
      request.message = this.selectedTemplate.body;

      this.isLoading = true;
      this.httpService.HRpost(APIURLS.ADMIN_SEND_SMS_MESSAGES, request).then((data: any) => {
        if(data == 200 || data.success){
          toastr.success("SMS sent successfully.");
        }
        else if (data.message)
          toastr.error(data.message);

        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
      });
    }
  }

  sendToSelected() {
    if(!this.selectedTemplate || this.selectedTemplate.smsTemplateId == undefined || this.selectedTemplate.smsTemplateId <= 0){
      toastr.error("please select SMS template."); return;
    }
    var selectedList = this.filterData.list.filter((x:any)  => x.selected);
    if (selectedList.length <= 0) {
      toastr.error("Please select at least one employee to send SMS.");
      return;
    }

    if (confirm("Are you sure you want to send SMS to all the selected "+selectedList.length+" Employees?")) {
      var request: any = {};
      request.submittedById = this.currentUser.hrEmployeeId;
      request.smsTemplateId = this.selectedTemplate.smsTemplateId;
      request.message = this.selectedTemplate.body;
      request.selectedEmployeeIds = [];
      var selectedEmployees = this.filterData.list.filter((x:any)  => x.selected);
      for (var item of selectedEmployees) {
        request.selectedEmployeeIds.push(item.employeeId);
      }
      this.isLoading = true;
      this.httpService.HRpost(APIURLS.ADMIN_SEND_SMS_MESSAGES, request).then((data: any) => {
        if(data == 200 || data.success){
          toastr.success("SMS sent successfully.");
        }
        else if (data.message)
          toastr.error(data.message);

        this.isLoading = false;
      }).catch((error)=> {
        this.isLoading = false;
      });
    }
  }

  getSMSTemplates() {
    this.httpService.HRget(APIURLS.SMS_TEMPLATES_API + "/GetActiveTemplates")
      .then((data: any) => {
        if (data.length > 0) {
          this.smsTemplatesList = data.sort((a:any, b:any) => { if (a.templateName > b.templateName) return 1; if (a.templateName < b.templateName) return -1; return 0; });;
        }
      }).catch((error)=> {
        this.smsTemplatesList = [];
      });
  }

  onSelectAllChange(){
    for (var item of this.filterData.list) {
      item.selected = this.selectAll;
    }
  }

  onStateChange() {
    this.filterModel.locationId = "";
    this.locationList = this.locationFullList.filter((x:any)  => x.stateId == this.filterModel.stateId);
  }

  onPlantChange() {
    this.filterModel.payGroupId = "";
    this.filterModel.employeeCategoryId = "";
    this.payGroupList = [];
    
    if (this.filterModel.plantId) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.filterModel.plantId).then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a:any, b:any) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
        }
      }).catch((error)=> {
        this.payGroupList = [];
      });
    }
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

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  setDateFormate(date: any): string {
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear();
  }
}
