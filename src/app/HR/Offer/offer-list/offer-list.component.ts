import { Component, OnInit } from '@angular/core';
import { MasterDataService } from '../../Services/masterdata.service';
import { HttpService } from '../../../shared/http-service';
import { APIURLS } from '../../../shared/api-url';
import { OfferListFilter } from './offerlistfilter.model';
import { Router, RouterModule } from '@angular/router';
import { OfferUpdateRequest } from './offerupdaterequest.model';
import { AuthData } from '../../../auth/auth.model';
import { ExcelService } from '../../../shared/excel-service';
import swal from 'sweetalert';
import { DataStorageService } from '../../Services/data-storage.service';
import { Util } from '../../Services/util.service';
import { PERMISSIONS } from '../../../shared/permissions';
declare var $: any;
declare var toastr: any;

@Component({
  selector: 'app-offer-list',
  templateUrl: './offer-list.component.html',
  styleUrls: ['./offer-list.component.css'],
  providers: [MasterDataService, Util]
})
export class OfferListComponent implements OnInit {

  constructor(private masterDataService: MasterDataService, private httpService: HttpService,
    private router: Router, private excelService: ExcelService, private dataStore: DataStorageService, private util: Util) { }
  currentUser: AuthData;
  plantList: any[] = [];
  payGroupList: any[] = [];
  employeeCategoryList: any[] = [];
  today = new Date();
  offerId: number = 0;
  comments: string;
  action: string;
  filterData: any = {};
  filterModel: OfferListFilter = {} as OfferListFilter;
  isLoading: boolean = false;
  ngOnInit() {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'));
    this.filterModel.pageSize = 10;
    this.filterModel.pageNo = 1;

    // initialize the filter model
    this.filterModel.selectedPlantId = "";
    this.filterModel.selectedPayGroupId = "";
    this.filterModel.selectedEmployeeCategoryId = "";
    this.filterModel.selectedStatus = "";
    this.filterModel.selectedFromdate = "";
    this.filterModel.selectedTodate = "";
    this.filterModel.name = "";    
    this.filterModel.pendingWith = "";
    this.filterModel.selectedDepartmentId = "";
    this.filterModel.selectedSubDepartmentId = "";
    this.getPlantList();    
    this.getEmployeeCategoryList();
    this.getDepartments();
    this.getSubDepartments();

    // get filter model from the in memory data store
    var oldFilter = this.dataStore.GetData("OfferList");
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
    { type: "Initial", color:"info" },
    { type: "Updated", color:"info" },
    { type: "Pre-joining Email Sent", color:"primary" },
    { type: "Pre-joining Completed", color:"success" },
    { type: "Pending For Approval", color:"info"},    
    { type: "Approved", color:"warning" },            
    { type: "Rejected", color:"danger" },        
    { type: "Pending For Exception Approval", color:"info"},    
    { type: "Exception Rejected", color:"danger" },        
    { type: "Exception Approved", color:"warning" },        
    { type: "Email Sent", color:"warning" },
    { type: "Accepted", color:"primary" },
    { type: "Not Accepted", color:"danger" },   
    { type: "Withdrawn", color:"danger" },
    { type: "Archived", color:"danger" }, 
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
    this.httpService.HRpost(APIURLS.OFFER_GET_OFFERS_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterData = data;
      for(var item of this.filterData.list){
        item.statusColor = this.statusList.find(x=>x.type == item.status).color;
      }
      // store the filter model
      this.dataStore.SetData("OfferList", this.filterModel);
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;      
    });
  }

  getDateFormate(date: any): string {
    let d1 = new Date(date);
    return d1.getFullYear() + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      ("00" + d1.getDate()).slice(-2);
  }

  editOffer(offerId: any) {
    var offer = this.filterData.list.find(x=>x.offerId == offerId);
    if(offer.approvedDate != "" && offer.approvedDate != null && offer.approvedDate != undefined){
      if(confirm("Are you sure you want to edit this already Approved Offer again?\n\n1) Any change in Official or Salary details will require re-approval. \n\n 2) You can re-edit the Personal information and Save, do not click Submit for re-approval if not required.")){
        let route = 'HR/offer/edit-offer/' + offerId;
        this.router.navigate([route]);  
      }
    }else{
      let route = 'HR/offer/edit-offer/' + offerId;
      this.router.navigate([route]);
    }
  }

  viewOffer(offerId: any) {
    let route = 'HR/offer/view-offer/' + offerId;
    this.router.navigate([route]);
  }

  printOffer(offerId: any) {
    let route = 'HR/offer/print-offer/' + offerId;
    this.router.navigate([route]);
  }
  
  printApproval(offerId: any) {
    let route = 'HR/offer/print-approval/' + offerId;
    this.router.navigate([route]);
  }

  enterDetails(offerId: any, guid: string){
    let route = 'HR/appointment/add/' + offerId+"/"+guid;
    this.router.navigate([route]);
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

  withdraw(id) {
    this.offerId = id;
    this.comments = "";
    this.action = "Withdrawn";
  }

  archive(id) {
    this.offerId = id;
    this.comments = "";
    this.action = "Archived";
  }

  performTask() {
    if(this.comments == ""){
      toastr.error("Please enter comments."); return;
    }
    var confirmMsg = this.action == "Withdrawn" ? "Are you sure you want to withdraw this?"
      : "Are you sure you want to archive this?";

    $("#CommentsModal").modal('hide');
    if (confirm(confirmMsg)) {
      var request = {} as OfferUpdateRequest;
      request.offerId = this.offerId;
      request.comments = this.comments;
      request.status = this.action;
      request.modifiedById = this.currentUser.uid;
      swal("Updating...");
      this.httpService.HRpost(APIURLS.OFFER_DETAILS_UPDATE_STATUS, request).then((data: any) => {
        if (data == 200 || data.success) {
          this.getOfferList();
          swal("Successfully " + this.action);
        } else if (!data.success) {
          swal(data.message);
        } else
          swal("Error occurred.");
      }).catch(error => {
        swal(error);
      });
    }
  }

  submitForApproval(id) {
    if (confirm("Are you sure you want to submit this for approval?")) {
      var request: any = {};
      request.offerId = id;
      request.submittedById = this.currentUser.uid;
      swal("Submitting...");
      this.httpService.HRpost(APIURLS.OFFER_DETAILS_SUBMIT_FOR_APPROVAL, request)
        .then((data: any) => {
          if (data == 200 || data.success) {
            this.getOfferList();
            swal("Successfully submitted for approval.");
          } else if (!data.success) {
            swal(data.message);
          } else
            swal("Error occurred.");
        }).catch(error => {
          swal(error);
        });
    }
  }

  sendEntryEmail(id) {
    if (confirm("Are you sure you want to send details entry email?")) {
      var request: any = {};
      request.offerId = id;
      request.submittedById = this.currentUser.uid;
      request.submittedByName = this.currentUser.fullName;
      swal("Sending email...");
      this.httpService.HRpost(APIURLS.OFFER_DETAILS_SEND_CANDIDATE_ENTRY_EMAIL, request).then((data: any) => {
        if (data == 200 || data.success) {
          this.getOfferList();
          swal("Successfully emailed the details entry link to the candidate.");
        } else if (!data.success) {
          swal(data.message);
        } else
          swal("Error occurred.");
      }).catch(error => {
        swal(error);
      });
    }
  }

  exportData(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.OFFER_GET_OFFERS_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      data.list.forEach(item => {
        index=index+1;
        let exportItem={
          "SNo":index,
          "Offer ID": item.offerId,
          "Status": item.status,
          "Pending With / Updated By": item.pendingWith == null ? item.modifiedByFirstName +" "+item.modifiedByMiddleName +" "+item.modifiedByLastName
          : item.pendingWith,
          "Letter Printed": item.printed == true ? "Yes" : "No",
          "Letter Emailed": item.emailed == true ? "Yes" : "No",
          "Letter Downloaded": item.downloaded == true ? "Yes" : "No",
          "Created Date": this.setDateFormate(item.createdDate),
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
          "Replacing Emp. Name": item.replacingEmployeeName,
          "Replacing Emp. Plant": item.replacingEmployeePlantCode + " "+ item.replacingEmployeePlantName,
          "Replacing Emp. Department": item.replacingEmployeeDepartment,
          "Replacing Emp. Designation": item.replacingEmployeeDesignation,
          "Replacing Emp. Salary": item.replacingEmployeeCurrentCTC,
          "Replacing Emp. DOR": this.setDateFormate(item.replacingEmployeeDOR),
          "Replacing Emp. DOL": this.setDateFormate(item.replacingEmployeeDOL),
          "Tentative Joining Date": this.setDateFormate(item.joiningDate),
          "Accepted Joining Date": this.setDateFormate(item.acceptedDOJ),
          "Not-Accepted Reason": item.notAcceptedReason
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'Offers_List'); 
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;   
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');   
      return;
    });    
  }

  downloadApprovalForm(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.OFFER_GET_OFFERS_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      data.list.forEach(item => {
        index=index+1;
        let exportItem={
          "Sl. No":index,
          "Offer ID":item.offerId,       
          "Status": item.status,          
          "Pending With / Updated By": item.pendingApprovers.length <= 0 ? item.modifiedByFirstName +" "+item.modifiedByMiddleName +" "+item.modifiedByLastName
          : item.pendingApprovers.map(a=>a.approverFirstName+" "+a.approverMiddleName+" "+a.approverLastName+" ("+a.approverEmployeeNo+")").join(', '),
          "Plant Name": item.plantName,
          "Location": item.location,
          "Department": item.department,
          "Candidate Name": item.firstName + ' '+(item.middleName == null ? "":item.middleName) + ' '+ (item.lastName == null ? "" : item.lastName),
          "Qualification": item.qualification,          
          "Experience": item.totalExperience + ' years',
          "Designation Present": item.presentDesignation,
          "Salary Present": item.presentCTC,
          "Designation Proposed": item.designation,
          "Salary Proposed": item.salaryType + ' '+ item.packageType +' ' + item.offeredSalary,
          "Replacement/New": item.recruitmentType,
          "Replacing Emp. No": item.replacingEmployeeNumber,
          "Replacing Emp. Name": item.replacingEmployeeName,
          "Replacing Emp. Plant": item.replacingEmployeePlantCode + " "+ item.replacingEmployeePlantName,
          "Replacing Emp. Department": item.replacingEmployeeDepartment,
          "Replacing Emp. Designation": item.replacingEmployeeDesignation,
          "Replacing Emp. Salary": item.replacingEmployeeCurrentCTC,
          "Replacing Emp. DOR": this.setDateFormate(item.replacingEmployeeDOR),
          "Replacing Emp. DOL": this.setDateFormate(item.replacingEmployeeDOL)
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'RecruitmentApproval_FS_List'); 
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;   
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');   
      return;
    });    
  }

  downloadOSApprovalForm(){
    this.filterModel.export = true;
    this.isLoading = true;    
    this.httpService.HRpost(APIURLS.OFFER_GET_OFFERS_LIST_BY_FILTER, this.filterModel).then((data: any) => {
      this.filterModel.export = false;
      var exportList=[];
      let index=0;
      data.list.forEach(item => {
        index=index+1;
        let exportItem={
          "Sl. No":index,
          "Offer ID":item.offerId, 
          "Status": item.status,
          "Pending With / Updated By": item.pendingApprovers.length <= 0 ? item.modifiedByFirstName +" "+item.modifiedByMiddleName +" "+item.modifiedByLastName
          : item.pendingApprovers.map(a=>a.approverFirstName+" "+a.approverMiddleName+" "+a.approverLastName+" ("+a.approverEmployeeNo+")").join(', '),
          "Pay Group":item.payGroupName,
          "Staff Category":item.employeeCategoryName,          
          "Department": item.department,
          "Candidate Name": item.firstName + ' '+(item.middleName == null ? "":item.middleName) + ' '+ (item.lastName == null ? "" : item.lastName),
          "Qualification": item.qualification,          
          "Total Experience": item.totalExperience + ' years',
          "Current Company": item.presentEmployer,
          "Current Designation": item.presentDesignation,
          "Current Salary": item.presentCTC,
          "Current Company Experience": item.totalExperience + ' years',
          "Offered Designation": item.designation,
          "Offered Salary": item.salaryType + ' '+ item.packageType +' ' + item.offeredSalary,
          "Recruitment Type": item.recruitmentType,
          "Replacing Emp. No": item.replacingEmployeeNumber,
          "Replacing Emp. Name": item.replacingEmployeeName,
          "Replacing Emp. Plant": item.replacingEmployeePlantCode + " "+ item.replacingEmployeePlantName,
          "Replacing Emp. Department": item.replacingEmployeeDepartment,
          "Replacing Emp. Designation": item.replacingEmployeeDesignation,
          "Replacing Emp. Salary": item.replacingEmployeeCurrentCTC,
          "Replacing Emp. DOR": this.setDateFormate(item.replacingEmployeeDOR),
          "Replacing Emp. DOL": this.setDateFormate(item.replacingEmployeeDOL)      
        };
          exportList.push(exportItem);
      });
      this.excelService.exportAsExcelFile(exportList, 'RecruitmentApproval_OS_Plant_List'); 
      this.isLoading = false;
    }).catch(error => {
      this.isLoading = false;   
      this.filterModel.export = false;
      swal('Error occurred while fetching data.');   
      return;
    });    
  }

  setDateFormate(date: any): string {
    if(date == "" || date == null || date == undefined) return "";
    let d1 = new Date(date);
    return ("00" + d1.getDate()).slice(-2) + "-" + ("00" + (d1.getMonth() + 1)).slice(-2) + "-" +
      d1.getFullYear();
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
