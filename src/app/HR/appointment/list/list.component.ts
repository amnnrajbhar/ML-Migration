import { Component, OnInit } from '@angular/core';
import { MasterDataService } from '../../Services/masterdata.service';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { OfferListFilter } from '../../Offer/offer-list/offerlistfilter.model';
import { Router, RouterModule } from '@angular/router';
import { OfferUpdateRequest } from '../../Offer/offer-list/offerupdaterequest.model';
import { AuthData } from '../../../auth/auth.model';
import { ExcelService } from '../../../shared/excel-service';
import swal from 'sweetalert';
import { DataStorageService } from '../../Services/data-storage.service';
import { PERMISSIONS } from '../../../shared/permissions';
import { Util } from '../../Services/util.service';
declare var $: any;

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
  providers: [Util]
})
export class ListComponent implements OnInit {
  currentUser: AuthData;
  plantList: any[] = [];
  payGroupList: any[] = [];
  employeeCategoryList: any[] = [];
  isLoading: boolean = false;
  filterData: any = {};
  filterModel: OfferListFilter = {} as OfferListFilter;
  employmentTypes = [{type: "Company Role"}, {type: "Apprentice"}];
  
  constructor(private httpService: HttpService, private router: Router, private excelService: ExcelService, 
    private dataStore: DataStorageService, private util: Util) { }

  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser')); 
    this.filterModel.pageSize = 10;
    this.filterModel.pageNo = 1;
    this.filterModel.selectedPlantId = "";
    this.filterModel.selectedPayGroupId = "";
    this.filterModel.selectedEmployeeCategoryId = "";
    this.filterModel.selectedStatus = "";
    this.filterModel.selectedFromdate = "";
    this.filterModel.selectedTodate = "";
    this.filterModel.selectedDepartmentId = "";
    this.filterModel.selectedSubDepartmentId = "";
    this.filterModel.name = "";
    this.filterModel.employmentType = "";
    this.filterModel.createdbyname

    this.getPlantList();
    this.getEmployeeCategoryList();
    this.getDepartments();
    this.getSubDepartments();
    
    // get filter model from the in memory data store
    var oldFilter = this.dataStore.GetData("AppointmentList");
    if(oldFilter){
      // if the filter was applied earlier use it
      this.filterModel = oldFilter;
    }

    this.filterModel.employeeId = this.currentUser.uid;
    this.filterModel.includeConfidential = this.util.hasPermission(PERMISSIONS.HR_OFFER_VIEW_CONFIDENTIAL);
    this.getData();   
  }
  
  ngAfterViewInit() {
    this.toggleColumns();
  }
  
  toggleColumns() {
    $(".columnGroup").on("click", function () {
      var group = $(this).attr("data-group");
      if (group == "all") {
        $(".columnGroup").removeClass('active').addClass('active');
        $("#data th, #data td").show();
      }
      else {
        $(this).toggleClass('active');
        $("#data ." + group).toggle();
      }
    });
  }
  
  getPlantList() {
    this.httpService.HRget(APIURLS.OFFER_GET_PLANTS_ASSIGNED + "/" + this.currentUser.uid).then((data: any) => {
      if (data.length > 0) {
        this.plantList = data.sort((a, b) => { if (a.code > b.code) return 1; if (a.code < b.code) return -1; return 0; });
      }
    }).catch(error => {
      this.plantList = [];
    });
  }

  getPayGroupList() {
    
    if (this.filterModel.selectedPlantId) {
      this.httpService.HRget(APIURLS.OFFER_GET_PAY_GROUPS_ASSIGNED + "/" + this.currentUser.uid + "/" + this.filterModel.selectedPlantId).then((data: any) => {
        if (data.length > 0) {
          this.payGroupList = data.sort((a, b) => { if (a.long_Desc > b.long_Desc) return 1; if (a.long_Desc < b.long_Desc) return -1; return 0; });;
        }
      }).catch(error => {
        this.payGroupList = [];
      });
    }
    else{
      this.payGroupList = [];
      this.filterModel.selectedPayGroupId = "";
      this.filterModel.selectedEmployeeCategoryId = "";
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

  statusList = [
    { type: "Entry In Progress", color: "info" },
    { type: "Details Submitted", color: "warning" },
    { type: "Joining Confirmed", color: "warning" },
    { type: "Pending Verification", color: "warning" },    
    { type: "Verified", color: "primary" },    
    { type: "Emp Code Generated", color: "primary" },
    { type: "Pending for Approval", color: "warning" },    
    { type: "Approved", color: "success" },
    { type: "Rejected", color: "danger" },
    { type: "Letter Sent", color: "success" },  
    { type: "Accepted", color: "success" },
    { type: "Not Accepted", color: "danger" },
    { type: "Withdrawn", color: "danger" },
    { type: "Updated", color: "info" },
  ]

  getOfferList() {
    
    this.filterModel.pageNo = 1;
     
      this.getData();    
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

  
  getData(){
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.APPOINTMENT_GET_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterData = data;
      for(var item of this.filterData.list){
        item.statusColor = this.statusList.find(x=>x.type == item.status).color;
      }
      // store the filter model
      this.dataStore.SetData("AppointmentList", this.filterModel);
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;      
    });
  }

  edit(id: any) {
    let route = 'HR/appointment/edit/' + id;
    this.router.navigate([route]);
  }

  
  editFull(id: any) {
    let route = 'HR/appointment/edit-full/' + id;
    this.router.navigate([route]);
  }

  view(id: any) {
    let route = 'HR/appointment/view/' + id;
    this.router.navigate([route]);
  }
  hrEntry(id: any, showWarning: boolean){
    if(showWarning == true){
      if(!confirm("Are you sure you want to edit this already approved Appointment?")) return;
    }
    let route = 'HR/appointment/hr-entry/' + id;
    this.router.navigate([route]);
  }
  
  joiningReport(id: any) {
    let route = 'HR/appointment/joining-report/' + id;
    this.router.navigate([route]);
  }

  submitForVerification(id){    
    if(confirm("Are you sure you want to submit this for verification?"))
    {
      var request: any = {};
      request.appointmentId = id;      
      request.submittedById = this.currentUser.uid;
      swal("Submitting...");  
      this.httpService.HRpost(APIURLS.APPOINTMENT_SUBMIT_FOR_VERIFICATION, request)
      .then((data: any) => {
        if(data == 200 || data.success)
        {       
          this.getOfferList();
          swal("Successfully submitted for verfication.");  
        }else if(!data.success){
          swal(data.message); 
        }else
          swal("Error occurred.");
      }).catch(error => {
        swal(error);
      });
    }
  }

  submitForApproval(id) {
    if (confirm("Are you sure you want to submit this for approval?")) {
      var request: any = {};
      request.appointmentId = id;      
      request.submittedById = this.currentUser.uid;
      swal("Submitting...");  
      this.httpService.HRpost(APIURLS.APPOINTMENT_SUBMIT_FOR_APPROVAL, request)
      .then((data: any) => {
        if(data == 200 || data.success)
        {       
          this.getOfferList();
          swal("Successfully submitted for approval.");  
        }else if(!data.success){
          swal(data.message); 
        }else
          swal("Error occurred.");
      }).catch(error => {
        swal(error);
      });
    }
  }
  
  resendEntryEmail(id) {
    if (confirm("Are you sure you want to send details entry email?")) {
      var request: any = {};
      request.appointmentId = id;
      request.submittedById = this.currentUser.uid;
      request.submittedByName = this.currentUser.fullName;
      swal("Sending email...");
      this.httpService.HRpost(APIURLS.APPOINTMENT_RESEND_DETAILS_ENTRY_EMAIL, request).then((data: any) => {
        if (data == 200 || data.success) {
          this.getOfferList();
          swal("Successfully resend the details entry email to the candidate.");
        } else if (!data.success) {
          swal(data.message);
        } else
          swal("Error occurred.");
      }).catch(error => {
        swal(error);
      });
    }
  }
  
  pushDataToSAP(id) {
    if (confirm("Are you sure you want to Generate Emp Code?")) {
      this.isLoading = true;
      var request: any = {};
      request.appointmentId = id;
      request.submittedById = this.currentUser.uid;
      request.submittedByName = this.currentUser.fullName;
      swal("Updating data and generating Emp Code...");
      this.httpService.HRpost(APIURLS.APPOINTMENT_SEND_DATA_TO_SAP, request).then((data: any) => {
        if (data && data.success) {
          this.getOfferList();          
          swal("Successfully generated Emp Code.");
        }         
        else if (!data.success) {
          swal(data.message);
        } else
          swal("Error occurred.");
          this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        swal(error);
      });
    }
  }

  updateToSAP(id) {
    if (confirm("Are you sure you want to change in SAP?")) {
      this.isLoading = true;
      var request: any = {};
      request.appointmentId = id;
      request.submittedById = this.currentUser.uid;
      request.submittedByName = this.currentUser.fullName;
      swal("Updating data in SAP...");
      this.httpService.HRpost(APIURLS.APPOINTMENT_SEND_DATA_TO_SAP, request).then((data: any) => {
        if (data && data.success) {
          this.getOfferList();          
          swal("Successfully updated data in SAP.");
        }         
        else if (!data.success) {
          swal(data.message);
        } else
          swal("Error occurred.");
        this.isLoading = false;
      }).catch(error => {
        this.isLoading = false;
        swal(error);
      });
    }
  }

  exportData(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.APPOINTMENT_GET_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      data.list.forEach(item => {
        index=index+1;
        let exportItem={
          "SNo":index,
          "Appointment ID": item.appointmentId,
          "Offer ID": item.offerId,
          "Employee No": item.employeeNo,
          "Status": item.status,
          "Pending With / Updated By": item.pendingWith == null ? item.modifiedByFirstName +" "+item.modifiedByMiddleName +" "+item.modifiedByLastName
          : item.pendingWith,
          "Letter Printed": item.printed == true ? "Yes" : "No",
          "Letter Emailed": item.emailed == true ? "Yes" : "No",
          "Letter Downloaded": item.downloaded == true ? "Yes" : "No",
          "Created Date": this.setDateTimeFormate(item.createdDate),
          "Created By": item.createdByName,
          "Title": item.title,
          "First Name": item.firstName,
          "Middle Name": item.middleName,
          "Last Name": item.lastName,
          "Initial": item.initial,
          "Gender": item.gender,
          "Email ID": item.personalEmailId,
          "Mobile No": item.mobileNo,
          "Age": item.age,
          "Plant Name": item.plantName,
          "Plant Code": item.plantCode,
          "Pay Group": item.payGroupName,
          "Employee Category": item.employeeCategoryName,
          "Location": item.location,
          "Department": item.department,
          "Designation": item.designation,
          "Grade": item.grade,
          "Role": item.role,
          "Interviewed By": item.interviewedBy,
          "Present Employer": item.presentEmployer,
          "Sales in Lakhs": item.salesAmount,
          "Total Experience": item.totalExperience,
          "Present CTC": item.presentCTC,
          "Offered Salary": item.offeredSalary,
          "Package Type": item.packageType,
          "Salary Type": item.salaryType,
          "Reference Thru": item.referenceThru,
          "Reference Details": (item.refEmployeeNo ==null?"":item.refEmployeeNo) + (item.refDetails==null?"":item.refDetails),
          "Recruitment Type": item.recruitmentType,
          "Replacing Emp. No": item.replacingEmployeeNumber,
          "Tentative Joining Date": this.setDateFormate(item.tentativeJoiningDate),
          "Actual Joining Date": this.setDateFormate(item.joiningDate),
          "Employment Type": item.employmentType,
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Appointments_List');
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;   
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');   
      return;
    });    
  }

  setDateFormate(date: any): string {
    if(date == null || date == undefined) return "";
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear();
  }

  setDateTimeFormate(date: any): string {
    if(date == null || date == undefined) return "";
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear() +' ' +
      ("00" + d1.getHours()).slice(-2) + ":" +
      ("00" + d1.getMinutes()).slice(-2) + ":" +
      ("00" + d1.getSeconds()).slice(-2);
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  departmentList:any[]=[];
  getDepartments(){
    this.httpService.HRget(APIURLS.BR_MASTER_DEPARTMENT_API).then((data: any) => {
      if (data.length > 0) {
        this.departmentList = data.sort((a, b) => { if (a.description > b.description) return 1; if (a.description < b.description) return -1; return 0; });
      }
    }).catch(error => {
      this.departmentList = [];
    });
  }
  
  subDepartmentFullList:any[]=[];
  subDepartmentList:any[]=[];
  onDepartmentChange(event: any){
    this.filterModel.selectedSubDepartmentId = "";
    this.subDepartmentList = this.subDepartmentFullList.filter(x => x.departmentId == this.filterModel.selectedDepartmentId);
  }
  
  getSubDepartments(){
    this.httpService.HRget(APIURLS.APPOINTMENT_GET_SUB_DEPARTMENTS).then((data: any) => {
      if (data.length > 0) {
        this.subDepartmentFullList = data.sort((a, b) => { if (a.sdptidLtxt > b.sdptidLtxt) return 1; if (a.sdptidLtxt < b.sdptidLtxt) return -1; return 0; });
      }
    }).catch(error => {
      this.subDepartmentFullList = [];      
    });
  }
}
